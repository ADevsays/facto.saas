import { NOTIFIER_CONFIG } from '../../../const/config'
import type {
  StartupSnapshotItem,
  SystemSnapshotState,
  NotificationEvent,
  RankingMovePayload
} from '../../../types'

/**
 * Pure detector for ranking shifts, focused on Top 10 / Top 3 and overtaking events.
 * Aggregates all moves in a cycle into a single event.
 */
export function detectRankingMoves(
  currentRanking: StartupSnapshotItem[],
  previousSnapshot: SystemSnapshotState | null,
  cycleTimestamp: string = new Date().toISOString()
): Array<Omit<NotificationEvent<RankingMovePayload>, 'id' | 'createdAt' | 'updatedAt' | 'attempts'>> {
  if (!previousSnapshot || !previousSnapshot.ranking || previousSnapshot.ranking.length === 0) {
    return [] // Baseline: no movement events
  }

  const prevRankMap = new Map<string, { rank: number; name: string; country?: string }>()
  const prevTop10Countries = new Set<string>()

  for (const s of previousSnapshot.ranking) {
    prevRankMap.set(s.id, { rank: s.rank, name: s.name, country: s.countrySlug })
    if (s.rank <= 10 && s.countrySlug) {
      prevTop10Countries.add(s.countrySlug)
    }
  }

  const moves: RankingMovePayload['moves'] = []
  const maxWatchRank = NOTIFIER_CONFIG.rankingMoveMinRankToWatch // Top 10

  for (const curr of currentRanking) {
    if (curr.rank > maxWatchRank) continue // Only monitor Top 10 positions

    const prev = prevRankMap.get(curr.id)
    if (!prev) {
      // Brand new startup entering directly into Top 10
      moves.push({
        startupId: curr.id,
        name: curr.name,
        slug: curr.slug,
        countryFlag: curr.countryFlag,
        previousRank: 0,
        newRank: curr.rank,
        isNewTop10: true,
        isNewTop3: curr.rank <= 3,
        isNewCountryInTop: Boolean(curr.countrySlug && !prevTop10Countries.has(curr.countrySlug))
      })
      continue
    }

    // Did the rank improve? (e.g. from 5 to 2)
    if (curr.rank < prev.rank) {
      // Find who was overtaken at the new rank position in previous snapshot
      const overtaken = previousSnapshot.ranking.find(s => s.rank === curr.rank && s.id !== curr.id)

      moves.push({
        startupId: curr.id,
        name: curr.name,
        slug: curr.slug,
        countryFlag: curr.countryFlag,
        previousRank: prev.rank,
        newRank: curr.rank,
        overtookName: overtaken?.name,
        isNewTop10: prev.rank > 10 && curr.rank <= 10,
        isNewTop3: prev.rank > 3 && curr.rank <= 3,
        isNewCountryInTop: Boolean(curr.countrySlug && !prevTop10Countries.has(curr.countrySlug))
      })
    }
  }

  if (moves.length === 0) {
    return []
  }

  // Cap number of moves reported in a single message cycle to avoid spam
  const limitedMoves = moves.slice(0, NOTIFIER_CONFIG.rankingMoveCycleMaxItems)
  const movesKey = limitedMoves.map(m => `${m.startupId}_${m.newRank}`).sort().join('_')
  const cycleDate = cycleTimestamp.substring(0, 13) // Grouped per hour bucket

  return [{
    eventType: 'ranking_move',
    dedupeKey: `ranking_move:${cycleDate}:${movesKey}`,
    payload: { moves: limitedMoves },
    priority: 'high',
    status: 'pending',
    maxAttempts: NOTIFIER_CONFIG.maxRetryAttempts,
    scheduledFor: cycleTimestamp
  }]
}
