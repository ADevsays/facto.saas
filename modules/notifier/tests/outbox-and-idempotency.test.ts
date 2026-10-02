import { describe, it } from 'node:test'
import assert from 'node:assert'
import { MemoryStorageProvider } from '../server/db/memory.storage'
import { OutboxService } from '../server/services/outbox.service'
import { TelegramClient } from '../server/services/telegram.client'
import { AntiSpamService } from '../server/services/anti-spam.service'

describe('Outbox Queue & Idempotency', () => {
  it('should enforce idempotency by rejecting duplicate dedupe keys', async () => {
    const storage = new MemoryStorageProvider()
    const item = {
      eventType: 'new_startup' as const,
      dedupeKey: 'new_startup:unique-123',
      payload: { startups: [{ id: 'unique-123', name: 'Test SaaS', slug: 'test-saas', category: 'Dev', currency: 'USD', isIncognito: false, mrr: 100 }] },
      priority: 'high' as const,
      status: 'pending' as const,
      maxAttempts: 3,
      scheduledFor: new Date().toISOString()
    }

    const first = await storage.enqueueEvent(item)
    assert.ok(first !== null)
    assert.strictEqual(first?.dedupeKey, 'new_startup:unique-123')

    // Second insertion with identical dedupeKey
    const duplicate = await storage.enqueueEvent(item)
    assert.strictEqual(duplicate, null)

    const pending = await storage.getPendingEvents()
    assert.strictEqual(pending.length, 1)
  })

  it('should prioritize high-priority events over medium and low in the outbox', async () => {
    const storage = new MemoryStorageProvider()

    await storage.enqueueEvent({
      eventType: 'visits_record',
      dedupeKey: 'dedupe:low',
      payload: { date: '2026-09-28', totalVisits: 100, previousRecord: 50, growthPercentage: 100 },
      priority: 'low',
      status: 'pending',
      maxAttempts: 3,
      scheduledFor: new Date().toISOString()
    })

    await storage.enqueueEvent({
      eventType: 'new_startup',
      dedupeKey: 'dedupe:high',
      payload: { startups: [{ id: '1', name: 'High SaaS', slug: 'high-saas', category: 'AI', currency: 'USD', isIncognito: false, mrr: 500 }] },
      priority: 'high',
      status: 'pending',
      maxAttempts: 3,
      scheduledFor: new Date().toISOString()
    })

    const pending = await storage.getPendingEvents()
    assert.strictEqual(pending.length, 2)
    assert.strictEqual(pending[0].priority, 'high')
    assert.strictEqual(pending[1].priority, 'low')
  })

  it('should prevent concurrent outbox processing using distributed locks', async () => {
    const storage = new MemoryStorageProvider()
    const client = new TelegramClient({ dryRun: true })
    const outbox = new OutboxService(storage, client, new AntiSpamService({ ignoreSilenceHours: true }))

    await storage.enqueueEvent({
      eventType: 'new_startup',
      dedupeKey: 'dedupe:lock-test',
      payload: { startups: [{ id: '1', name: 'Lock SaaS', slug: 'lock-saas', category: 'AI', currency: 'USD', isIncognito: false, mrr: 500 }] },
      priority: 'high',
      status: 'pending',
      maxAttempts: 3,
      scheduledFor: new Date().toISOString()
    })

    // Simulate external lock already held by another worker
    await storage.acquireLock('notifier_outbox_lock', 'other-worker', 60)

    const res = await outbox.processOutbox()
    assert.strictEqual(res.processed, 0)
    assert.strictEqual(res.sent, 0)

    // Release lock
    await storage.releaseLock('notifier_outbox_lock', 'other-worker')

    // Now it should acquire and process
    const resAfterRelease = await outbox.processOutbox()
    assert.strictEqual(resAfterRelease.processed, 1)
    assert.strictEqual(resAfterRelease.sent, 1)
  })
})
