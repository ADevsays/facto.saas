import { supabase } from '~/server/lib/supabase'
import type { SaasListItem, ListQueryParams, SortOption } from '~/modules/ranking/types'

const SORT_COLUMN: Record<SortOption, string> = {
  mrr: 'mrr',
  latest: 'published_at',
  views: 'views',
}

function mapRow(row: Record<string, unknown>): SaasListItem {
  return {
    id: row.id as string,
    name: row.name as string | null,
    logoUrl: row.logo_url as string | null,
    websiteUrl: row.website_url as string | null,
    founderName: row.founder_name as string | null,
    isIncognito: row.is_incognito as boolean,
    mrr: row.mrr as number | null,
    currency: row.currency as string,
    category: (row.categories as Record<string, string>)?.name ?? '',
    categorySlug: (row.categories as Record<string, string>)?.slug ?? '',
    provider: (row.payment_providers as Record<string, string>)?.slug as SaasListItem['provider'],
    views: row.views as number,
    publishedAt: row.published_at as string,
  }
}

export async function fetchSaasList(params: ListQueryParams = {}): Promise<SaasListItem[]> {
  const { sort = 'mrr', category, q, limit = 100, offset = 0 } = params
  const column = SORT_COLUMN[sort]
  const nullsFirst = sort === 'mrr' ? false : false

  let query = supabase
    .from('saas_entries')
    .select(`
      id, name, logo_url, website_url, founder_name,
      is_incognito, mrr, currency, views, published_at,
      categories ( name, slug ),
      payment_providers ( name, slug )
    `)
    .order(column, { ascending: false, nullsFirst })
    .range(offset, offset + limit - 1)

  if (category) {
    const { data: cat } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', category)
      .single()
    if (cat) query = query.eq('category_id', cat.id)
  }

  if (q?.trim()) {
    const term = `%${q.trim()}%`
    query = query.or(`name.ilike.${term},founder_name.ilike.${term}`)
  }

  const { data, error } = await query

  if (error) throw createError({ statusCode: 500, message: error.message })

  return (data ?? []).map(mapRow)
}
