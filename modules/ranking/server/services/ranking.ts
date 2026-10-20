import { supabase } from '~/server/lib/supabase'
import type { CountryStartupItem, CountryStartupPage, SaasListItem, ListQueryParams, SortOption } from '~/modules/ranking/types'
import { getPublicLogoUrl } from '~/server/utils/public-logo'

const SORT_COLUMN: Record<SortOption, string> = {
  mrr: 'mrr',
  latest: 'published_at',
  views: 'views',
}

export function formatPersistedRevenue(revenue: unknown, _mrr: number | null, hasConnectedProvider: boolean): string | null {
  const numericRevenue = typeof revenue === 'number'
    ? revenue
    : typeof revenue === 'string' && revenue.trim() !== ''
      ? Number(revenue)
      : Number.NaN
  const value = hasConnectedProvider && Number.isFinite(numericRevenue) && numericRevenue >= 0 ? numericRevenue : null

  if (value === null) return null
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`.replace('.0', '')
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1).replace('.0', '')}K`
  return `$${Math.round(value)}`
}

export async function fetchCountryStartups({ country, limit, offset }: {
  country: string
  limit: number
  offset: number
}): Promise<CountryStartupPage> {
  const { data, error } = await supabase
    .from('saas_entries')
    .select('name, slug, logo_url, website_url, revenue, payment_providers ( slug ), countries!saas_countries!inner (slug)')
    .eq('status', 'published')
    .not('is_incognito', 'is', true)
    .eq('countries.slug', country)
    .order('revenue', { ascending: false, nullsFirst: false })
    .range(offset, offset + limit)

  if (error) throw createError({ statusCode: 500, message: error.message })

  const rows = data || []
  const items: CountryStartupItem[] = rows.slice(0, limit).map(row => {
    const providerRelation = row.payment_providers as { slug?: string } | { slug?: string }[] | null
    const providerSlug = Array.isArray(providerRelation) ? providerRelation[0]?.slug : providerRelation?.slug
    const hasProvider = Boolean(providerSlug)
    const revenue = row.revenue === null || row.revenue === undefined || row.revenue === ''
      ? null
      : Number(row.revenue)
    return {
      name: row.name || 'Startup',
      slug: row.slug,
      logoUrl: getPublicLogoUrl(row.logo_url),
      websiteUrl: row.website_url || null,
      revenue: hasProvider && revenue !== null && Number.isFinite(revenue) && revenue >= 0 ? revenue : null,
      hasProvider
    }
  })

  return { items, hasMore: rows.length > limit }
}

function parseFormattedRevenue(revenue: string | null | undefined, _mrr: number | null): number {
  if (!revenue) return 0
  const amount = Number.parseFloat(revenue.replace(/[^0-9.]/g, ''))
  const multiplier = revenue.includes('M') ? 1_000_000 : revenue.includes('K') ? 1_000 : 1
  return (amount * multiplier) || 0
}

function seededOrderValue(id: string, seed: number): number {
  let hash = seed | 0
  for (let i = 0; i < id.length; i++) {
    hash = Math.imul(hash ^ id.charCodeAt(i), 16777619)
  }
  return hash >>> 0
}

function mapRow(row: Record<string, unknown>, searchCategory?: string): SaasListItem {
  const cats = (row.categories as { name: string; slug: string }[]) || []
  let selectedCat = cats[0]
  if (searchCategory) {
    const matched = cats.find(c => c.slug === searchCategory)
    if (matched) selectedCat = matched
  }

  const countries = (row.countries as { name: string; slug: string; flag: string; iso_code?: string }[]) || []
  let selectedCountry = countries[0] || null
  const providerRelation = row.payment_providers as { slug?: string } | { slug?: string }[] | null
  const providerSlug = Array.isArray(providerRelation) ? providerRelation[0]?.slug : providerRelation?.slug

  return {
    id: row.id as string,
    name: row.name as string | null,
    slug: (row.slug as string) || null,
    logoUrl: getPublicLogoUrl(row.logo_url),
    websiteUrl: row.website_url as string | null,
    founderName: row.founder_name as string | null,
    isIncognito: row.is_incognito === true || row.is_incognito === 'true',
    mrr: row.mrr === null ? null : Number(row.mrr),
    revenue: formatPersistedRevenue(row.revenue, row.mrr === null ? null : Number(row.mrr), Boolean(providerSlug)),
    currency: row.currency as string,
    category: selectedCat?.name ?? '',
    categorySlug: selectedCat?.slug ?? '',
    categories: cats,
    country: selectedCountry,
    provider: (providerSlug as SaasListItem['provider']) || null,
    views: row.views as number,
    publishedAt: row.published_at as string,
    description: (row.startup_type as string) || null,
  }
}

