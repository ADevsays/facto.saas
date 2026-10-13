import { supabase } from '~/server/lib/supabase'
import type { SaasListItem, ListQueryParams, SortOption } from '~/modules/ranking/types'

const SORT_COLUMN: Record<SortOption, string> = {
  mrr: 'mrr',
  latest: 'published_at',
  views: 'views',
}

export function formatPersistedRevenue(revenue: unknown, mrr: number | null): string {
  const numericRevenue = typeof revenue === 'number'
    ? revenue
    : typeof revenue === 'string' && revenue.trim() !== ''
      ? Number(revenue)
      : Number.NaN
  const value = Number.isFinite(numericRevenue)
    ? numericRevenue
    : mrr === null ? null : mrr * 12

  if (value === null) return '—'
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`.replace('.0', '')
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`
  return `$${Math.round(value)}`
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

  return {
    id: row.id as string,
    name: row.name as string | null,
    slug: (row.slug as string) || null,
    logoUrl: row.logo_url as string | null,
    websiteUrl: row.website_url as string | null,
    founderName: row.founder_name as string | null,
    isIncognito: row.is_incognito as boolean,
    mrr: row.mrr === null ? null : Number(row.mrr),
    revenue: formatPersistedRevenue(row.revenue, row.mrr === null ? null : Number(row.mrr)),
    currency: row.currency as string,
    category: selectedCat?.name ?? '',
    categorySlug: selectedCat?.slug ?? '',
    categories: cats,
    country: selectedCountry,
    provider: (row.payment_providers as Record<string, string>)?.slug as SaasListItem['provider'],
    views: row.views as number,
    publishedAt: row.published_at as string,
    description: (row.startup_type as string) || null,
  }
}

export async function fetchSaasList(params: ListQueryParams = {}): Promise<SaasListItem[]> {
  const { sort = 'mrr', category, country, q, limit, offset = 0 } = params
  const column = SORT_COLUMN[sort]
  const nullsFirst = sort === 'mrr' ? false : false

  const selectQuery = `
    id, name, slug, logo_url, website_url, founder_name, startup_type,
    is_incognito, mrr, revenue, currency, views, published_at,
    categories!saas_categories${category ? '!inner' : ''} ( name, slug ),
    countries!saas_countries${country ? '!inner' : ''} ( name, slug, flag, iso_code ),
    payment_providers ( name, slug )
  `

  const isExplicitLimited = typeof limit === 'number' && limit < 1000

  let rawData: any[] = []

  if (isExplicitLimited) {
    let query = supabase
      .from('saas_entries')
      .select(selectQuery)
      .eq('status', 'published')
      .order(column, { ascending: false, nullsFirst })
      .range(offset, offset + limit - 1)

    if (category) query = query.eq('categories.slug', category)
    if (country) query = query.eq('countries.slug', country)
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
    let currentFrom = offset

    while (true) {
      let query = supabase
        .from('saas_entries')
        .select(selectQuery)
        .eq('status', 'published')
        .order(column, { ascending: false, nullsFirst })
        .range(currentFrom, currentFrom + CHUNK_SIZE - 1)

      if (category) query = query.eq('categories.slug', category)
      if (country) query = query.eq('countries.slug', country)
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

  return rawData.map(row => mapRow(row as unknown as Record<string, unknown>, category))
}
