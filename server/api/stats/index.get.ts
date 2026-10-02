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

function formatDate(d: Date): string {
  return d.toISOString().slice(0, 10)
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

export default defineEventHandler(async (): Promise<StatsOverviewResponse> => {
  const { data: rawRows, error: dbError } = await supabase
    .from('saas_entries')
    .select(`
      id, name, slug, mrr, currency, views, published_at, is_incognito,
      categories!saas_categories ( name, slug ),
      countries!saas_countries ( id, name, slug, flag, iso_code ),
      saas_metrics_cache ( history_cache )
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

    return {
      id: row.id,
      name: row.name || 'Startup',
      slug: row.slug,
      mrr,
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
  let totalViews = 0
  let verifiedCount = 0

  const categoryMap = new Map<string, StatCategoryPoint>()
  const countryMap = new Map<string, StatCountryPoint>()
  const dailyAdditionsMap = new Map<string, { startups: number; mrr: number; views: number }>()

  for (const item of rows) {
    const isVerified = item.mrr !== null && item.mrr > 0
    if (isVerified) {
      verifiedCount++
      totalMrr += item.mrr!
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

    // Daily bucket
    const dayKey = item.date.slice(0, 10)
    const dayEntry = dailyAdditionsMap.get(dayKey) || { startups: 0, mrr: 0, views: 0 }
    dayEntry.startups++
    if (item.mrr) dayEntry.mrr += item.mrr
    dayEntry.views += item.views
    dailyAdditionsMap.set(dayKey, dayEntry)
  }

  // Build a continuous daily timeline
  const now = new Date()
  const earliestDate = rows.length > 0 ? new Date(rows[0].date) : new Date(now.getTime() - 30 * 86400000)
  const startDate = new Date(Math.min(earliestDate.getTime(), now.getTime() - 14 * 86400000))
  startDate.setHours(0, 0, 0, 0)

  const daily: StatDayPoint[] = []
  let cumulativeStartups = 0
  let cumulativeMrr = 0
  let cumulativeViews = 0

  const cur = new Date(startDate)
  while (cur <= now) {
    const dayStr = formatDate(cur)
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
    const d = new Date(day.date)
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
  const thirtyDaysAgoStr = formatDate(new Date(now.getTime() - 30 * 86400000))
  const point30dAgo = daily.find(d => d.date === thirtyDaysAgoStr) || daily[0]
  const prevStartups = point30dAgo ? point30dAgo.cumulativeStartups : 0
  const prevMrr = point30dAgo ? point30dAgo.mrr : 0

  const startupsGrowth30d = prevStartups > 0 ? Math.round(((rows.length - prevStartups) / prevStartups) * 100) : 100
  const mrrGrowth30d = prevMrr > 0 ? Math.round(((totalMrr - prevMrr) / prevMrr) * 100) : (totalMrr > 0 ? 100 : 0)

  const byCategory = Array.from(categoryMap.values()).sort((a, b) => b.totalMrr - a.totalMrr || b.count - a.count)
  const byCountry = Array.from(countryMap.values()).sort((a, b) => b.totalMrr - a.totalMrr || b.count - a.count)

  const todayStr = formatDate(now)
  const todayBucket = dailyAdditionsMap.get(todayStr) || { startups: 0, mrr: 0, views: 0 }

  return {
    summary: {
      totalStartups: rows.length,
      totalMrr,
      totalRevenue: totalMrr * 12,
      totalViews,
      avgMrr: verifiedCount > 0 ? Math.round(totalMrr / verifiedCount) : 0,
      verifiedCount,
      countriesCount: countryMap.size,
      categoriesCount: categoryMap.size,
      today: {
        date: todayStr,
        startupsAdded: todayBucket.startups,
        mrrAdded: todayBucket.mrr,
        revenueAdded: todayBucket.mrr * 12,
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
