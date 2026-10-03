import { fetchSaasList } from '~/modules/ranking/server/services/ranking'
import type { ListQueryParams, SortOption } from '~/modules/ranking/types'

export default defineEventHandler(async (event) => {
  setResponseHeaders(event, {
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0, s-maxage=0',
    'Pragma': 'no-cache',
    'Expires': '0',
    'Surrogate-Control': 'no-store',
    'CDN-Cache-Control': 'no-store',
    'Vercel-CDN-Cache-Control': 'no-store'
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
