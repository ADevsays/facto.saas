import { supabase } from '~/server/lib/supabase'
import type { StorageProvider } from './storage.interface'
import type { NotificationEvent, SystemSnapshotState, EventStatus } from '../../types'
import { MemoryStorageProvider } from './memory.storage'

function isTableMissingError(err: any): boolean {
  if (!err) return false
  const code = err.code || err.statusCode
  const msg = (err.message || '').toLowerCase()
  return (
    code === '42P01' ||
    code === 'PGRST205' ||
    code === 'PGRST200' ||
    msg.includes('could not find the table') ||
    msg.includes('schema cache') ||
    msg.includes('does not exist')
  )
}

export class SupabaseStorageProvider implements StorageProvider {
  private fallbackMemory = new MemoryStorageProvider()
  private isSupabaseTableMissing = false

  async enqueueEvent<T = any>(item: Omit<NotificationEvent<T>, 'id' | 'createdAt' | 'updatedAt' | 'attempts'>): Promise<NotificationEvent<T> | null> {
    if (this.isSupabaseTableMissing) {
      return this.fallbackMemory.enqueueEvent(item)
    }

    try {
      const { data, error } = await supabase
        .from('notification_events')
        .insert({
          event_type: item.eventType,
          dedupe_key: item.dedupeKey,
          payload: item.payload,
          priority: item.priority,
          status: item.status,
          max_attempts: item.maxAttempts,
          scheduled_for: item.scheduledFor
        })
        .select('*')
        .single()

      if (error) {
        if (error.code === '23505') {
          // Unique violation -> already enqueued
          return null
        }
        if (isTableMissingError(error)) {
          this.isSupabaseTableMissing = true
          return this.fallbackMemory.enqueueEvent(item)
        }
        throw error
      }

      return {
        id: data.id,
        eventType: data.event_type,
        dedupeKey: data.dedupe_key,
        payload: data.payload,
        priority: data.priority,
        status: data.status,
        attempts: data.attempts,
        maxAttempts: data.max_attempts,
        lastError: data.last_error,
        skipReason: data.skip_reason,
        telegramMessageId: data.telegram_message_id,
        scheduledFor: data.scheduled_for,
        processedAt: data.processed_at,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      }
    } catch (err: any) {
      if (isTableMissingError(err)) {
        this.isSupabaseTableMissing = true
        return this.fallbackMemory.enqueueEvent(item)
      }
      throw err
    }
  }

  async getPendingEvents(limit = 50): Promise<NotificationEvent[]> {
    if (this.isSupabaseTableMissing) {
      return this.fallbackMemory.getPendingEvents(limit)
    }

    try {
      const now = new Date().toISOString()
      const { data, error } = await supabase
        .from('notification_events')
        .select('*')
        .eq('status', 'pending')
        .lte('scheduled_for', now)
        .order('priority', { ascending: false })
        .order('created_at', { ascending: true })
        .limit(limit)

      if (error) {
        if (isTableMissingError(error)) {
          this.isSupabaseTableMissing = true
          return this.fallbackMemory.getPendingEvents(limit)
        }
        throw error
      }

      return (data || []).map((row: any) => ({
        id: row.id,
        eventType: row.event_type,
        dedupeKey: row.dedupe_key,
        payload: row.payload,
        priority: row.priority,
        status: row.status,
        attempts: row.attempts,
        maxAttempts: row.max_attempts,
        lastError: row.last_error,
        skipReason: row.skip_reason,
        telegramMessageId: row.telegram_message_id,
        scheduledFor: row.scheduled_for,
        processedAt: row.processed_at,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      }))
    } catch (err: any) {
      if (isTableMissingError(err)) {
        this.isSupabaseTableMissing = true
        return this.fallbackMemory.getPendingEvents(limit)
      }
      throw err
    }
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
    if (this.isSupabaseTableMissing) {
      return this.fallbackMemory.updateEventStatus(id, update)
    }

    try {
      const updateData: Record<string, any> = {
        status: update.status,
        updated_at: new Date().toISOString()
      }
      if (update.attempts !== undefined) updateData.attempts = update.attempts
      if (update.lastError !== undefined) updateData.last_error = update.lastError
      if (update.skipReason !== undefined) updateData.skip_reason = update.skipReason
      if (update.telegramMessageId !== undefined) updateData.telegram_message_id = update.telegramMessageId
      if (update.processedAt !== undefined) updateData.processed_at = update.processedAt

      const { error } = await supabase
        .from('notification_events')
        .update(updateData)
        .eq('id', id)

      if (error) {
        if (isTableMissingError(error)) {
          this.isSupabaseTableMissing = true
          return this.fallbackMemory.updateEventStatus(id, update)
        }
        throw error
      }
    } catch (err: any) {
      if (isTableMissingError(err)) {
        this.isSupabaseTableMissing = true
        return this.fallbackMemory.updateEventStatus(id, update)
      }
      throw err
    }
  }

