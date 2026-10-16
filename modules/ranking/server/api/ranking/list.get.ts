import { fetchSaasList } from '~/modules/ranking/server/services/ranking'
import type { ListQueryParams, SortOption } from '~/modules/ranking/types'

export default defineEventHandler(async (event) => {
  setResponseHeaders(event, {
    'Cache-Control': 'private, no-store, max-age=0',
    'CDN-Cache-Control': 'no-store',
    'Vercel-CDN-Cache-Control': 'no-store'
  })

  const query = getQuery(event)

  if (query.scope === 'home') {
    const [ranking, recent] = await Promise.all([
      fetchSaasList({ sort: 'mrr', limit: 30, excludeIncognito: true }),
      fetchSaasList({ sort: 'latest', limit: 6 }),
    ])
    return [...new Map([...ranking, ...recent].map(item => [item.id, item])).values()]
  }

  const params: ListQueryParams = {
    sort: (query.sort as SortOption) ?? 'mrr',
    category: query.category as string | undefined,
    country: query.country as string | undefined,
    countries: typeof query.countries === 'string' ? query.countries.split(',').filter(Boolean) : undefined,
    q: query.q as string | undefined,
    limit: query.limit ? Number(query.limit) : 1000,
    offset: query.offset ? Number(query.offset) : 0,
    excludeIncognito: query.excludeIncognito === 'true' || query.scope === 'ranking',
  }

  return fetchSaasList(params)
})
