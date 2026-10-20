import { fetchSaasList } from '~/modules/ranking/server/services/ranking'

export default defineEventHandler((event) => {
  setResponseHeaders(event, {
    'Cache-Control': 'public, max-age=0, s-maxage=60, stale-while-revalidate=300',
    'CDN-Cache-Control': 'max-age=60, stale-while-revalidate=300',
    'Vercel-CDN-Cache-Control': 's-maxage=60, stale-while-revalidate=300'
  })
  return fetchSaasList({ sort: 'mrr', limit: 100, excludeIncognito: true })
})