export async function fetchSaasList(params: ListQueryParams = {}): Promise<SaasListItem[]> {
  const { sort = 'mrr', category, country, countries, q, limit, offset = 0, excludeIncognito = false, seed } = params
  const column = SORT_COLUMN[sort]
  const nullsFirst = sort === 'mrr' ? false : false

  const selectQuery = `
    id, name, slug, logo_url, website_url, founder_name, startup_type,
    is_incognito, mrr, revenue, currency, views, published_at,
    categories!saas_categories${category ? '!inner' : ''} ( name, slug ),
    countries!saas_countries${country || countries?.length ? '!inner' : ''} ( name, slug, flag, iso_code ),
    payment_providers ( name, slug )
  `

  const isExplicitLimited = typeof limit === 'number' && limit < 1000 && sort !== 'mrr'

  let rawData: any[] = []

  if (isExplicitLimited) {
    let query = supabase
      .from('saas_entries')
      .select(selectQuery)
      .eq('status', 'published')
      .order(column, { ascending: false, nullsFirst })
      .order('id', { ascending: true })
      .range(offset, offset + limit - 1)

    if (category) query = query.eq('categories.slug', category)
    if (country) query = query.eq('countries.slug', country)
    if (countries?.length) query = query.in('countries.slug', countries)
    if (excludeIncognito) query = query.not('is_incognito', 'is', true)
    if (q?.trim()) {
      const term = `%${q.trim()}%`
      query = query.or(`name.ilike.${term},founder_name.ilike.${term}`)
    }

    const { data, error } = await query
    if (error) throw createError({ statusCode: 500, message: error.message })
    rawData = data ?? []
  } else {
    // Auto-paginate in 1000-row chunks to ensure no ceiling when catalog grows past 1,000
    const CHUNK_SIZE = 1000
    let currentFrom = sort === 'mrr' && typeof limit === 'number' && limit < 1000 ? 0 : offset

    while (true) {
      let query = supabase
        .from('saas_entries')
        .select(selectQuery)
        .eq('status', 'published')
        .order(column, { ascending: false, nullsFirst })
        .order('id', { ascending: true })
        .range(currentFrom, currentFrom + CHUNK_SIZE - 1)

      if (category) query = query.eq('categories.slug', category)
      if (country) query = query.eq('countries.slug', country)
      if (countries?.length) query = query.in('countries.slug', countries)
      if (excludeIncognito) query = query.not('is_incognito', 'is', true)
      if (q?.trim()) {
        const term = `%${q.trim()}%`
        query = query.or(`name.ilike.${term},founder_name.ilike.${term}`)
      }

      const { data, error } = await query
      if (error) throw createError({ statusCode: 500, message: error.message })

      if (!data || data.length === 0) break
      rawData.push(...data)
      if (data.length < CHUNK_SIZE) break
      currentFrom += CHUNK_SIZE
    }
  }

  if (excludeIncognito) {
    rawData = rawData.filter(row => row.is_incognito !== true && row.is_incognito !== 'true')
  }

  const items = rawData.map((row) => {
    const item = mapRow(row as unknown as Record<string, unknown>, category)
    if (Number(row.mrr) > 0 && Number(row.revenue) === Number(row.mrr) * 12) {
      // This exact value is the legacy MRR × 12 estimate, not verified charges.
      item.revenue = null
    }

    return item
  })

  if (sort === 'mrr') {
    const isSeeded = typeof seed === 'number' && Number.isFinite(seed)
    items.sort((a, b) => {
      if (a.mrr === null && b.mrr === null) {
        if (isSeeded) {
          return seededOrderValue(a.id, seed!) - seededOrderValue(b.id, seed!) || a.id.localeCompare(b.id)
        }
        return (b.views ?? 0) - (a.views ?? 0) || a.id.localeCompare(b.id)
      }
      if (a.mrr === null) return 1
      if (b.mrr === null) return -1
      const revenueDiff = parseFormattedRevenue(b.revenue, b.mrr) - parseFormattedRevenue(a.revenue, a.mrr)
      if (revenueDiff !== 0) return revenueDiff
      const providerDiff = Number(Boolean(b.provider)) - Number(Boolean(a.provider))
      if (providerDiff !== 0) return providerDiff
      if (isSeeded && parseFormattedRevenue(a.revenue, a.mrr) === 0) {
        return seededOrderValue(a.id, seed!) - seededOrderValue(b.id, seed!) || a.id.localeCompare(b.id)
      }
      return (b.views ?? 0) - (a.views ?? 0) || a.id.localeCompare(b.id)
    })

    if (typeof limit === 'number' && limit < 1000) {
      return items.slice(offset, offset + limit)
    }
  }

  return items
}
