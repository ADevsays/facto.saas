export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  let rawRepo = (query.repo as string || '').trim()
  
  // Limpiar URL completa si el usuario la pegó
  rawRepo = rawRepo
    .replace(/^https?:\/\//i, '')
    .replace(/^(www\.)?github\.com\//i, '')
    .replace(/\.git$/i, '')
    .replace(/^\/+|\/+$/g, '')

  const parts = rawRepo.split('/')
  if (parts.length < 2 || !parts[0] || !parts[1]) {
    throw createError({ statusCode: 400, message: 'Valid GitHub repository (owner/repo) is required' })
  }
  const repo = `${parts[0].trim()}/${parts[1].trim()}`

  const cacheKey = `github:commits:${repo}`
  const storage = useStorage('cache')
  const cached = await storage.getItem<any>(cacheKey)

  if (cached && (Date.now() - cached.timestamp < 15 * 60 * 1000)) {
    return { commits: cached.commits, repo, status: 'synced' }
  }

  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 6000)

    const headers: Record<string, string> = {
      'User-Agent': 'Facto-App/1.0',
      'Accept': 'application/vnd.github.v3+json'
    }

    const token = (query.token as string)?.trim() || process.env.GITHUB_TOKEN
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    const res = await fetch(`https://api.github.com/repos/${repo}/commits?per_page=5`, {
      headers,
      signal: controller.signal
    })
    clearTimeout(timeoutId)

    if (!res.ok) {
      const status = res.status === 404 ? 'not_found' : (res.status === 401 || res.status === 403 ? 'unauthorized' : 'error')
      const message = res.status === 404 
        ? 'Repositorio no encontrado o privado. GitHub bloquea la lectura de repositorios privados.' 
        : 'Error de autenticación o límite de peticiones de GitHub excedido.'
      return { commits: cached?.commits || [], repo, status, message }
    }

    const data = await res.json()
    const commits = (Array.isArray(data) ? data : []).map((c: any) => ({
      sha: c.sha?.substring(0, 7) || '',
      message: c.commit?.message?.split('\n')[0] || '',
      authorName: c.commit?.author?.name || c.author?.login || 'Developer',
      authorAvatar: c.author?.avatar_url || null,
      date: c.commit?.author?.date || null,
      url: c.html_url || `https://github.com/${repo}/commit/${c.sha}`
    }))

    await storage.setItem(cacheKey, { commits, timestamp: Date.now() })
    return { commits, repo, status: 'synced' }
  } catch (error) {
    return { commits: cached?.commits || [], repo, status: 'timeout' }
  }
})
