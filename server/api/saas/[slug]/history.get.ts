import { supabase } from '~/server/lib/supabase'
import { stripeService } from '~/modules/add-saas/server/services/stripe.service'
import { mercadopagoService } from '~/modules/add-saas/server/services/mercadopago.service'
import { whopService } from '~/modules/add-saas/server/services/whop.service'
import { hasFinancialHistory, summarizeSaasHistory, type SaasHistoryData } from '~/server/utils/saas-history'

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
    .select('id, mrr, provider_key_encrypted, payment_providers ( slug )')
    .eq('slug', slug)
    .eq('status', 'published')
    .maybeSingle()

  if (entryError) throw createError({ statusCode: 500, message: entryError.message })
  if (!entry) throw createError({ statusCode: 404, message: 'SaaS not found' })

  const fallbackMrr = entry.mrr === null ? null : Number(entry.mrr)
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
  let history = cacheRow?.history_cache as SaasHistoryData | null | undefined
  let lastSyncedAt = cachedAt || null
  const cacheIsFresh = Boolean(history && cachedAt && nowMs - cachedAt < HISTORY_TTL_MS)

  if (!cacheIsFresh) {
    try {
      const apiKey = decryptProviderKey(entry.provider_key_encrypted)
      const providerRelation = entry.payment_providers as { slug?: string } | Array<{ slug?: string }> | null
      const providerSlug = Array.isArray(providerRelation) ? providerRelation[0]?.slug : providerRelation?.slug

      if (providerSlug === 'stripe' && stripeService.getHistory) {
        history = await stripeService.getHistory(apiKey)
      } else if (providerSlug === 'mercadopago' && mercadopagoService.getHistory) {
        history = await mercadopagoService.getHistory(apiKey)
      } else if (providerSlug === 'whop' && whopService.getHistory) {
        history = await whopService.getHistory(apiKey)
      }

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
            mrr: summary.mrr,
            revenue: summary.revenue,
          }).eq('id', entry.id),
        ])
        lastSyncedAt = nowMs
      }
    } catch (error) {
      console.error('[saas history] Unable to refresh provider history:', error)
    }
  }

  return {
    history: history || null,
    lastSyncedAt,
    ...summarizeSaasHistory(history, fallbackMrr),
  }
})
