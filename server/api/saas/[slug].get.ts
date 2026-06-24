import { supabase } from '~/server/lib/supabase'
import { stripeService } from '~/modules/add-saas/server/services/stripe.service'
import { mercadopagoService } from '~/modules/add-saas/server/services/mercadopago.service'
import { whopService } from '~/modules/add-saas/server/services/whop.service'
 
export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')
  
  if (!slug) {
    throw createError({ statusCode: 400, message: 'Slug is required' })
  }
 
  const { data: dbEntry } = await supabase
    .from('saas_entries')
    .select(`
      id, name, slug, logo_url, website_url, founder_name, startup_type, is_incognito, mrr, currency, views, published_at, provider_key_encrypted,
      categories!saas_categories ( name, slug ),
      payment_providers ( slug )
    `)
    .eq('slug', slug)
    .single()
 
  if (dbEntry) {
    const nextViews = (Number(dbEntry.views) || 0) + 1
    supabase
      .from('saas_entries')
      .update({ views: nextViews })
      .eq('id', dbEntry.id)
      .then(() => {})
 
    let history = null
    let lastSyncedAt: number | null = null
    const providerSlug = (dbEntry.payment_providers as any)?.slug
    if (dbEntry.provider_key_encrypted) {
      try {
        const storage = useStorage('cache')
        const cacheKey = `history:${providerSlug}:${dbEntry.id}`
        const cached: any = await storage.getItem(cacheKey)
        const now = Date.now()

        // Cache valid for 48 hours
        if (cached && cached.history && cached.timestamp && (now - cached.timestamp < 48 * 60 * 60 * 1000)) {
          history = cached.history
          lastSyncedAt = cached.timestamp
        } else {
          const apiKey = decryptProviderKey(dbEntry.provider_key_encrypted)
          if (providerSlug === 'stripe' && stripeService.getHistory) {
            history = await stripeService.getHistory(apiKey)
          } else if (providerSlug === 'mercadopago' && mercadopagoService.getHistory) {
            history = await mercadopagoService.getHistory(apiKey)
          } else if (providerSlug === 'whop' && whopService.getHistory) {
            history = await whopService.getHistory(apiKey)
          }

          if (history) {
            await storage.setItem(cacheKey, { history, timestamp: now })
            lastSyncedAt = now
          }
        }
      } catch (e) {
        console.error('[slug.get.ts] Error resolving history:', e)
      }
    }

    let mrrVal = dbEntry.mrr !== null ? Number(dbEntry.mrr) : null
    let allTimeRev = '—'
    let realAllTimeRevenue = 0

    if (history) {
      if (history.charges?.length) {
        realAllTimeRevenue = history.charges.reduce((sum: number, c: any) => sum + c.amount, 0)
      }
      if (history.subscriptions?.length) {
        const nowSec = Math.floor(Date.now() / 1000)
        let currentMrr = 0
        for (const s of history.subscriptions) {
          if (s.created <= nowSec && (s.canceledAt === null || s.canceledAt > nowSec)) {
            currentMrr += s.mrr
          }
        }
        mrrVal = Math.round(currentMrr)
      }
    }

    if (realAllTimeRevenue > 0) {
      if (realAllTimeRevenue >= 1000000) allTimeRev = `$${(realAllTimeRevenue / 1000000).toFixed(1)}M`.replace('.0', '')
      else if (realAllTimeRevenue >= 1000) allTimeRev = `$${(realAllTimeRevenue / 1000).toFixed(0)}K`
      else allTimeRev = `$${Math.round(realAllTimeRevenue)}`
    } else if (mrrVal !== null && mrrVal > 0) {
      // Fallback to ARR if no charges
      const annual = mrrVal * 12
      if (annual >= 1000000) allTimeRev = `$${(annual / 1000000).toFixed(1)}M`.replace('.0', '')
      else if (annual >= 1000) allTimeRev = `$${(annual / 1000).toFixed(0)}K`
      else allTimeRev = `$${annual}`
    } else if (mrrVal === 0) {
      allTimeRev = '$0'
    }

    if (history) {
      try {
        await useStorage('cache').setItem(`metrics:${dbEntry.id}`, { mrr: mrrVal, revenue: allTimeRev })
        if (mrrVal !== null && mrrVal !== dbEntry.mrr) {
          supabase.from('saas_entries').update({ mrr: mrrVal }).eq('id', dbEntry.id).then(() => {})
        }
      } catch (e) {}
    }

    return {
      id: dbEntry.id,
      name: dbEntry.name,
      logoUrl: dbEntry.logo_url,
      websiteUrl: dbEntry.website_url,
      founderName: dbEntry.founder_name,
      description: dbEntry.startup_type || `Detalle de ${dbEntry.name || 'SaaS'}.`,
      isIncognito: dbEntry.is_incognito,
      mrr: mrrVal,
      currency: dbEntry.currency,
      category: (dbEntry.categories as any[])?.[0]?.name ?? 'Software',
      categorySlug: (dbEntry.categories as any[])?.[0]?.slug ?? 'software',
      categories: dbEntry.categories || [],
      provider: providerSlug ?? 'stripe',
      views: nextViews,
      publishedAt: dbEntry.published_at,
      allTimeRevenue: allTimeRev,
      country: 'Global',
      history,
      lastSyncedAt: history ? lastSyncedAt : null
    }
  }

  throw createError({ statusCode: 404, message: 'SaaS not found' })
})
