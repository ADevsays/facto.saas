import { fetchSaasList } from '~/modules/ranking/server/services/ranking'
import type { ListQueryParams, SortOption } from '~/modules/ranking/types'

export default defineEventHandler(async (event) => {
  setResponseHeaders(event, {
    'Cache-Control': 'public, max-age=0, s-maxage=60, stale-while-revalidate=300',
    'CDN-Cache-Control': 'max-age=60, stale-while-revalidate=300',
    'Vercel-CDN-Cache-Control': 's-maxage=60, stale-while-revalidate=300'
  })

  const query = getQuery(event)

  const params: ListQueryParams = {
    sort: (query.sort as SortOption) ?? 'mrr',
    category: query.category as string | undefined,
    country: query.country as string | undefined,
    q: query.q as string | undefined,
    limit: query.limit ? Number(query.limit) : 1000,
    offset: query.offset ? Number(query.offset) : 0,
  }

  return fetchSaasList(params)
})
