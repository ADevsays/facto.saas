import { NOTIFIER_CONFIG } from '../../const/config'
import type { StorageProvider } from '../db/storage.interface'
import { TelegramClient } from './telegram.client'
import { AntiSpamService } from './anti-spam.service'
import {
  renderNewStartupMessage,
  renderCountryRecordMessage,
  renderRankingMoveMessage,
  renderVisitsRecordMessage,
  renderOpportunityMessage,
  renderDailyDigestMessage,
  type RenderResult
} from './formatters/message.templates'
import { splitMessageIntoChunks } from './formatters/html.formatter'
import type { NotificationEvent } from '../../types'

export class OutboxService {
  private storage: StorageProvider
  private telegramClient: TelegramClient
  private antiSpam: AntiSpamService

  constructor(
    storage: StorageProvider,
    telegramClient: TelegramClient,
    antiSpam = new AntiSpamService()
  ) {
    this.storage = storage
    this.telegramClient = telegramClient
    this.antiSpam = antiSpam
  }

  /**
   * Renders the event payload into formatted Telegram HTML.
   */
  renderEvent(event: NotificationEvent): RenderResult {
    switch (event.eventType) {
      case 'new_startup':
        return renderNewStartupMessage(event.payload as any)
      case 'country_record':
        return renderCountryRecordMessage(event.payload as any)
      case 'ranking_move':
        return renderRankingMoveMessage(event.payload as any)
      case 'visits_record':
        return renderVisitsRecordMessage(event.payload as any)
      case 'opportunity':
        return renderOpportunityMessage(event.payload as any)
      case 'digest':
        return renderDailyDigestMessage(event.payload as any)
      default:
        return { text: '', valid: false, skipReason: `Unknown event type: ${event.eventType}` }
    }
  }

  /**
   * Processes all pending events from the outbox with locking, rate limiting, and error handling.
   */
  async processOutbox(limit = 20): Promise<{ processed: number; sent: number; skipped: number; failed: number }> {
    const lockKey = 'notifier_outbox_lock'
    const workerId = `worker-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`
    const lockAcquired = await this.storage.acquireLock(lockKey, workerId, NOTIFIER_CONFIG.lockTtlSeconds)

    if (!lockAcquired) {
      console.log('[OutboxService] Another instance is currently processing outbox, skipping run.')
      return { processed: 0, sent: 0, skipped: 0, failed: 0 }
    }

    let processed = 0
    let sent = 0
    let skipped = 0
    let failed = 0

    try {
      const pendingEvents = await this.storage.getPendingEvents(limit)
      if (pendingEvents.length === 0) {
        return { processed: 0, sent: 0, skipped: 0, failed: 0 }
      }

      const todayStr = new Date().toISOString().substring(0, 10)
      let sentMilestonesToday = await this.storage.countSentMilestonesToday(todayStr)

      for (const event of pendingEvents) {
        processed++

        // 1. Anti-spam / quiet hours check
        const antiSpamDecision = this.antiSpam.checkEventEligibility(event, sentMilestonesToday)
        if (!antiSpamDecision.allowed) {
          if (antiSpamDecision.shouldSkip) {
            await this.storage.updateEventStatus(event.id, {
              status: 'skipped',
              skipReason: antiSpamDecision.skipReason || 'Skipped by anti-spam rules'
            })
            skipped++
            continue
          } else {
            // Deferred (e.g. quiet hours) - leave as pending
            continue
          }
        }

        // 2. Render message template
        const renderResult = this.renderEvent(event)
        if (!renderResult.valid || !renderResult.text.trim()) {
          await this.storage.updateEventStatus(event.id, {
            status: 'skipped',
            skipReason: renderResult.skipReason || 'Rendered empty or invalid message'
          })
          skipped++
          continue
        }

        // 3. Send message(s) to Telegram (handling chunks if > 4096 chars)
        const chunks = splitMessageIntoChunks(renderResult.text, NOTIFIER_CONFIG.maxMessageLength)
        let lastMessageId: number | null = null
        let sendFailed = false
        let sendError: any = null

        for (const chunk of chunks) {
          try {
            const res = await this.telegramClient.sendMessage({
              chatId: process.env.TELEGRAM_CHANNEL_ID || '',
              text: chunk,
              parseMode: 'HTML'
            })
            lastMessageId = res.message_id
          } catch (err: any) {
            sendFailed = true
            sendError = err
            break
          }
        }

        if (sendFailed) {
          const newAttempts = (event.attempts || 0) + 1
          const isFatal = sendError?.isFatal || newAttempts >= event.maxAttempts

          await this.storage.updateEventStatus(event.id, {
            status: isFatal ? 'failed' : 'pending',
            attempts: newAttempts,
            lastError: sendError?.message || 'Unknown network error'
          })

          if (isFatal) {
            failed++
            await this.telegramClient.sendAdminAlert(
              `Error definitivo enviando evento <code>${event.eventType}</code> (ID: ${event.id}):\n${sendError?.message}`
            )
          }
        } else {
          // Success
          await this.storage.updateEventStatus(event.id, {
            status: 'sent',
            telegramMessageId: lastMessageId,
            processedAt: new Date().toISOString()
          })
          sent++
          if (event.eventType !== 'digest') {
            sentMilestonesToday++
          }
        }
      }
    } finally {
      await this.storage.releaseLock(lockKey, workerId)
    }

    return { processed, sent, skipped, failed }
  }
}
