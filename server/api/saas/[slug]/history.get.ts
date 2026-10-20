import { supabase } from '~/server/lib/supabase'
import { stripeService } from '~/modules/add-saas/server/services/stripe.service'
import { mercadopagoService } from '~/modules/add-saas/server/services/mercadopago.service'
import { whopService } from '~/modules/add-saas/server/services/whop.service'
import { notifyProviderKeyExpiredOnce } from '~/modules/add-saas/server/services/providerKeyExpiredEmail'
import { buildSaasHistoryChart, getLegacyFinancialSnapshot, hasFinancialHistory, normalizeSaasHistory, summarizeSaasHistory } from '~/server/utils/saas-history'

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

      let rawHistory: any = null
      if (providerSlug === 'stripe' && stripeService.getHistory) {
        rawHistory = await stripeService.getHistory(apiKey)
      } else if (providerSlug === 'mercadopago' && mercadopagoService.getHistory) {
        rawHistory = await mercadopagoService.getHistory(apiKey)
      } else if (providerSlug === 'whop' && whopService.getHistory) {
        rawHistory = await whopService.getHistory(apiKey)
      }

      history = normalizeSaasHistory(rawHistory)
      if (hasFinancialHistory(history)) {
        const summary = summarizeSaasHistory(history, fallbackMrr)
        const syncedAt = new Date(nowMs).toISOString()
        await Promise.all([
          supabase.from('saas_metrics_cache').upsert({
            saas_id: entry.id,
            history_cache: history,
            history_synced_at: syncedAt,
          }),
          supabase.from('saas_entries').update({
            mrr: summary.mrr ?? 0,
            revenue: summary.revenue ?? 0,
          }).eq('id', entry.id),
        ])
        lastSyncedAt = nowMs
      } else if (rawHistory) {
        const syncedAt = new Date(nowMs).toISOString()
        await Promise.all([
          supabase.from('saas_metrics_cache').upsert({
            saas_id: entry.id,
            history_cache: { subscriptions: [], charges: [] },
            history_synced_at: syncedAt,
          }),
          supabase.from('saas_entries').update({
            mrr: 0,
            revenue: 0,
          }).eq('id', entry.id),
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
    }
  }

  const summary = summarizeSaasHistory(history, fallbackMrr ?? 0)
  const effectiveRevenue = summary.revenue ?? (persistedRevenue !== null && persistedRevenue >= 0 ? persistedRevenue : 0)
  return {
    history: buildSaasHistoryChart(history, nowMs),
    lastSyncedAt,
    mrr: summary.mrr ?? 0,
    revenue: effectiveRevenue,
    formattedRevenue: `$${Math.round(effectiveRevenue)}`,
    keyStatus: 'ok',
  }
})
