import { describe, it } from 'node:test'
import assert from 'node:assert'
import { AntiSpamService } from '../server/services/anti-spam.service'
import type { NotificationEvent } from '../types'

describe('Anti-Spam & Quiet Hours Window', () => {
  it('should identify silence hours correctly (e.g. 23:00 to 07:00)', () => {
    const service = new AntiSpamService()

    // 02:00 in America/Bogota (UTC-5) -> 07:00 UTC
    const dateAtNight = new Date('2026-09-28T07:00:00.000Z')
    assert.strictEqual(service.isSilenceHour(dateAtNight, 'America/Bogota'), true)

    // 14:00 in America/Bogota (UTC-5) -> 19:00 UTC
    const dateAtDay = new Date('2026-09-28T19:00:00.000Z')
    assert.strictEqual(service.isSilenceHour(dateAtDay, 'America/Bogota'), false)
  })

  it('should enforce max daily milestones cap (default 8)', () => {
    const service = new AntiSpamService()
    const mockEvent: NotificationEvent = {
      id: 'e-1',
      eventType: 'new_startup',
      dedupeKey: 'new_startup:test',
      payload: {},
      priority: 'high',
      status: 'pending',
      attempts: 0,
      maxAttempts: 3,
      scheduledFor: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    const daytime = new Date('2026-09-28T19:00:00.000Z')

    // When 7 sent today -> allowed
    const decisionUnderCap = service.checkEventEligibility(mockEvent, 7, daytime)
    assert.strictEqual(decisionUnderCap.allowed, true)

    // When 8 sent today -> exceeded
    const decisionAtCap = service.checkEventEligibility(mockEvent, 8, daytime)
    assert.strictEqual(decisionAtCap.allowed, false)
    assert.strictEqual(decisionAtCap.shouldSkip, true)
  })

  it('should always allow daily digest to execute', () => {
    const service = new AntiSpamService()
    const digestEvent: NotificationEvent = {
      id: 'e-digest',
      eventType: 'digest',
      dedupeKey: 'digest:today',
      payload: {},
      priority: 'high',
      status: 'pending',
      attempts: 0,
      maxAttempts: 3,
      scheduledFor: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    const nightTime = new Date('2026-09-28T07:00:00.000Z')
    const decision = service.checkEventEligibility(digestEvent, 10, nightTime)
    assert.strictEqual(decision.allowed, true)
  })
})
