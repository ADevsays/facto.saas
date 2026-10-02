import { NOTIFIER_CONFIG } from '../../const/config'
import type { TelegramSendMessageOptions, TelegramResponse, TelegramMessageResult } from '../../types'

export interface TelegramClientOptions {
  botToken?: string
  channelId?: string | number
  adminChatId?: string | number
  dryRun?: boolean
  fetchFn?: typeof fetch
}

export class TelegramClient {
  private botToken: string
  private defaultChannelId: string | number
  private adminChatId?: string | number
  private dryRun: boolean
  private fetchFn: typeof fetch
  private lastSendTimestamp = 0

  constructor(options: TelegramClientOptions = {}) {
    this.botToken = options.botToken || process.env.TELEGRAM_BOT_TOKEN || ''
    this.defaultChannelId = options.channelId || process.env.TELEGRAM_CHANNEL_ID || ''
    this.adminChatId = options.adminChatId || process.env.TELEGRAM_ADMIN_CHAT_ID || ''
    this.dryRun = options.dryRun !== undefined
      ? options.dryRun
      : (process.env.NOTIFIER_DRY_RUN !== 'false' && process.env.NOTIFIER_ENABLED !== 'true')
    this.fetchFn = options.fetchFn || globalThis.fetch
  }

  isConfigured(): boolean {
    return Boolean(this.botToken && this.defaultChannelId)
  }

  isAdminConfigured(): boolean {
    return Boolean(this.botToken && this.adminChatId)
  }

  isDryRun(): boolean {
    return this.dryRun
  }

  setDryRun(val: boolean) {
    this.dryRun = val
  }

  /**
   * Enforces client-side rate limiting (~1 message per second).
   */
  private async enforceRateLimit(): Promise<void> {
    const now = Date.now()
    const elapsed = now - this.lastSendTimestamp
    if (elapsed < NOTIFIER_CONFIG.rateLimitDelayMs) {
      const waitTime = NOTIFIER_CONFIG.rateLimitDelayMs - elapsed
      await new Promise(resolve => setTimeout(resolve, waitTime))
    }
    this.lastSendTimestamp = Date.now()
  }

  /**
   * Sends a message to Telegram with retry, backoff, and 429/400/403 handling.
   */
  async sendMessage(options: TelegramSendMessageOptions): Promise<TelegramMessageResult> {
    const chatId = options.chatId || this.defaultChannelId

    if (this.dryRun) {
      // Dry-run mode: Log and return a simulated message result
      return {
        message_id: Math.floor(Date.now() / 1000),
        date: Math.floor(Date.now() / 1000),
        chat: {
          id: Number(chatId) || 0,
          title: 'Dry Run Channel',
          type: 'channel'
        }
      }
    }

    if (!this.botToken) {
      throw new Error('Telegram bot token is not configured (TELEGRAM_BOT_TOKEN is missing)')
    }

    if (!chatId) {
      throw new Error('Telegram target chatId is not specified')
    }

    let attempt = 0
    let delay = NOTIFIER_CONFIG.retryInitialDelayMs

    while (attempt < NOTIFIER_CONFIG.maxRetryAttempts) {
      attempt++
      await this.enforceRateLimit()

      try {
        const url = `${NOTIFIER_CONFIG.telegramApiBase}/bot${this.botToken}/sendMessage`
        const disablePreview = options.disableWebPagePreview ?? false
        const preferLarge = options.preferLargeMedia ?? true
        const preferSmall = options.preferSmallMedia ?? false
        const showAboveText = options.showAboveText ?? false
        const response = await this.fetchFn(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text: options.text,
            parse_mode: options.parseMode || 'HTML',
            link_preview_options: {
              is_disabled: disablePreview,
              prefer_large_media: preferLarge,
              prefer_small_media: preferSmall,
              show_above_text: showAboveText
            }
          })
        })

        const data = (await response.json()) as TelegramResponse<TelegramMessageResult>

        if (response.ok && data.ok && data.result) {
          return data.result
        }

        // Handle specific Telegram HTTP status codes
        if (response.status === 429) {
          const retryAfterSec = data.parameters?.retry_after || 5
          await new Promise(resolve => setTimeout(resolve, retryAfterSec * 1000))
          continue
        }

        // Fatal non-retryable errors (400 Bad Request / 403 Forbidden / Not admin)
        if (response.status === 400 || response.status === 403) {
          const errMsg = `Telegram Fatal Error [${response.status}]: ${data.description || response.statusText}`
          const fatalErr = new Error(errMsg)
          ;(fatalErr as any).isFatal = true
          ;(fatalErr as any).statusCode = response.status
          throw fatalErr
        }

        // Server error (5xx)
        if (response.status >= 500) {
          if (attempt >= NOTIFIER_CONFIG.maxRetryAttempts) {
            throw new Error(`Telegram Server Error [${response.status}] after ${attempt} attempts: ${data.description || response.statusText}`)
          }
          await new Promise(resolve => setTimeout(resolve, delay))
          delay *= 2
          continue
        }

        throw new Error(`Telegram API Error [${response.status}]: ${data.description || 'Unknown error'}`)
      } catch (err: any) {
        if (err.isFatal) throw err
        if (attempt >= NOTIFIER_CONFIG.maxRetryAttempts) throw err
        await new Promise(resolve => setTimeout(resolve, delay))
        delay *= 2
      }
    }

    throw new Error(`Failed to send Telegram message after ${NOTIFIER_CONFIG.maxRetryAttempts} attempts`)
  }

  /**
   * Sends an urgent alert message directly to the admin chat.
   */
  async sendAdminAlert(message: string): Promise<void> {
    if (!this.adminChatId) {
      console.warn('[TelegramClient] Admin chat ID not configured, alert skipped:', message)
      return
    }

    try {
      await this.sendMessage({
        chatId: this.adminChatId,
        text: `🚨 <b>Alerta Sistema Facto Notifier</b>\n\n${message}`,
        parseMode: 'HTML'
      })
    } catch (err: any) {
      console.error('[TelegramClient] Failed to send admin alert:', err.message)
    }
  }
}
