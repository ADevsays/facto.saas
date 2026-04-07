import { fetchSaasList } from '~/modules/ranking/server/services/ranking'
import type { ListQueryParams, SortOption } from '~/modules/ranking/types'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)

  const params: ListQueryParams = {
    sort: (query.sort as SortOption) ?? 'mrr',
    category: query.category as string | undefined,
    q: query.q as string | undefined,
    limit: query.limit ? Number(query.limit) : 100,
    offset: query.offset ? Number(query.offset) : 0,
  }

  return fetchSaasList(params)
})
