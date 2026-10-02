import { NOTIFIER_CONFIG } from '../../const/config'
import type { NotificationEvent } from '../../types'

export interface AntiSpamDecision {
  allowed: boolean
  deferReason?: string
  shouldSkip?: boolean
  skipReason?: string
}

export class AntiSpamService {
  private ignoreSilenceHours: boolean

  constructor(options: { ignoreSilenceHours?: boolean } = {}) {
    this.ignoreSilenceHours = options.ignoreSilenceHours ?? false
  }

  /**
   * Evaluates if the current time is in the configured silence hours (e.g. 23:00 - 07:00).
   */
  isSilenceHour(date = new Date(), timezone = NOTIFIER_CONFIG.defaultTimezone): boolean {
    if (this.ignoreSilenceHours) return false

    const hourStr = new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      hour12: false,
      timeZone: timezone
    }).format(date)

    const hour = parseInt(hourStr, 10)
    const { start, end } = NOTIFIER_CONFIG.silenceHours

    if (start > end) {
      // Overnight range, e.g. 23 to 7
      return hour >= start || hour < end
    }
    return hour >= start && hour < end
  }

  /**
   * Checks if an event can be sent immediately or should be deferred/skipped.
   */
  checkEventEligibility(
    event: NotificationEvent,
    sentMilestonesToday: number,
    now = new Date(),
    timezone = NOTIFIER_CONFIG.defaultTimezone
  ): AntiSpamDecision {
    // 1. Daily digest is always allowed at its scheduled execution
    if (event.eventType === 'digest') {
      return { allowed: true }
    }

    // 2. Check silence window (High priority events can be deferred to end of silence window)
    if (this.isSilenceHour(now, timezone)) {
      return {
        allowed: false,
        deferReason: 'Currently in quiet hours window (23:00 - 07:00)'
      }
    }

    // 3. Daily milestone count cap
    if (sentMilestonesToday >= NOTIFIER_CONFIG.maxDailyMilestones) {
      return {
        allowed: false,
        shouldSkip: true,
        skipReason: `Daily milestone cap reached (${sentMilestonesToday}/${NOTIFIER_CONFIG.maxDailyMilestones})`
      }
    }

    return { allowed: true }
  }
}
