import { supabase } from '~/server/lib/supabase'
import { useStorage } from '#imports'
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
    provider: (row.payment_providers as Record<string, string>)?.slug as SaasListItem['provider'],
    views: row.views as number,
    publishedAt: row.published_at as string,
  }
}

export async function fetchSaasList(params: ListQueryParams = {}): Promise<SaasListItem[]> {
  const { sort = 'mrr', category, q, limit = 100, offset = 0 } = params
  const column = SORT_COLUMN[sort]
  const nullsFirst = sort === 'mrr' ? false : false

  const selectQuery = `
    id, name, logo_url, website_url, founder_name,
    is_incognito, mrr, currency, views, published_at,
    categories!saas_categories${category ? '!inner' : ''} ( name, slug ),
    payment_providers ( name, slug )
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

  if (q?.trim()) {
    const term = `%${q.trim()}%`
    query = query.or(`name.ilike.${term},founder_name.ilike.${term}`)
  }

  const { data, error } = await query

  if (error) throw createError({ statusCode: 500, message: error.message })

  const items = (data ?? []).map(row => mapRow(row as unknown as Record<string, unknown>, category))
  
  const storage = useStorage('cache')
  await Promise.all(items.map(async (item) => {
    try {
      const metrics: any = await storage.getItem(`metrics:${item.id}`)
      if (metrics) {
        if (metrics.mrr !== undefined) item.mrr = metrics.mrr
        if (metrics.revenue !== undefined) item.revenue = metrics.revenue
      }
    } catch (e) {}
  }))

  return items
}
