export default defineNuxtRouteMiddleware(async (to) => {
  const isDashboard = to.path === '/dashboard' || to.path.startsWith('/dashboard/') || to.path === '/en/dashboard' || to.path.startsWith('/en/dashboard/')
  if (!isDashboard) return

  const { isAuthenticated, checkSession } = useFounderSession()
  await checkSession()

  if (!isAuthenticated.value) {
    const isEn = to.path.startsWith('/en')
    const redirectPath = isEn ? '/en' : '/'
    return navigateTo({
      path: redirectPath,
      query: { login: '1' }
    })
  }
})
