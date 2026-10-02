import { NOTIFIER_CONFIG } from '../../../const/config'
import type {
  SystemSnapshotState,
  NotificationEvent,
  VisitsRecordPayload
} from '../../../types'

/**
 * Pure detector that determines if today's platform visits exceed all-time historical daily records.
 * Can only trigger at most once per calendar day.
 */
export function detectVisitsRecord(
  todayVisits: number,
  todayDateStr: string,
  previousSnapshot: SystemSnapshotState | null
): Array<Omit<NotificationEvent<VisitsRecordPayload>, 'id' | 'createdAt' | 'updatedAt' | 'attempts'>> {
  if (!previousSnapshot || !todayVisits || todayVisits <= 0) {
    return [] // Baseline or invalid visits
  }

  const prevRecord = previousSnapshot.visits.maxDailyRecord || 0
  if (todayVisits <= prevRecord || prevRecord === 0) {
    return []
  }

  // Margin threshold: Must be at least 5% higher than previous record or at least +50 visits
  const growth = ((todayVisits - prevRecord) / prevRecord) * 100
  if (growth < 5 && todayVisits - prevRecord < 50) {
    return []
  }

  return [{
    eventType: 'visits_record',
    dedupeKey: `visits_record:${todayDateStr}`,
    payload: {
      date: todayDateStr,
      totalVisits: todayVisits,
      previousRecord: prevRecord,
      growthPercentage: growth
    },
    priority: 'medium',
    status: 'pending',
    maxAttempts: NOTIFIER_CONFIG.maxRetryAttempts,
    scheduledFor: new Date().toISOString()
  }]
}
