import { NOTIFIER_CONFIG } from '../../../const/config'
import {
  formatCurrency,
  formatCurrencyDelta,
  formatDateSpanish
} from '../formatters/html.formatter'
import type {
  StartupSnapshotItem,
  SystemSnapshotState,
  NotificationEvent,
  DailyDigestPayload,
  OpportunityScoreDetail
} from '../../../types'

export interface DailyDigestInput {
  currentRanking: StartupSnapshotItem[]
  currentCountries: Record<string, { totalRevenue: number; startupsCount: number; flag?: string; name?: string }>
  currentGlobalRevenue: number
  previousSnapshot: SystemSnapshotState | null
  todayVisits: number
  sevenDayAvgVisits: number
  opportunities: OpportunityScoreDetail[]
  dateStr: string
}

/**
 * Pure generator for the Daily Digest event.
 * Produces structured data for the daily summary with honest quiet-day fallback when no changes occurred.
 */
export function generateDailyDigest(
  input: DailyDigestInput
): Omit<NotificationEvent<DailyDigestPayload>, 'id' | 'createdAt' | 'updatedAt' | 'attempts'> {
  const {
    currentRanking,
    currentCountries,
    currentGlobalRevenue,
    previousSnapshot,
    todayVisits,
    sevenDayAvgVisits,
    opportunities,
    dateStr
  } = input

  const prevGlobalRev = previousSnapshot?.global.totalRevenue || 0
  const globalRevDelta = currentGlobalRevenue - prevGlobalRev

  // 1. Identify newly added startups compared to last digest snapshot
  const prevIds = new Set((previousSnapshot?.ranking || []).map(s => s.id))
  const newStartups = currentRanking.filter(s => !prevIds.has(s.id))

  const newStartupsSummary = newStartups.map(s => ({
    name: s.name,
    country: s.countryName,
    countryFlag: s.countryFlag,
    category: s.category,
    mrr: s.mrr
  }))

  // 2. Identify top mover countries
  const topCountryMovers: DailyDigestPayload['topCountryMovers'] = []
  for (const [slug, curr] of Object.entries(currentCountries)) {
    const prev = previousSnapshot?.countries[slug]
    const prevRev = prev?.totalRevenue || 0
    const delta = curr.totalRevenue - prevRev

    if (delta > 0) {
      topCountryMovers.push({
        country: curr.name || slug,
        countryFlag: curr.flag || '',
        revenueChange: delta,
        revenueChangeFormatted: formatCurrencyDelta(delta),
        startupsCount: curr.startupsCount
      })
    }
  }
  topCountryMovers.sort((a, b) => b.revenueChange - a.revenueChange)

  // 3. Ranking highlights
  const rankingHighlights: DailyDigestPayload['rankingHighlights'] = []
  const prevRankMap = new Map<string, number>()
  if (previousSnapshot?.ranking) {
    for (const s of previousSnapshot.ranking) {
      prevRankMap.set(s.id, s.rank)
    }
  }

  for (const s of currentRanking) {
    if (s.rank <= 10) {
      const pRank = prevRankMap.get(s.id)
      if (pRank && s.rank < pRank) {
        rankingHighlights.push({
          startupName: s.name,
          rank: s.rank,
          change: pRank - s.rank
        })
      }
    }
  }

  // 4. Visits vs 7-day average
  let visitsSummary: DailyDigestPayload['visitsSummary'] = null
  if (todayVisits > 0 && sevenDayAvgVisits > 0) {
    const changePct = ((todayVisits - sevenDayAvgVisits) / sevenDayAvgVisits) * 100
    visitsSummary = {
      todayVisits,
      sevenDayAvg: sevenDayAvgVisits,
      changePercentage: changePct
    }
  }

  // 5. Quiet day check
  const hasNews = newStartups.length > 0 ||
    Math.abs(globalRevDelta) > 0 ||
    topCountryMovers.length > 0 ||
    rankingHighlights.length > 0 ||
    opportunities.length > 0

  const payload: DailyDigestPayload = {
    dateStr: formatDateSpanish(dateStr),
    newStartupsCount: newStartups.length,
    newStartupsSummary,
    globalRevenue: currentGlobalRevenue,
    globalRevenueFormatted: formatCurrency(currentGlobalRevenue),
    globalRevenueChange: globalRevDelta,
    globalRevenueChangeFormatted: formatCurrencyDelta(globalRevDelta),
    topCountryMovers: topCountryMovers.slice(0, 3),
    rankingHighlights,
    visitsSummary,
    opportunities,
    isQuietDay: !hasNews
  }

  return {
    eventType: 'digest',
    dedupeKey: `digest:${dateStr}`,
    payload,
    priority: 'high',
    status: 'pending',
    maxAttempts: NOTIFIER_CONFIG.maxRetryAttempts,
    scheduledFor: new Date().toISOString()
  }
}