  async countSentMilestonesToday(todayDateStr: string): Promise<number> {
    if (this.isSupabaseTableMissing) {
      return this.fallbackMemory.countSentMilestonesToday(todayDateStr)
    }

    try {
      const { count, error } = await supabase
        .from('notification_events')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'sent')
        .neq('event_type', 'digest')
        .gte('processed_at', `${todayDateStr}T00:00:00Z`)
        .lte('processed_at', `${todayDateStr}T23:59:59Z`)

      if (error) {
        if (isTableMissingError(error)) {
          this.isSupabaseTableMissing = true
          return this.fallbackMemory.countSentMilestonesToday(todayDateStr)
        }
        throw error
      }

      return count || 0
    } catch (err: any) {
      if (isTableMissingError(err)) {
        this.isSupabaseTableMissing = true
        return this.fallbackMemory.countSentMilestonesToday(todayDateStr)
      }
      throw err
    }
  }

  async getLatestSnapshot(type = 'milestone'): Promise<{ id: string; state: SystemSnapshotState; createdAt: string } | null> {
    if (this.isSupabaseTableMissing) {
      return this.fallbackMemory.getLatestSnapshot(type)
    }

    try {
      const { data, error } = await supabase
        .from('notification_snapshots')
        .select('*')
        .eq('snapshot_type', type)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (error) {
        if (error.code === 'PGRST116') return null // No rows found
        if (isTableMissingError(error)) {
          this.isSupabaseTableMissing = true
          return this.fallbackMemory.getLatestSnapshot(type)
        }
        throw error
      }

      return {
        id: data.id,
        state: data.state,
        createdAt: data.created_at
      }
    } catch (err: any) {
      if (isTableMissingError(err)) {
        this.isSupabaseTableMissing = true
        return this.fallbackMemory.getLatestSnapshot(type)
      }
      throw err
    }
  }

  async saveSnapshot(state: SystemSnapshotState, type = 'milestone'): Promise<void> {
    if (this.isSupabaseTableMissing) {
      return this.fallbackMemory.saveSnapshot(state, type)
    }

    try {
      const { error } = await supabase
        .from('notification_snapshots')
        .insert({
          snapshot_type: type,
          state
        })

      if (error) {
        if (isTableMissingError(error)) {
          this.isSupabaseTableMissing = true
          return this.fallbackMemory.saveSnapshot(state, type)
        }
        throw error
      }
    } catch (err: any) {
      if (isTableMissingError(err)) {
        this.isSupabaseTableMissing = true
        return this.fallbackMemory.saveSnapshot(state, type)
      }
      throw err
    }
  }

  async acquireLock(lockKey: string, owner: string, ttlSeconds: number): Promise<boolean> {
    if (this.isSupabaseTableMissing) {
      return this.fallbackMemory.acquireLock(lockKey, owner, ttlSeconds)
    }

    try {
      const now = new Date()
      const expiresAt = new Date(now.getTime() + ttlSeconds * 1000).toISOString()

      // Try inserting lock or updating if expired
      const { data: existing, error: fetchErr } = await supabase
        .from('notification_locks')
        .select('*')
        .eq('lock_key', lockKey)
        .single()

      if (fetchErr && isTableMissingError(fetchErr)) {
        this.isSupabaseTableMissing = true
        return this.fallbackMemory.acquireLock(lockKey, owner, ttlSeconds)
      }

      if (existing) {
        if (new Date(existing.expires_at).getTime() > Date.now() && existing.owner !== owner) {
          return false
        }
        const { error } = await supabase
          .from('notification_locks')
          .update({
            owner,
            acquired_at: now.toISOString(),
            expires_at: expiresAt
          })
          .eq('lock_key', lockKey)

        return !error
      } else {
        const { error } = await supabase
          .from('notification_locks')
          .insert({
            lock_key: lockKey,
            owner,
            acquired_at: now.toISOString(),
            expires_at: expiresAt
          })

        return !error
      }
    } catch (err: any) {
      if (isTableMissingError(err)) {
        this.isSupabaseTableMissing = true
        return this.fallbackMemory.acquireLock(lockKey, owner, ttlSeconds)
      }
      return false
    }
  }

  async releaseLock(lockKey: string, owner: string): Promise<boolean> {
    if (this.isSupabaseTableMissing) {
      return this.fallbackMemory.releaseLock(lockKey, owner)
    }

    try {
      const { error } = await supabase
        .from('notification_locks')
        .delete()
        .eq('lock_key', lockKey)
        .eq('owner', owner)

      return !error
    } catch (err: any) {
      if (isTableMissingError(err)) {
        this.isSupabaseTableMissing = true
        return this.fallbackMemory.releaseLock(lockKey, owner)
      }
      return false
    }
  }
}
