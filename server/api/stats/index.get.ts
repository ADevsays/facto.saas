import { supabase } from '~/server/lib/supabase'
import type {
  StatDayPoint,
  StatWeekPoint,
  StatCategoryPoint,
  StatCountryPoint,
  StatsOverviewResponse
} from '~/modules/stats/types'

export type {
  StatDayPoint,
  StatWeekPoint,
  StatCategoryPoint,
  StatCountryPoint,
  StatsOverviewResponse
}

const COUNTRY_ISO_MAP: Record<string, string> = {
  colombia: 'co',
  espana: 'es',
  spain: 'es',
  mexico: 'mx',
  argentina: 'ar',
  chile: 'cl',
  peru: 'pe',
  estados_unidos: 'us',
  united_states: 'us',
  'united-states': 'us',
  uruguay: 'uy',
  venezuela: 've',
  ecuador: 'ec',
  bolivia: 'bo',
  paraguay: 'py',
  guatemala: 'gt',
  costa_rica: 'cr',
  panama: 'pa',
  dominican_republic: 'do',
  republica_dominicana: 'do',
  brazil: 'br',
  brasil: 'br',
  cuba: 'cu',
  'el-salvador': 'sv',
  'puerto-rico': 'pr',
  honduras: 'hn',
  nicaragua: 'ni'
}

function isValidTimeZone(tz?: string | null): boolean {
  if (!tz) return false
  try {
    Intl.DateTimeFormat(undefined, { timeZone: tz })
    return true
  } catch {
    return false
  }
}

function formatDate(d: Date, timeZone = 'America/Bogota'): string {
  try {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(d)
  } catch {
    return d.toISOString().slice(0, 10)
  }
}

function getWeekKey(d: Date): { key: string; label: string } {
  const target = new Date(d.valueOf())
  const dayNr = (d.getDay() + 6) % 7
  target.setDate(target.getDate() - dayNr + 3)
  const firstThursday = target.valueOf()
  target.setMonth(0, 1)
  if (target.getDay() !== 4) {
    target.setMonth(0, 1 + ((4 - target.getDay()) + 7) % 7)
  }
  const weekNum = 1 + Math.ceil((firstThursday - target.valueOf()) / 604800000)
  const year = d.getFullYear()
  return {
    key: `${year}-W${String(weekNum).padStart(2, '0')}`,
    label: `Sem ${weekNum} (${d.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })})`
  }
}

