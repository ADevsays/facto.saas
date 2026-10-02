import type { NotificationEvent, SystemSnapshotState, EventStatus } from '../../types'

export interface StorageProvider {
  enqueueEvent<T = any>(event: Omit<NotificationEvent<T>, 'id' | 'createdAt' | 'updatedAt' | 'attempts'>): Promise<NotificationEvent<T> | null>
  getPendingEvents(limit?: number): Promise<NotificationEvent[]>
  updateEventStatus(
    id: string,
    update: {
      status: EventStatus
      attempts?: number
      lastError?: string | null
      skipReason?: string | null
      telegramMessageId?: number | null
      processedAt?: string
    }
  ): Promise<void>
  countSentMilestonesToday(todayDateStr: string): Promise<number>

  // Snapshot operations
  getLatestSnapshot(type?: string): Promise<{ id: string; state: SystemSnapshotState; createdAt: string } | null>
  saveSnapshot(state: SystemSnapshotState, type?: string): Promise<void>

  // Distributed Lock operations
  acquireLock(lockKey: string, owner: string, ttlSeconds: number): Promise<boolean>
  releaseLock(lockKey: string, owner: string): Promise<boolean>
}
