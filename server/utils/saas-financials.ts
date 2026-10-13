import { supabase } from '~/server/lib/supabase'
import { summarizeSaasHistory, type SaasHistorySummary, type SaasHistoryData } from '~/server/utils/saas-history'

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
    if (row.history_cache) {
      summaries.set(row.saas_id, summarizeSaasHistory(row.history_cache as SaasHistoryData, null))
    }
  }

  return summaries
}
