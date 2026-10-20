import { isViewTrackingEnabled, recordDailyView } from '~/server/lib/dailyViews'

export default defineEventHandler((event) => {
  if (!isViewTrackingEnabled() || event.method !== 'GET') return

  const pathname = getRequestURL(event).pathname
  if (
    pathname.startsWith('/_nuxt') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/__') ||
    pathname.includes('.')
  ) {
    return
  }

  const isProfilePage = (
    (pathname.startsWith('/saas/') && !pathname.startsWith('/saas/categoria') && !pathname.startsWith('/saas/pais') && !pathname.startsWith('/saas/continente')) ||
    (pathname.startsWith('/en/saas/') && !pathname.startsWith('/en/saas/categoria') && !pathname.startsWith('/en/saas/pais') && !pathname.startsWith('/en/saas/continente'))
  )
  if (isProfilePage) return

  recordDailyView().catch(() => {})
})
