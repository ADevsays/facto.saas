import type { StorageProvider } from './storage.interface'
import type { NotificationEvent, SystemSnapshotState, EventStatus } from '../../types'

export class MemoryStorageProvider implements StorageProvider {
  private events: Map<string, NotificationEvent> = new Map()
  private snapshots: Array<{ id: string; type: string; state: SystemSnapshotState; createdAt: string }> = []
  private locks: Map<string, { owner: string; expiresAt: number }> = new Map()

  async enqueueEvent<T = any>(item: Omit<NotificationEvent<T>, 'id' | 'createdAt' | 'updatedAt' | 'attempts'>): Promise<NotificationEvent<T> | null> {
    for (const existing of this.events.values()) {
      if (existing.dedupeKey === item.dedupeKey) {
        return null // Deduplicated, already exists
      }
    }

    const now = new Date().toISOString()
    const id = `evt-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
    const record: NotificationEvent = {
      ...item,
      id,
      attempts: 0,
      createdAt: now,
      updatedAt: now
    }
    this.events.set(id, record)
    return record
  }

  async getPendingEvents(limit = 50): Promise<NotificationEvent[]> {
    const priorityWeight = { high: 3, medium: 2, low: 1 }
    const now = new Date().toISOString()

    const pending = Array.from(this.events.values())
      .filter(e => e.status === 'pending' && (!e.scheduledFor || e.scheduledFor <= now))
      .sort((a, b) => {
        const pDiff = (priorityWeight[b.priority] || 0) - (priorityWeight[a.priority] || 0)
        if (pDiff !== 0) return pDiff
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      })

    return pending.slice(0, limit)
  }

  async updateEventStatus(
    id: string,
    update: {
      status: EventStatus
      attempts?: number
      lastError?: string | null
      skipReason?: string | null
      telegramMessageId?: number | null
      processedAt?: string
    }
  ): Promise<void> {
    const event = this.events.get(id)
    if (!event) return

    if (update.status !== undefined) event.status = update.status
    if (update.attempts !== undefined) event.attempts = update.attempts
    if (update.lastError !== undefined) event.lastError = update.lastError
    if (update.skipReason !== undefined) event.skipReason = update.skipReason
    if (update.telegramMessageId !== undefined) event.telegramMessageId = update.telegramMessageId
    if (update.processedAt !== undefined) event.processedAt = update.processedAt
    event.updatedAt = new Date().toISOString()
  }

  async countSentMilestonesToday(todayDateStr: string): Promise<number> {
    let count = 0
    for (const e of this.events.values()) {
      if (e.status === 'sent' && e.eventType !== 'digest' && e.processedAt?.startsWith(todayDateStr)) {
        count++
      }
    }
    return count
  }

  async getLatestSnapshot(type = 'milestone'): Promise<{ id: string; state: SystemSnapshotState; createdAt: string } | null> {
    const matching = this.snapshots.filter(s => s.type === type)
    if (!matching.length) return null
    return matching[matching.length - 1]
  }

  async saveSnapshot(state: SystemSnapshotState, type = 'milestone'): Promise<void> {
    this.snapshots.push({
      id: `snap-${Date.now()}`,
      type,
      state: JSON.parse(JSON.stringify(state)),
      createdAt: new Date().toISOString()
    })
  }

  async acquireLock(lockKey: string, owner: string, ttlSeconds: number): Promise<boolean> {
    const now = Date.now()
    const current = this.locks.get(lockKey)
    if (current && current.expiresAt > now && current.owner !== owner) {
      return false
    }
    this.locks.set(lockKey, {
      owner,
      expiresAt: now + ttlSeconds * 1000
    })
    return true
  }

  async releaseLock(lockKey: string, owner: string): Promise<boolean> {
    const current = this.locks.get(lockKey)
    if (current && current.owner === owner) {
      this.locks.delete(lockKey)
      return true
    }
    return false
  }

  clear() {
    this.events.clear()
    this.snapshots = []
    this.locks.clear()
  }
}
