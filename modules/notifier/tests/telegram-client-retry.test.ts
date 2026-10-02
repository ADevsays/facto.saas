import { describe, it } from 'node:test'
import assert from 'node:assert'
import { TelegramClient } from '../server/services/telegram.client'

describe('Telegram Client Network & Retry Logic', () => {
  it('should return simulated message result in dry-run mode without invoking fetch', async () => {
    let fetchCalled = false
    const mockFetch = async () => {
      fetchCalled = true
      return new Response('{}', { status: 200 })
    }

    const client = new TelegramClient({
      botToken: 'fake-token',
      channelId: '@testchannel',
      dryRun: true,
      fetchFn: mockFetch as any
    })

    const result = await client.sendMessage({
      chatId: '@testchannel',
      text: 'Test message in dry run'
    })

    assert.strictEqual(fetchCalled, false)
    assert.ok(result.message_id > 0)
    assert.strictEqual(result.chat.type, 'channel')
  })

  it('should handle 429 Too Many Requests by reading retry_after and retrying successfully', async () => {
    let callCount = 0
    const mockFetch = async () => {
      callCount++
      if (callCount === 1) {
        // Return 429 with retry_after = 0.01 sec
        return new Response(
          JSON.stringify({
            ok: false,
            error_code: 429,
            description: 'Too Many Requests',
            parameters: { retry_after: 0.01 }
          }),
          { status: 429 }
        )
      }
      return new Response(
        JSON.stringify({
          ok: true,
          result: {
            message_id: 12345,
            date: Math.floor(Date.now() / 1000),
            chat: { id: 100, type: 'channel' }
          }
        }),
        { status: 200 }
      )
    }

    const client = new TelegramClient({
      botToken: 'fake-token',
      channelId: '@testchannel',
      dryRun: false,
      fetchFn: mockFetch as any
    })

    const result = await client.sendMessage({
      chatId: '@testchannel',
      text: 'Message that encountered 429 once'
    })

    assert.strictEqual(callCount, 2)
    assert.strictEqual(result.message_id, 12345)
  })

  it('should treat 400 and 403 as non-retryable fatal errors', async () => {
    let callCount = 0
    const mockFetch = async () => {
      callCount++
      return new Response(
        JSON.stringify({
          ok: false,
          error_code: 403,
          description: 'Forbidden: bot was kicked from the channel'
        }),
        { status: 403 }
      )
    }

    const client = new TelegramClient({
      botToken: 'fake-token',
      channelId: '@testchannel',
      dryRun: false,
      fetchFn: mockFetch as any
    })

    await assert.rejects(
      async () => {
        await client.sendMessage({
          chatId: '@testchannel',
          text: 'Message that will fail with 403'
        })
      },
      (err: any) => {
        assert.strictEqual(err.isFatal, true)
        assert.strictEqual(err.statusCode, 403)
        return true
      }
    )

    // Ensure it stopped immediately without redundant retries
    assert.strictEqual(callCount, 1)
  })
})
