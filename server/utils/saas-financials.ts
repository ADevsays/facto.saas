import { supabase } from '~/server/lib/supabase'
import { hasFinancialHistory, summarizeSaasHistory, type SaasHistorySummary, type SaasHistoryData } from '~/server/utils/saas-history'
import { decryptProviderKey } from '~/server/utils/encryption'
import { getProvider } from '~/modules/add-saas/server/services/provider.factory'
import type { PaymentProvider } from '~/modules/add-saas/types'

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

  const rowsWithHistory = new Set<string>()
  for (const row of data ?? []) {
    if (hasFinancialHistory(row.history_cache as SaasHistoryData | null)) {
      summaries.set(row.saas_id, summarizeSaasHistory(row.history_cache as SaasHistoryData, null))
      rowsWithHistory.add(row.saas_id)
    }
  }

  // Older published entries can have neither persisted metrics nor a cache.
  // Rebuild that cache once from the encrypted provider key, then persist the
  // summary so public reads remain cheap after the first recovery.
  const missingIds = ids.filter(id => !rowsWithHistory.has(id))
  if (missingIds.length > 0) {
    const { data: entries, error: entriesError } = await supabase
      .from('saas_entries')
      .select('id, provider_key_encrypted, payment_providers ( slug )')
      .in('id', missingIds)

    if (entriesError) {
      console.error('[SaasFinancials] Unable to load provider fallback metadata:', entriesError.message)
      return summaries
    }

    await Promise.all((entries ?? []).map(async (entry) => {
      if (!entry.provider_key_encrypted) return

      try {
        const relation = entry.payment_providers as { slug?: string } | Array<{ slug?: string }> | null
        const providerSlug = (Array.isArray(relation) ? relation[0]?.slug : relation?.slug) as PaymentProvider | undefined
        if (!providerSlug) return

        const history = await getProvider(providerSlug).getHistory?.(decryptProviderKey(entry.provider_key_encrypted))
        if (!history) return

        const summary = summarizeSaasHistory(history as SaasHistoryData, null)
        summaries.set(entry.id, summary)
        const syncedAt = new Date().toISOString()
        await Promise.all([
          supabase.from('saas_metrics_cache').upsert({
            saas_id: entry.id,
            history_cache: history,
            history_synced_at: syncedAt,
          }),
          supabase.from('saas_entries').update({
            mrr: summary.mrr,
            revenue: summary.revenue,
          }).eq('id', entry.id),
        ])
      } catch (error) {
        console.error(`[SaasFinancials] Provider fallback failed for ${entry.id}:`, error)
      }
    }))
  }

  return summaries
}