export default defineEventHandler(async (event): Promise<StatsOverviewResponse> => {
  const query = getQuery(event)
  const headerTz = getHeader(event, 'x-timezone')
  const requestedTz = (typeof query.tz === 'string' ? query.tz : headerTz) || process.env.NOTIFIER_TIMEZONE || 'America/Bogota'
  const timeZone = isValidTimeZone(requestedTz) ? requestedTz : 'America/Bogota'

  const { data: rawRows, error: dbError } = await supabase
    .from('saas_entries')
    .select(`
      id, name, slug, mrr, revenue, currency, views, published_at, is_incognito,
      categories!saas_categories ( name, slug ),
      countries!saas_countries ( id, name, slug, flag, iso_code ),
      saas_metrics_cache ( created_at, history_synced_at, history_cache )
    `)
    .eq('status', 'published')

  if (dbError) {
    throw createError({ statusCode: 500, message: dbError.message })
  }

  const rows = (rawRows || []).map((row: any) => {
    const rawDate = row.published_at || new Date().toISOString()
    const validDate = new Date(rawDate).toISOString()
    const mrr = row.mrr !== null && !isNaN(Number(row.mrr)) && Number(row.mrr) >= 0 ? Number(row.mrr) : null
    const views = !isNaN(Number(row.views)) && Number(row.views) >= 0 ? Number(row.views) : 0
    const cats = (row.categories as any[]) || []
    const countries = (row.countries as any[]) || []

    const cache = Array.isArray(row.saas_metrics_cache) ? row.saas_metrics_cache[0] : row.saas_metrics_cache
    const mrrDate = cache?.created_at
      ? new Date(cache.created_at).toISOString()
      : (cache?.history_synced_at ? new Date(cache.history_synced_at).toISOString() : validDate)

    const history = cache?.history_cache
    let realAllTimeRevenue = 0
    if (history?.charges?.length) {
      realAllTimeRevenue = history.charges.reduce((sum: number, c: any) => sum + (Number(c.amount) || 0), 0)
    }
    const revenue = realAllTimeRevenue > 0
      ? Math.round(realAllTimeRevenue)
      : (row.revenue && Number(row.revenue) > 0 ? Math.round(Number(row.revenue)) : (mrr ?? 0))

    return {
      id: row.id,
      name: row.name || 'Startup',
      slug: row.slug,
      mrr,
      revenue,
      mrrDate,
      views,
      date: validDate,
      isIncognito: Boolean(row.is_incognito),
      category: cats[0] ? { name: cats[0].name, slug: cats[0].slug } : null,
      country: countries[0] ? {
        name: countries[0].name,
        slug: countries[0].slug,
        flag: countries[0].flag || '🌐',
        isoCode: (countries[0].iso_code || COUNTRY_ISO_MAP[countries[0].slug] || '').toLowerCase()
      } : null
    }
  })

  // Sort rows chronologically
  rows.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  // Overall totals
  let totalMrr = 0
  let totalRevenue = 0
  let totalViews = 0
  let verifiedCount = 0

  const categoryMap = new Map<string, StatCategoryPoint>()
  const countryMap = new Map<string, StatCountryPoint>()
  const dailyAdditionsMap = new Map<string, { startups: number; mrr: number; revenue: number; views: number }>()

  for (const item of rows) {
    const isVerified = (item.mrr !== null && item.mrr > 0) || item.revenue > 0
    if (isVerified) {
      verifiedCount++
      if (item.mrr) totalMrr += item.mrr
      if (item.revenue) totalRevenue += item.revenue
    }
    totalViews += item.views

    // Category aggregation
    if (item.category) {
      const catSlug = item.category.slug
      const existing = categoryMap.get(catSlug) || {
        name: item.category.name,
        slug: catSlug,
        count: 0,
        totalMrr: 0,
        totalViews: 0
      }
      existing.count++
      if (item.mrr) existing.totalMrr += item.mrr
      existing.totalViews += item.views
      categoryMap.set(catSlug, existing)
    }

    // Country aggregation
    if (item.country && item.country.slug !== 'global') {
      const cSlug = item.country.slug
      const existing = countryMap.get(cSlug) || {
        name: item.country.name,
        slug: cSlug,
        flag: item.country.flag,
        isoCode: item.country.isoCode,
        count: 0,
        totalMrr: 0,
        totalViews: 0
      }
      existing.count++
      if (item.mrr) existing.totalMrr += item.mrr
      existing.totalViews += item.views
      countryMap.set(cSlug, existing)
    }

    // Daily bucket for startup launches & views
    const startupDayKey = formatDate(new Date(item.date), timeZone)
    const startupDayEntry = dailyAdditionsMap.get(startupDayKey) || { startups: 0, mrr: 0, revenue: 0, views: 0 }
    startupDayEntry.startups++
    startupDayEntry.views += item.views
    dailyAdditionsMap.set(startupDayKey, startupDayEntry)

    // Daily bucket for MRR and Revenue additions
    if ((item.mrr && item.mrr > 0) || (item.revenue && item.revenue > 0)) {
      const revDayKey = item.mrrDate ? formatDate(new Date(item.mrrDate), timeZone) : startupDayKey
      const revDayEntry = dailyAdditionsMap.get(revDayKey) || { startups: 0, mrr: 0, revenue: 0, views: 0 }
      if (item.mrr) revDayEntry.mrr += item.mrr
      if (item.revenue) revDayEntry.revenue += item.revenue
      dailyAdditionsMap.set(revDayKey, revDayEntry)
    }
  }

  // Build a continuous daily timeline
  const now = new Date()
  const todayStr = formatDate(now, timeZone)
  const earliestDate = rows.length > 0 ? new Date(rows[0].date) : new Date(now.getTime() - 30 * 86400000)
  const startDate = new Date(Math.min(earliestDate.getTime(), now.getTime() - 14 * 86400000))
  startDate.setHours(0, 0, 0, 0)

  const daily: StatDayPoint[] = []
  let cumulativeStartups = 0
  let cumulativeMrr = 0
  let cumulativeViews = 0

  const cur = new Date(startDate)
  while (formatDate(cur, timeZone) <= todayStr) {
    const dayStr = formatDate(cur, timeZone)
    const dayData = dailyAdditionsMap.get(dayStr)
    const added = dayData?.startups || 0
    const mrrAdded = dayData?.mrr || 0
    const viewsAdded = dayData?.views || 0

    cumulativeStartups += added
    cumulativeMrr += mrrAdded
    cumulativeViews += viewsAdded

    daily.push({
      date: dayStr,
      startupsAdded: added,
      cumulativeStartups,
      mrr: cumulativeMrr,
      views: cumulativeViews,
      mrrAdded,
      viewsAdded
    })

    cur.setDate(cur.getDate() + 1)
  }

  // Build weekly timeline
  const weeklyMap = new Map<string, StatWeekPoint>()
  for (const day of daily) {
    const d = new Date(day.date + 'T12:00:00Z')
    const { key, label } = getWeekKey(d)
    const existing = weeklyMap.get(key) || {
      week: key,
      label,
      startupsAdded: 0,
      cumulativeStartups: day.cumulativeStartups,
      mrr: day.mrr
    }
    existing.startupsAdded += day.startupsAdded
    existing.cumulativeStartups = day.cumulativeStartups
    existing.mrr = day.mrr
    weeklyMap.set(key, existing)
  }

  const weekly = Array.from(weeklyMap.values())

  // Calculate 30d growth
  const thirtyDaysAgoStr = formatDate(new Date(now.getTime() - 30 * 86400000), timeZone)
  const point30dAgo = daily.find(d => d.date === thirtyDaysAgoStr) || daily[0]
  const prevStartups = point30dAgo ? point30dAgo.cumulativeStartups : 0
  const prevMrr = point30dAgo ? point30dAgo.mrr : 0

  const startupsGrowth30d = prevStartups > 0 ? Math.round(((rows.length - prevStartups) / prevStartups) * 100) : 100
  const mrrGrowth30d = prevMrr > 0 ? Math.round(((totalMrr - prevMrr) / prevMrr) * 100) : (totalMrr > 0 ? 100 : 0)

  const byCategory = Array.from(categoryMap.values()).sort((a, b) => b.totalMrr - a.totalMrr || b.count - a.count)
  const byCountry = Array.from(countryMap.values()).sort((a, b) => b.totalMrr - a.totalMrr || b.count - a.count)

  const todayBucket = dailyAdditionsMap.get(todayStr) || { startups: 0, mrr: 0, revenue: 0, views: 0 }

  return {
    summary: {
      totalStartups: rows.length,
      totalMrr,
      totalRevenue,
      totalViews,
      avgMrr: verifiedCount > 0 ? Math.round(totalMrr / verifiedCount) : 0,
      verifiedCount,
      countriesCount: countryMap.size,
      categoriesCount: categoryMap.size,
      today: {
        date: todayStr,
        startupsAdded: todayBucket.startups,
        mrrAdded: todayBucket.mrr,
        revenueAdded: todayBucket.revenue || todayBucket.mrr,
        viewsAdded: todayBucket.views
      },
      growth30d: {
        startups: startupsGrowth30d,
        mrr: mrrGrowth30d
      }
    },
    timeline: {
      daily,
      weekly
    },
    byCategory,
    byCountry
  }
})
