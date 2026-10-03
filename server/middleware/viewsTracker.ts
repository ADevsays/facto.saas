import { recordDailyView } from '~/server/lib/dailyViews'

export default defineEventHandler((event) => {
  if (event.method !== 'GET') return

  const url = getRequestURL(event)
  const pathname = url.pathname

  // Ignore static assets, internal endpoints, and API calls
  if (
    pathname.startsWith('/_nuxt') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/__') ||
    pathname.includes('.')
  ) {
    return
  }

  // Profile visits (/saas/:slug) are handled directly by server/api/saas/[slug].get.ts to avoid double-counting
  const isProfilePage = (
    (pathname.startsWith('/saas/') && !pathname.startsWith('/saas/categoria') && !pathname.startsWith('/saas/pais') && !pathname.startsWith('/saas/continente')) ||
    (pathname.startsWith('/en/saas/') && !pathname.startsWith('/en/saas/categoria') && !pathname.startsWith('/en/saas/pais') && !pathname.startsWith('/en/saas/continente'))
  )
  if (isProfilePage) return

  // Non-blocking asynchronous daily visit increment
  recordDailyView().catch(() => {})
})
