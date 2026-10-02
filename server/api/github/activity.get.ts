export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  let raw = (query.target as string || query.repo as string || '').trim()

  raw = raw
    .replace(/^https?:\/\//i, '')
    .replace(/^(www\.)?github\.com\//i, '')
    .replace(/\.git$/i, '')
    .replace(/^\/+|\/+$/g, '')

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

  function buildWeeksFromDailyCounts(dailyMap: Map<string, number>) {
    const now = new Date()
    const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
    const dayOfWeek = today.getUTCDay()
    const endDay = new Date(today)
    endDay.setUTCDate(today.getUTCDate() + (6 - dayOfWeek))

    const totalDays = 52 * 7
    const startDay = new Date(endDay)
    startDay.setUTCDate(endDay.getUTCDate() - totalDays + 1)

    let maxCount = 1
    for (const count of dailyMap.values()) {
      if (count > maxCount) maxCount = count
    }

    let totalContributions = 0
    const weeks: any[] = []
    const months: { name: string; weekIndex: number }[] = []
    let lastMonth = -1

    for (let w = 0; w < 52; w++) {
      const days: any[] = []
      let weekTotal = 0
      let weekStartTimestamp = 0

      for (let d = 0; d < 7; d++) {
        const current = new Date(startDay)
        current.setUTCDate(startDay.getUTCDate() + (w * 7 + d))
        const dateStr = current.toISOString().split('T')[0]
        if (d === 0) {
          weekStartTimestamp = Math.floor(current.getTime() / 1000)
          const m = current.getUTCMonth()
          if (m !== lastMonth) {
            months.push({ name: monthNames[m], weekIndex: w })
            lastMonth = m
          }
        }

        const isFuture = current.getTime() > today.getTime()
        const count = isFuture ? 0 : (dailyMap.get(dateStr) || 0)
        weekTotal += count
        totalContributions += count

        let level: 0 | 1 | 2 | 3 | 4 = 0
        if (count > 0) {
          if (count >= 10 || count >= maxCount * 0.75) level = 4
          else if (count >= 6 || count >= maxCount * 0.5) level = 3
          else if (count >= 3 || count >= maxCount * 0.25) level = 2
          else level = 1
        }

        days.push({ date: dateStr, count, level })
      }

      weeks.push({
        week: weekStartTimestamp,
        total: weekTotal,
        days
      })
    }

    return { totalContributions, weeks, months }
  }

  async function fetchUserFallback(username: string) {
    try {
      const res = await fetch(`https://github-contributions-api.jogruber.de/v4/${encodeURIComponent(username)}?y=last`, {
        signal: AbortSignal.timeout(8000)
      })

      if (!res.ok) return null

      const data = await res.json()
      const totalContributions = data.total?.lastYear || data.total?.[Object.keys(data.total || {})[0]] || 0
      const contributions: any[] = data.contributions || []

      if (!contributions.length) return null

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
          week: Math.floor(new Date(weekSlice[0]?.date || Date.now()).getTime() / 1000),
          total: weekSlice.reduce((sum: number, item: any) => sum + (item.count || 0), 0),
          days: weekSlice.map((item: any) => ({
            date: item.date,
            count: item.count || 0,
            level: (item.level ?? 0) as 0 | 1 | 2 | 3 | 4
          }))
        })
      }

      return {
        target: username,
        type: 'user',
        status: 'synced',
        totalContributions,
        weeks,
        months
      }
    } catch {
      return null
    }
  }

  try {
    if (isRepo) {
      const parts = raw.split('/')
      const owner = parts[0].trim()
      const repo = parts[1].trim()
      const target = `${owner}/${repo}`

      // 1. Try GitHub commit activity stats endpoint
      let statsRes: Response | null = null
      try {
        statsRes = await fetch(`https://api.github.com/repos/${target}/stats/commit_activity`, {
          headers,
          signal: AbortSignal.timeout(5000)
        })
      } catch {}

      if (statsRes && statsRes.status === 200) {
        const data = await statsRes.json().catch(() => null)
        if (Array.isArray(data) && data.length > 0) {
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
              return { date: dateStr, count, level }
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
        }
      }

      // 2. Fallback: Query commits directly if stats are 202 (computing) or empty
      try {
        const commitsRes = await fetch(`https://api.github.com/repos/${target}/commits?per_page=100`, {
          headers,
          signal: AbortSignal.timeout(6000)
        })

        if (commitsRes.ok) {
          const commits = await commitsRes.json().catch(() => null)
          if (Array.isArray(commits) && commits.length > 0) {
            const dailyMap = new Map<string, number>()
            for (const c of commits) {
              const dateStr = (c.commit?.author?.date || c.commit?.committer?.date || '').split('T')[0]
              if (dateStr) {
                dailyMap.set(dateStr, (dailyMap.get(dateStr) || 0) + 1)
              }
            }

            const { totalContributions, weeks, months } = buildWeeksFromDailyCounts(dailyMap)
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
          }
        }
      } catch {}

      // 3. Fallback: Use owner's public contributions if repo endpoints are rate limited (403) or private
      const ownerActivity = await fetchUserFallback(owner)
      if (ownerActivity) {
        const result = {
          ...ownerActivity,
          target,
          type: 'repo'
        }
        await storage.setItem(cacheKey, { data: result, timestamp: Date.now() })
        return result
      }

      return {
        target,
        type: 'repo',
        status: 'error',
        message: 'No se pudo obtener la actividad del repositorio.',
        totalContributions: 0,
        weeks: [],
        months: []
      }
    } else {
      // User profile mode
      const username = raw
      const userActivity = await fetchUserFallback(username)
      if (userActivity) {
        await storage.setItem(cacheKey, { data: userActivity, timestamp: Date.now() })
        return userActivity
      }

      return {
        target: username,
        type: 'user',
        status: 'not_found',
        message: 'Usuario de GitHub no encontrado',
        totalContributions: 0,
        weeks: [],
        months: []
      }
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
