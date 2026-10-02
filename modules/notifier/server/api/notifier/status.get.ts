import { NotifierOrchestrator } from '../../services/notifier.orchestrator'
import { NOTIFIER_CONFIG } from '../../../const/config'

export default defineEventHandler(async (event) => {
  const adminKey = getHeader(event, 'x-admin-key') || getQuery(event).secret
  const expectedSecret = process.env.ADMIN_SECRET_KEY

  if (expectedSecret && adminKey !== expectedSecret) {
    throw createError({ statusCode: 401, message: 'Unauthorized: Invalid admin key' })
  }

  const orchestrator = new NotifierOrchestrator()
  const todayStr = new Date().toISOString().substring(0, 10)

  try {
    const latestSnapshot = await orchestrator.snapshotService.getLatestSnapshot('milestone')
    const pendingEvents = await orchestrator.storage.getPendingEvents(20)
    const sentMilestonesToday = await orchestrator.storage.countSentMilestonesToday(todayStr)
    const isSilence = orchestrator.antiSpam.isSilenceHour()

    return {
      success: true,
      data: {
        config: {
          timezone: NOTIFIER_CONFIG.defaultTimezone,
          digestHour: NOTIFIER_CONFIG.digestHour,
          maxDailyMilestones: NOTIFIER_CONFIG.maxDailyMilestones,
          silenceHours: NOTIFIER_CONFIG.silenceHours,
          isDryRun: orchestrator.telegramClient.isDryRun(),
          isConfigured: orchestrator.telegramClient.isConfigured()
        },
        status: {
          isSilenceHourNow: isSilence,
          sentMilestonesToday,
          pendingEventsCount: pendingEvents.length,
          lastSnapshotDate: latestSnapshot?.date || null,
          lastSnapshotTimestamp: latestSnapshot?.timestamp || null,
          totalRankedStartups: latestSnapshot?.ranking?.length || 0,
          globalRevenue: latestSnapshot?.global?.totalRevenue || 0
        },
        pendingQueue: pendingEvents.map(e => ({
          id: e.id,
          eventType: e.eventType,
          dedupeKey: e.dedupeKey,
          priority: e.priority,
          attempts: e.attempts,
          lastError: e.lastError,
          scheduledFor: e.scheduledFor
        }))
      }
    }
  } catch (err: any) {
    throw createError({
      statusCode: 500,
      message: err.message || 'Error fetching notifier status'
    })
  }
})
