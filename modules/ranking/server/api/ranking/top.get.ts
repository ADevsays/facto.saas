import { fetchSaasList } from '~/modules/ranking/server/services/ranking'

export default defineEventHandler((event) => {
  setResponseHeaders(event, {
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0, s-maxage=0',
    'Pragma': 'no-cache',
    'Expires': '0',
    'Surrogate-Control': 'no-store',
    'CDN-Cache-Control': 'no-store',
    'Vercel-CDN-Cache-Control': 'no-store'
  })
  return fetchSaasList({ sort: 'views', limit: 6 })
})
