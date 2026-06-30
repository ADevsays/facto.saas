import { supabase } from '~/server/lib/supabase'
import type { SaasListItem, ListQueryParams, SortOption } from '~/modules/ranking/types'

const SORT_COLUMN: Record<SortOption, string> = {
  mrr: 'mrr',
  latest: 'published_at',
  views: 'views',
}

function mapRow(row: Record<string, unknown>, searchCategory?: string): SaasListItem {
  const cats = (row.categories as { name: string; slug: string }[]) || []
  let selectedCat = cats[0]
  if (searchCategory) {
    const matched = cats.find(c => c.slug === searchCategory)
    if (matched) selectedCat = matched
  }

  const countries = (row.countries as { name: string; slug: string; flag: string }[]) || []
  let selectedCountry = countries[0] || null

  return {
    id: row.id as string,
    name: row.name as string | null,
    logoUrl: row.logo_url as string | null,
    websiteUrl: row.website_url as string | null,
    founderName: row.founder_name as string | null,
    isIncognito: row.is_incognito as boolean,
    mrr: row.mrr as number | null,
    currency: row.currency as string,
    category: selectedCat?.name ?? '',
    categorySlug: selectedCat?.slug ?? '',
    categories: cats,
    country: selectedCountry,
    provider: (row.payment_providers as Record<string, string>)?.slug as SaasListItem['provider'],
    views: row.views as number,
    publishedAt: row.published_at as string,
  }
}

export async function fetchSaasList(params: ListQueryParams = {}): Promise<SaasListItem[]> {
  const { sort = 'mrr', category, country, q, limit = 100, offset = 0 } = params
  const column = SORT_COLUMN[sort]
  const nullsFirst = sort === 'mrr' ? false : false

  const selectQuery = `
    id, name, logo_url, website_url, founder_name,
    is_incognito, mrr, currency, views, published_at,
    categories!saas_categories${category ? '!inner' : ''} ( name, slug ),
    countries!saas_countries${country ? '!inner' : ''} ( name, slug, flag ),
    payment_providers ( name, slug ),
    saas_metrics_cache ( history_cache )
  `

  let query = supabase
    .from('saas_entries')
    .select(selectQuery)
    .eq('status', 'published')
    .order(column, { ascending: false, nullsFirst })
    .range(offset, offset + limit - 1)

  if (category) {
    query = query.eq('categories.slug', category)
  }

  if (country) {
    query = query.eq('countries.slug', country)
  }

  if (q?.trim()) {
    const term = `%${q.trim()}%`
    query = query.or(`name.ilike.${term},founder_name.ilike.${term}`)
  }

  const { data, error } = await query

  if (error) throw createError({ statusCode: 500, message: error.message })

  const items = (data ?? []).map(row => {
    const item = mapRow(row as unknown as Record<string, unknown>, category)
    const cacheData = (row as any).saas_metrics_cache
    if (cacheData) {
      const cacheObj = Array.isArray(cacheData) ? cacheData[0] : cacheData
      if (cacheObj && cacheObj.history_cache) {
        const history = cacheObj.history_cache
        let mrrVal = item.mrr
        let realAllTimeRevenue = 0

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

        let allTimeRev = '—'
        if (realAllTimeRevenue > 0) {
          if (realAllTimeRevenue >= 1000000) allTimeRev = `$${(realAllTimeRevenue / 1000000).toFixed(1)}M`.replace('.0', '')
          else if (realAllTimeRevenue >= 1000) allTimeRev = `$${(realAllTimeRevenue / 1000).toFixed(0)}K`
          else allTimeRev = `$${Math.round(realAllTimeRevenue)}`
        } else if (mrrVal !== null && mrrVal > 0) {
          const annual = mrrVal * 12
          if (annual >= 1000000) allTimeRev = `$${(annual / 1000000).toFixed(1)}M`.replace('.0', '')
          else if (annual >= 1000) allTimeRev = `$${(annual / 1000).toFixed(0)}K`
          else allTimeRev = `$${annual}`
        } else if (mrrVal === 0) {
          allTimeRev = '$0'
        }

        item.mrr = mrrVal
        item.revenue = allTimeRev
      }
    } else {
      let allTimeRev = '—'
      if (item.mrr !== null && item.mrr > 0) {
        const annual = item.mrr * 12
        if (annual >= 1000000) allTimeRev = `$${(annual / 1000000).toFixed(1)}M`.replace('.0', '')
        else if (annual >= 1000) allTimeRev = `$${(annual / 1000).toFixed(0)}K`
        else allTimeRev = `$${annual}`
      } else if (item.mrr === 0) {
        allTimeRev = '$0'
      }
      item.revenue = allTimeRev
    }
    return item
  })

  return items
}
