import { NOTIFIER_CONFIG } from '../../../const/config'
import type {
  StartupSnapshotItem,
  SystemSnapshotState,
  NotificationEvent,
  NewStartupPayload
} from '../../../types'

/**
 * Pure detector that identifies newly added startups compared to previous snapshot.
 */
export function detectNewStartups(
  currentStartups: StartupSnapshotItem[],
  previousSnapshot: SystemSnapshotState | null
): Array<Omit<NotificationEvent<NewStartupPayload>, 'id' | 'createdAt' | 'updatedAt' | 'attempts'>> {
  if (!previousSnapshot) {
    return [] // First run / baseline: no historical events emitted
  }

  const previousIds = new Set(previousSnapshot.ranking.map(s => s.id))
  const newStartups = currentStartups.filter(s => !previousIds.has(s.id))

  if (newStartups.length === 0) {
    return []
  }

  const events: Array<Omit<NotificationEvent<NewStartupPayload>, 'id' | 'createdAt' | 'updatedAt' | 'attempts'>> = []
  const maxBatch = NOTIFIER_CONFIG.maxStartupsPerBatch

  // Batch startups into groups
  for (let i = 0; i < newStartups.length; i += maxBatch) {
    const batch = newStartups.slice(i, i + maxBatch)
    const idsKey = batch.map(s => s.id).sort().join('_')
    const dedupeKey = batch.length === 1
      ? `new_startup:${batch[0].id}`
      : `new_startup_batch:${idsKey}`

    const payload: NewStartupPayload = {
      startups: batch.map(s => ({
        id: s.id,
        name: s.name,
        slug: s.slug,
        category: s.category,
        country: s.countryName,
        countryFlag: s.countryFlag,
        mrr: s.mrr,
        currency: 'USD',
        isIncognito: s.isIncognito,
        description: s.description
      }))
    }

    events.push({
      eventType: 'new_startup',
      dedupeKey,
      payload,
      priority: 'high',
      status: 'pending',
      maxAttempts: NOTIFIER_CONFIG.maxRetryAttempts,
      scheduledFor: new Date().toISOString()
    })
  }

  return events
}
