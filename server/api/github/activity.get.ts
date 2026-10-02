export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  let raw = (query.target as string || query.repo as string || '').trim()

  raw = raw.replace(/^https?:\/\/github\.com\//i, '').replace(/\.git$/i, '').replace(/\/$/, '')

  if (!raw) {
    throw createError({ statusCode: 400, message: 'GitHub target (repo or username) is required' })
  }

  const isRepo = raw.includes('/')
  const cacheKey = `github:activity:${raw}`
  const storage = useStorage('cache')
  const cached = await storage.getItem<any>(cacheKey)

  if (cached && (Date.now() - cached.timestamp < 30 * 60 * 1000)) {
    return cached.data
  }

  const token = (query.token as string)?.trim() || process.env.GITHUB_TOKEN
  const headers: Record<string, string> = {
    'User-Agent': 'Facto-App/1.0',
    'Accept': 'application/vnd.github.v3+json'
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

  try {
    if (isRepo) {
      const parts = raw.split('/')
      const owner = parts[0].trim()
      const repo = parts[1].trim()
      const target = `${owner}/${repo}`

      let res: Response | null = null
      for (let attempt = 0; attempt < 3; attempt++) {
        res = await fetch(`https://api.github.com/repos/${target}/stats/commit_activity`, {
          headers,
          signal: AbortSignal.timeout(8000)
        })
        if (res.status !== 202) {
          break
        }
        if (attempt < 2) {
          await new Promise((resolve) => setTimeout(resolve, 1200))
        }
      }

      if (!res || res.status === 202) {
        return {
          target,
          type: 'repo',
          status: 'computing',
          message: 'GitHub is currently generating commit activity statistics.',
          totalContributions: 0,
          weeks: [],
          months: []
        }
      }

      if (!res.ok) {
        return {
          target,
          type: 'repo',
          status: res.status === 404 ? 'not_found' : (res.status === 401 || res.status === 403 ? 'unauthorized' : 'error'),
          message: res.status === 404
            ? 'Repositorio no encontrado o privado. GitHub bloquea la lectura de repositorios privados sin autenticación.'
            : 'Error al consultar la actividad en GitHub.',
          totalContributions: 0,
          weeks: [],
          months: []
        }
      }

      const data = await res.json()
      if (!Array.isArray(data) || data.length === 0) {
        return {
          target,
          type: 'repo',
          status: 'empty',
          totalContributions: 0,
          weeks: [],
          months: []
        }
      }

      let totalContributions = 0
      let maxCount = 1
      for (const w of data) {
        totalContributions += Number(w.total) || 0
        if (Array.isArray(w.days)) {
          for (const d of w.days) {
            if (d > maxCount) maxCount = d
          }
        }
      }

      const months: { name: string; weekIndex: number }[] = []
      let lastMonth = -1

      const weeks = data.map((w: any, weekIdx: number) => {
        const weekDate = new Date(w.week * 1000)
        const m = weekDate.getUTCMonth()
        if (m !== lastMonth) {
          months.push({ name: monthNames[m], weekIndex: weekIdx })
          lastMonth = m
        }

        const days = (w.days || []).map((count: number, dayIdx: number) => {
          const dayDate = new Date(w.week * 1000 + dayIdx * 86400000)
          const dateStr = dayDate.toISOString().split('T')[0]
          let level: 0 | 1 | 2 | 3 | 4 = 0
          if (count > 0) {
            if (count >= 10 || count >= maxCount * 0.75) level = 4
            else if (count >= 6 || count >= maxCount * 0.5) level = 3
            else if (count >= 3 || count >= maxCount * 0.25) level = 2
            else level = 1
          }
          return {
            date: dateStr,
            count,
            level
          }
        })

        return {
          week: w.week,
          total: w.total || 0,
          days
        }
      })

      const result = {
        target,
        type: 'repo',
        status: 'synced',
        totalContributions,
        weeks,
        months
      }

      await storage.setItem(cacheKey, { data: result, timestamp: Date.now() })
      return result
    } else {
      // User profile mode
      const username = raw
      const res = await fetch(`https://github-contributions-api.jogruber.de/v4/${encodeURIComponent(username)}?y=last`, {
        signal: AbortSignal.timeout(8000)
      })

      if (!res.ok) {
        return {
          target: username,
          type: 'user',
          status: res.status === 404 ? 'not_found' : 'error',
          message: 'Usuario de GitHub no encontrado',
          totalContributions: 0,
          weeks: [],
          months: []
        }
      }

      const data = await res.json()
      const totalContributions = data.total?.lastYear || data.total?.[Object.keys(data.total)[0]] || 0
      const contributions: any[] = data.contributions || []

      const weeks: any[] = []
      const months: { name: string; weekIndex: number }[] = []
      let lastMonth = -1

      for (let i = 0; i < contributions.length; i += 7) {
        const weekSlice = contributions.slice(i, i + 7)
        const weekIdx = Math.floor(i / 7)
        if (weekSlice[0]) {
          const d = new Date(weekSlice[0].date)
          const m = d.getUTCMonth()
          if (m !== lastMonth) {
            months.push({ name: monthNames[m], weekIndex: weekIdx })
            lastMonth = m
          }
        }
        weeks.push({
          week: new Date(weekSlice[0]?.date || Date.now()).getTime() / 1000,
          total: weekSlice.reduce((sum: number, item: any) => sum + (item.count || 0), 0),
          days: weekSlice.map((item: any) => ({
            date: item.date,
            count: item.count || 0,
            level: (item.level ?? 0) as 0 | 1 | 2 | 3 | 4
          }))
        })
      }

      const result = {
        target: username,
        type: 'user',
        status: 'synced',
        totalContributions,
        weeks,
        months
      }

      await storage.setItem(cacheKey, { data: result, timestamp: Date.now() })
      return result
    }
  } catch (err: any) {
    return {
      target: raw,
      type: isRepo ? 'repo' : 'user',
      status: 'error',
      message: 'Tiempo de espera agotado al conectar con GitHub',
      totalContributions: 0,
      weeks: [],
      months: []
    }
  }
})
