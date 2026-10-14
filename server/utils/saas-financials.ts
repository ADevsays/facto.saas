import { supabase } from '~/server/lib/supabase'
import { getLegacyFinancialSnapshot, hasFinancialHistory, normalizeSaasHistory, summarizeSaasHistory, type SaasHistorySummary } from '~/server/utils/saas-history'

export async function fetchCachedFinancialSummaries(
  saasIds: string[],
): Promise<Map<string, SaasHistorySummary>> {
  const ids = [...new Set(saasIds.filter(Boolean))]
  const summaries = new Map<string, SaasHistorySummary>()
  if (ids.length === 0) return summaries

  const { data, error } = await supabase
    .from('saas_metrics_cache')
    .select('saas_id, history_cache')
    .in('saas_id', ids)

  if (error) {
    console.error('[SaasFinancials] Unable to read cached financial history:', error.message)
    return summaries
  }

  for (const row of data ?? []) {
    const history = normalizeSaasHistory(row.history_cache)
    if (hasFinancialHistory(history)) {
      summaries.set(row.saas_id, summarizeSaasHistory(history, null))
      continue
    }
    const legacySnapshot = getLegacyFinancialSnapshot(row.history_cache)
    if (legacySnapshot) {
      summaries.set(row.saas_id, {
        mrr: legacySnapshot.mrr,
        revenue: legacySnapshot.revenue,
        formattedRevenue: formatRevenue(legacySnapshot.revenue),
      })
    }
  }

  return summaries
}

function formatRevenue(value: number | null): string {
  if (value === null) return '—'
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`.replace('.0', '')
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1).replace('.0', '')}K`
  return `$${Math.round(value)}`
}
