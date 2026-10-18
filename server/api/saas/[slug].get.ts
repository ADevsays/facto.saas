import { supabase } from '~/server/lib/supabase'
import { checkAndNotifyAchievement } from '~/modules/achievements/server/services/achievements'
import { recordDailyView } from '~/server/lib/dailyViews'
import { fetchCachedFinancialSummaries } from '~/server/utils/saas-financials'
import { getPublicLogoUrl } from '~/server/utils/public-logo'
 
export default defineEventHandler(async (event) => {
  setResponseHeaders(event, {
    'Cache-Control': 'private, no-store, max-age=0',
    'CDN-Cache-Control': 'no-store',
    'Vercel-CDN-Cache-Control': 'no-store'
  })

  const slug = getRouterParam(event, 'slug')
  const seoOnly = getQuery(event).seo === '1'
  
  if (!slug) {
    throw createError({ statusCode: 400, message: 'Slug is required' })
  }
 
    let dbEntry: any = null
    let dbError: any = null

    // Intento 1: Traer columnas completas incluyendo Showcase Bento
    const fullRes = await supabase
      .from('saas_entries')
      .select(`
        id, name, slug, logo_url, website_url, founder_name, founder_id, founder_email, startup_type, is_incognito, mrr, revenue, currency, views, published_at,
        value_proposition, problem_solved, tech_stack, acquisition_channels, facto_message, faq, github_repo,
        categories!saas_categories ( name, slug ),
        countries!saas_countries ( name, slug, flag, iso_code ),
        payment_providers ( slug ),
        founder:founders!saas_entries_founder_id_fkey ( avatar_url, bio, twitter_url, linkedin_url, instagram_url ),
        saas_achievements ( achievement_type, unlocked_at )
      `)
      .eq('slug', slug)
      .order('published_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (fullRes.error && fullRes.error.code === '42703') {
      // Si aún no se corrió el SQL en Supabase, hacer fallback a las columnas existentes
      const fallbackRes = await supabase
        .from('saas_entries')
        .select(`
          id, name, slug, logo_url, website_url, founder_name, founder_id, founder_email, startup_type, is_incognito, mrr, revenue, currency, views, published_at,
          categories!saas_categories ( name, slug ),
          countries!saas_countries ( name, slug, flag, iso_code ),
          payment_providers ( slug ),
          founder:founders!saas_entries_founder_id_fkey ( avatar_url, bio, twitter_url, linkedin_url, instagram_url ),
          saas_achievements ( achievement_type, unlocked_at )
        `)
        .eq('slug', slug)
        .order('published_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      dbEntry = fallbackRes.data
      dbError = fallbackRes.error
    } else {
      dbEntry = fullRes.data
      dbError = fullRes.error
    }

    if (dbError) {
      console.error('[slug.get.ts] Database error:', dbError)
    }
 
  if (dbEntry) {
    const nextViews = (Number(dbEntry.views) || 0) + 1
    // The server-side SEO lookup is separate from the visible profile request;
    // never count it as an additional product visit.
    if (!seoOnly) {
      supabase
        .from('saas_entries')
        .update({ views: nextViews })
        .eq('id', dbEntry.id)
        .then(() => {})

      recordDailyView().catch(() => {})

      const referer = getHeader(event, 'referer') || ''
      const isEn = referer.includes('/en/') || (getHeader(event, 'accept-language')?.toLowerCase().startsWith('en') ?? false)
      const lang: 'es' | 'en' = isEn ? 'en' : 'es'

      checkAndNotifyAchievement({
        saasId: dbEntry.id,
        saasName: dbEntry.name || 'Tu SaaS',
        saasLogoUrl: dbEntry.logo_url,
        founderEmail: dbEntry.founder_email,
        saasSlug: slug,
        currentViews: nextViews,
        lang
      })
    }
 
    const providerSlug = (dbEntry.payment_providers as any)?.slug
    const hasConnectedProvider = Boolean(providerSlug)
    let mrrVal = dbEntry.mrr !== null ? Number(dbEntry.mrr) : null
    let persistedRevenue = dbEntry.revenue !== null && dbEntry.revenue !== undefined
      ? Number(dbEntry.revenue)
      : null

    // Older entries may still have their financial source of truth only in the
    // cached provider history. Read that cache as a server-side fallback, but
    // keep the history itself out of the initial profile payload. The dedicated
    // history endpoint remains responsible for refreshing stale provider data.
    const hasEstimatedRevenue = mrrVal !== null && mrrVal > 0 && persistedRevenue === mrrVal * 12
    if (mrrVal === null || mrrVal <= 0 || persistedRevenue === null || persistedRevenue <= 0 || hasEstimatedRevenue) {
      const cachedFinancials = await fetchCachedFinancialSummaries([dbEntry.id])
      const summary = cachedFinancials.get(dbEntry.id)
      if (summary) {
        if ((mrrVal === null || mrrVal <= 0) && summary.mrr !== null && summary.mrr > 0) {
          mrrVal = summary.mrr
        }
        if ((persistedRevenue === null || persistedRevenue <= 0) && summary.revenue !== null && summary.revenue > 0) {
          persistedRevenue = summary.revenue
        }
        if (hasEstimatedRevenue) {
          persistedRevenue = summary.revenue !== null && summary.revenue > 0 ? summary.revenue : null
        }
      } else if (hasEstimatedRevenue) {
        persistedRevenue = null
      }
    }

    const revenueValue = persistedRevenue !== null && Number.isFinite(persistedRevenue)
      && persistedRevenue >= 0 && hasConnectedProvider
      ? persistedRevenue
      : null
    let allTimeRev: string | null = null
    if (revenueValue !== null) {
      if (revenueValue >= 1_000_000) allTimeRev = `$${(revenueValue / 1_000_000).toFixed(1)}M`.replace('.0', '')
      else if (revenueValue >= 1_000) allTimeRev = `$${(revenueValue / 1_000).toFixed(1).replace('.0', '')}K`
      else allTimeRev = `$${Math.round(revenueValue)}`
    }

    const countryData = (dbEntry.countries as any[])?.[0] || null
    const isGlobal = !countryData || countryData.slug === 'global' || countryData.iso_code === 'un'

    const result = {
      id: dbEntry.id,
      name: dbEntry.name,
      slug: dbEntry.slug,
      logoUrl: getPublicLogoUrl(dbEntry.logo_url),
      websiteUrl: dbEntry.website_url,
      founderName: dbEntry.founder_name,
      founderId: dbEntry.founder_id,
      hasFounderEmail: !!dbEntry.founder_email,
      description: dbEntry.startup_type || `Detalle de ${dbEntry.name || 'SaaS'}.`,
      isIncognito: dbEntry.is_incognito === true || dbEntry.is_incognito === 'true',
      mrr: mrrVal,
      currency: dbEntry.currency,
      category: (dbEntry.categories as any[])?.[0]?.name ?? 'Software',
      categorySlug: (dbEntry.categories as any[])?.[0]?.slug ?? 'software',
      categories: dbEntry.categories || [],
      provider: providerSlug ?? null,
      views: seoOnly ? Number(dbEntry.views) || 0 : nextViews,
      publishedAt: dbEntry.published_at,
      allTimeRevenue: allTimeRev,
      country: isGlobal ? 'Global' : (countryData?.name || 'Global'),
      countrySlug: isGlobal ? 'global' : (countryData?.slug || 'global'),
      countryFlag: isGlobal ? 'global' : (countryData?.iso_code || 'global'),
      history: null,
      founderSocials: null as { twitterUrl?: string; linkedinUrl?: string; instagramUrl?: string } | null,
      founderAvatar: null as string | null,
      founderBio: null as string | null,
      lastSyncedAt: null,
      valueProposition: dbEntry.value_proposition || null,
      problemSolved: dbEntry.problem_solved || null,
      techStack: Array.isArray(dbEntry.tech_stack) ? dbEntry.tech_stack : [],
      acquisitionChannels: Array.isArray(dbEntry.acquisition_channels) ? dbEntry.acquisition_channels : [],
      factoMessage: dbEntry.facto_message || null,
      faq: Array.isArray(dbEntry.faq) ? dbEntry.faq : [],
      githubRepo: dbEntry.github_repo || null,
      latestMilestone: null as number | null
    }

    const achievements = Array.isArray(dbEntry.saas_achievements) ? dbEntry.saas_achievements : []
    const achievement = achievements.reduce((latest: any, item: any) => (
      !latest || item.unlocked_at > latest.unlocked_at ? item : latest
    ), null)
    const milestone = parseInt(achievement?.achievement_type, 10)
    if (milestone > 0) result.latestMilestone = milestone

    const founderData = Array.isArray(dbEntry.founder) ? dbEntry.founder[0] : dbEntry.founder
    if (founderData) {
      result.founderAvatar = founderData.avatar_url || null
      result.founderBio = founderData.bio || null
      result.founderSocials = {
        twitterUrl: founderData.twitter_url,
        linkedinUrl: founderData.linkedin_url,
        instagramUrl: founderData.instagram_url
      }
    }

    return result
  }

  throw createError({ statusCode: 404, message: 'SaaS not found' })
})
