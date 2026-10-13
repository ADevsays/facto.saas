import { supabase } from '~/server/lib/supabase'
import { fetchCachedFinancialSummaries } from '~/server/utils/saas-financials'

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')

  if (!slug) {
    throw createError({ statusCode: 400, message: 'Founder identifier required' })
  }

  const decoded = decodeURIComponent(slug).replace(/-/g, ' ').trim()
  const isUuid = slug.includes('-') && slug.length === 36

  let founder: any = null
  try {
    let q = supabase
      .from('founders')
      .select('id, name, avatar_url, bio, country_slug, twitter_url, linkedin_url, instagram_url')

    if (isUuid) {
      q = q.or('id.eq.' + slug + ',name.ilike.%' + decoded + '%')
    } else {
      q = q.ilike('name', '%' + decoded + '%')
    }

    const { data: founderRows } = await q.limit(1)
    founder = founderRows?.[0] || null
  } catch (e) {}

  if (!founder) {
    const { data: saasFounder } = await supabase
      .from('saas_entries')
      .select('founder_name, founder_id')
      .ilike('founder_name', decoded)
      .limit(1)
      .single()

    if (saasFounder?.founder_name) {
      founder = {
        id: saasFounder.founder_id || null,
        name: saasFounder.founder_name,
        avatar_url: null,
        bio: null,
        country_slug: null,
        twitter_url: null,
        linkedin_url: null,
        instagram_url: null
      }
    }
  }

  if (!founder) {
    throw createError({ statusCode: 404, message: 'Founder not found' })
  }

  let saasQuery = supabase
    .from('saas_entries')
    .select(
      'id, name, slug, logo_url, website_url, startup_type, is_incognito, mrr, revenue, currency, views, published_at,' +
      'categories!saas_categories ( name, slug ),' +
      'countries!saas_countries ( name, slug, flag, iso_code )'
    )
    .eq('status', 'published')

  if (founder.id) {
    saasQuery = saasQuery.or('founder_id.eq.' + founder.id + ',founder_name.ilike.' + founder.name)
  } else {
    saasQuery = saasQuery.ilike('founder_name', founder.name)
  }

  const { data: saasList } = await saasQuery.order('mrr', { ascending: false, nullsFirst: false })
  const cachedFinancials = await fetchCachedFinancialSummaries(
    ((saasList as any[]) || [])
      .filter(row => row.mrr === null || row.mrr === undefined || row.revenue === null || row.revenue === undefined)
      .map(row => row.id),
  )

  let totalRevenue = 0
  let hasAnyPublicRevenue = false

  const startups = (saasList || []).map((s: any) => {
    const isIncognito = Boolean(s.is_incognito)
    let mrrVal = s.mrr !== null && s.mrr !== undefined ? Number(s.mrr) : null
    const cachedSummary = cachedFinancials.get(s.id)
    if (cachedSummary && mrrVal === null) mrrVal = cachedSummary.mrr

    let revenueVal: number | null = null
    if (s.revenue !== null && s.revenue !== undefined && Number(s.revenue) > 0) {
      revenueVal = Number(s.revenue)
    } else if (cachedSummary?.revenue !== null && cachedSummary?.revenue !== undefined) {
      revenueVal = cachedSummary.revenue
    } else if (mrrVal !== null && mrrVal > 0) {
      revenueVal = mrrVal * 12
    } else if (mrrVal === 0) {
      revenueVal = 0
    }

    let formattedRevenue = '—'
    if (revenueVal !== null && !isIncognito) {
      if (revenueVal >= 1000000) formattedRevenue = `$${(revenueVal / 1000000).toFixed(1)}M`.replace('.0', '')
      else if (revenueVal >= 1000) formattedRevenue = `$${(revenueVal / 1000).toFixed(0)}K`
      else formattedRevenue = `$${Math.round(revenueVal)}`

      totalRevenue += revenueVal
      hasAnyPublicRevenue = true
    }

    const categories = s.saas_categories || s.categories || []

    return {
      id: s.id,
      name: s.name,
      slug: s.slug,
      logoUrl: s.logo_url,
      websiteUrl: s.website_url,
      description: s.startup_type,
      startupType: s.startup_type,
      isIncognito,
      mrr: isIncognito ? null : mrrVal,
      revenue: isIncognito ? '—' : formattedRevenue,
      numericRevenue: isIncognito ? null : revenueVal,
      currency: s.currency || 'USD',
      category: categories[0]?.name ?? 'Software',
      categorySlug: categories[0]?.slug ?? 'software',
      categories,
      country: s.saas_countries?.[0] ?? s.countries?.[0] ?? null,
      views: s.views || 0,
      publishedAt: s.published_at,
      provider: 'stripe'
    }
  })

  let totalRevenueFormatted = '—'
  if (hasAnyPublicRevenue) {
    if (totalRevenue >= 1000000) totalRevenueFormatted = `$${(totalRevenue / 1000000).toFixed(1)}M`.replace('.0', '')
    else if (totalRevenue >= 1000) totalRevenueFormatted = `$${(totalRevenue / 1000).toFixed(0)}K`
    else totalRevenueFormatted = `$${Math.round(totalRevenue)}`
  }

  return {
    founder: {
      id: founder.id,
      name: founder.name,
      avatarUrl: founder.avatar_url,
      bio: founder.bio,
      countrySlug: founder.country_slug,
      socials: {
        twitterUrl: founder.twitter_url,
        linkedinUrl: founder.linkedin_url,
        instagramUrl: founder.instagram_url
      }
    },
    totalRevenue,
    totalRevenueFormatted,
    hasPublicRevenue: hasAnyPublicRevenue,
    startupsCount: startups.length,
    startups
  }
})
