import { supabase } from '~/server/lib/supabase'
import { getProvider } from '~/modules/add-saas/server/services/provider.factory'
import type { PaymentProvider } from '~/modules/add-saas/types'
import { notifyProviderKeyExpiredOnce } from '~/modules/add-saas/server/services/providerKeyExpiredEmail'
import { buildSaasHistoryChart, formatRevenue, getLegacyFinancialSnapshot, hasFinancialHistory, normalizeSaasHistory, summarizeSaasHistory } from '~/server/utils/saas-history'

const HISTORY_TTL_MS = 48 * 60 * 60 * 1000

export default defineEventHandler(async (event) => {
  setResponseHeaders(event, {
    'Cache-Control': 'private, no-store, max-age=0',
    'CDN-Cache-Control': 'no-store',
    'Vercel-CDN-Cache-Control': 'no-store'
  })

  const slug = getRouterParam(event, 'slug')
  if (!slug) throw createError({ statusCode: 400, message: 'Slug is required' })

  const { data: entry, error: entryError } = await supabase
    .from('saas_entries')
    .select('id, name, slug, founder_email, mrr, revenue, provider_key_encrypted, payment_providers ( slug )')
    .eq('slug', slug)
    .eq('status', 'published')
    .maybeSingle()

  if (entryError) throw createError({ statusCode: 500, message: entryError.message })
  if (!entry) throw createError({ statusCode: 404, message: 'SaaS not found' })

  const fallbackMrr = entry.mrr === null ? null : Number(entry.mrr)
  const persistedRevenue = entry.revenue === null || entry.revenue === undefined ? null : Number(entry.revenue)
  if (!entry.provider_key_encrypted) {
    return {
      history: null,
      lastSyncedAt: null,
      ...summarizeSaasHistory(null, fallbackMrr),
    }
  }

  const { data: cacheRow, error: cacheError } = await supabase
    .from('saas_metrics_cache')
    .select('history_cache, history_synced_at')
    .eq('saas_id', entry.id)
    .maybeSingle()

  if (cacheError) {
    console.error('[saas history] Unable to read metrics cache:', cacheError.message)
  }

  const nowMs = Date.now()
  const cachedAt = cacheRow?.history_synced_at
    ? new Date(cacheRow.history_synced_at).getTime()
    : 0
  let history = normalizeSaasHistory(cacheRow?.history_cache)
  let refreshFailed = false
  const legacySnapshot = getLegacyFinancialSnapshot(cacheRow?.history_cache)
  let lastSyncedAt = cachedAt || null
  const hasEmptyCachedHistory = Boolean(
    cacheRow?.history_cache
    && typeof cacheRow.history_cache === 'object'
    && !hasFinancialHistory(history)
    && !legacySnapshot
  )
  const cacheIsFresh = Boolean(
    cachedAt
    && nowMs - cachedAt < HISTORY_TTL_MS
    && (history || (hasEmptyCachedHistory && fallbackMrr !== null && persistedRevenue !== null))
  )

  if (!cacheIsFresh) {
    try {
      const apiKey = decryptProviderKey(entry.provider_key_encrypted)
      const providerRelation = entry.payment_providers as { slug?: string } | Array<{ slug?: string }> | null
      const providerSlug = Array.isArray(providerRelation) ? providerRelation[0]?.slug : providerRelation?.slug

      const rawHistory = providerSlug
        ? await getProvider(providerSlug as PaymentProvider).getHistory(apiKey)
        : null

      history = normalizeSaasHistory(rawHistory)
      if (hasFinancialHistory(history)) {
        const summary = summarizeSaasHistory(history, fallbackMrr)
        const hasExplicitEmptyHistory = history.subscriptions?.length === 0 && history.charges?.length === 0
        const syncedAt = new Date(nowMs).toISOString()
        await Promise.all([
          supabase.from('saas_metrics_cache').upsert({
            saas_id: entry.id,
            history_cache: history,
            history_synced_at: syncedAt,
          }),
          hasExplicitEmptyHistory
            ? supabase.from('saas_entries').update({ mrr: 0, revenue: 0, }).eq('id', entry.id)
            : supabase.from('saas_entries').update({ mrr: summary.mrr, revenue: summary.revenue }).eq('id', entry.id),
        ])
        lastSyncedAt = nowMs
      }
    } catch (error) {
      const status = (error as { response?: { status?: number }; statusCode?: number })?.response?.status
        ?? (error as { statusCode?: number })?.statusCode
      if (status === 401 || status === 403) {
        const cachedHistory = hasFinancialHistory(history) ? history : null
        const hasPriorFinancialData = Boolean(
          cachedHistory
          || legacySnapshot
          || (entry.mrr !== null && Number(entry.mrr) > 0)
          || (entry.revenue !== null && Number(entry.revenue) > 0),
        )
        if (status === 401 && hasPriorFinancialData && entry.founder_email) {
          await notifyProviderKeyExpiredOnce({
            saasId: entry.id,
            startupName: entry.name || entry.slug,
            startupSlug: entry.slug,
            founderEmail: entry.founder_email,
            lastSyncedAt,
          }).catch(notificationError => {
            console.error('[saas history] Unable to notify founder about expired provider key:', notificationError)
          })
        }
        return {
          history: buildSaasHistoryChart(cachedHistory, nowMs),
          lastSyncedAt,
          ...(legacySnapshot && !cachedHistory ? {
            mrr: legacySnapshot.mrr,
            revenue: legacySnapshot.revenue,
            formattedRevenue: legacySnapshot.revenue === null ? null : `$${(legacySnapshot.revenue / 1000).toFixed(1).replace('.0', '')}K`,
          } : summarizeSaasHistory(cachedHistory, fallbackMrr)),
          keyStatus: status === 401 ? 'invalid' : 'permissions',
        }
      }
      console.error('[saas history] Unable to refresh provider history:', error)
      refreshFailed = true
    }
  }

  if (refreshFailed) {
    const summary = summarizeSaasHistory(history, fallbackMrr)
    const revenue = summary.revenue ?? persistedRevenue
    return {
      history: buildSaasHistoryChart(history, nowMs),
      lastSyncedAt,
      mrr: summary.mrr,
      revenue,
      formattedRevenue: formatRevenue(revenue),
      keyStatus: 'error',
    }
  }

  const summary = summarizeSaasHistory(history, fallbackMrr)
  const effectiveRevenue = summary.revenue ?? (persistedRevenue !== null && persistedRevenue >= 0 ? persistedRevenue : null)
  return {
    history: buildSaasHistoryChart(history, nowMs),
    lastSyncedAt,
    mrr: summary.mrr,
    revenue: effectiveRevenue,
    formattedRevenue: formatRevenue(effectiveRevenue),
    keyStatus: 'ok',
  }
})
