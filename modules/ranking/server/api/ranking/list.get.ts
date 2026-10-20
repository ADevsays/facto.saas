import { fetchCountryStartups, fetchSaasList } from '~/modules/ranking/server/services/ranking'
import type { ListQueryParams, SortOption } from '~/modules/ranking/types'

function toPageNumber(value: unknown, fallback: number) {
  const number = Number(value)
  return Number.isFinite(number) && number >= 0 ? Math.floor(number) : fallback
}

export default defineEventHandler(async (event) => {
  setResponseHeaders(event, {
    'Cache-Control': 'private, no-store, max-age=0',
    'CDN-Cache-Control': 'no-store',
    'Vercel-CDN-Cache-Control': 'no-store'
  })

  const query = getQuery(event)

  if (query.scope === 'country') {
    const country = typeof query.country === 'string' ? query.country : ''
    if (!country) throw createError({ statusCode: 400, message: 'Country is required' })
    return fetchCountryStartups({
      country,
      limit: Math.min(Math.max(toPageNumber(query.limit, 12), 1), 24),
      offset: toPageNumber(query.offset, 0)
    })
  }

  if (query.scope === 'home') {
    const rankingLimit = Math.min(Math.max(toPageNumber(query.rankingLimit, 10), 1), 30)
    const rankingOffset = toPageNumber(query.rankingOffset, 0)
    const seed = query.seed !== undefined ? toPageNumber(query.seed, 0) : undefined

    if (query.rankingOnly === 'true') {
      return fetchSaasList({ sort: 'mrr', limit: rankingLimit, offset: rankingOffset, excludeIncognito: true, seed })
    }

    const [ranking, recent] = await Promise.all([
      fetchSaasList({ sort: 'mrr', limit: rankingLimit, offset: rankingOffset, excludeIncognito: true, seed }),
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
