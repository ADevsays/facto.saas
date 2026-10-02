import { supabase } from '~/server/lib/supabase'

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

function formatRevenue(val: number | null): string {
  if (val === null || val === undefined) return '—'
  if (val >= 1000000) return `$${(val / 1000000).toFixed(1)}M`.replace('.0', '')
  if (val >= 1000) return `$${(val / 1000).toFixed(0)}K`
  return `$${Math.round(val)}`
}

export default defineEventHandler(async () => {
  const { data: saasRows, error: saasErr } = await supabase
    .from('saas_entries')
    .select(
      'id, name, slug, logo_url, website_url, startup_type, founder_name, mrr, currency, views, published_at, is_incognito,' +
      'saas_metrics_cache ( history_cache ),' +
      'countries!saas_countries (id, name, slug, flag, iso_code ),' +
      'categories!saas_categories (name, slug)'
    )
    .eq('status', 'published')

  if (saasErr) {
    throw createError({ statusCode: 500, message: saasErr.message })
  }

  const { data: countriesRows, error: countriesErr } = await supabase
    .from('countries')
    .select('id, name, slug, flag, iso_code')

  if (countriesErr) {
    throw createError({ statusCode: 500, message: countriesErr.message })
  }

  const countryMap = new Map<string, {
    id: number
    name: string
    slug: string
    flag: string
    isoCode: string
    flagUrl: string | null
    totalRevenue: number
    totalRevenueFormatted: string
    totalMrr: number
    startupsCount: number
    startups: Array<{
      id: string
      name: string
      slug: string
      logoUrl: string | null
      websiteUrl: string | null
      mrr: number | null
      revenue: string
      numericRevenue: number | null
      isIncognito: boolean
      currency: string
      founderName: string | null
      category: string
    }>
  }>()

  for (const c of (countriesRows || [])) {
    if (c.slug === 'global') continue
    const iso = (c.iso_code || COUNTRY_ISO_MAP[c.slug] || '').toLowerCase()
    countryMap.set(c.slug, {
      id: c.id,
      name: c.name,
      slug: c.slug,
      flag: c.flag,
      isoCode: iso,
      flagUrl: iso ? `https://flagcdn.com/w160/${iso}.png` : null,
      totalRevenue: 0,
      totalRevenueFormatted: '—',
      totalMrr: 0,
      startupsCount: 0,
      startups: []
    })
  }

  for (const row of ((saasRows as any[]) || [])) {
    const countries = (row.saas_countries as any[]) || (row.countries as any[]) || []
    const country = countries[0]
    if (!country || country.slug === 'global') continue

    let entry = countryMap.get(country.slug)
    if (!entry) {
      const iso = (country.iso_code || COUNTRY_ISO_MAP[country.slug] || '').toLowerCase()
      entry = {
        id: country.id,
        name: country.name,
        slug: country.slug,
        flag: country.flag,
        isoCode: iso,
        flagUrl: iso ? `https://flagcdn.com/w160/${iso}.png` : null,
        totalRevenue: 0,
        totalRevenueFormatted: '—',
        totalMrr: 0,
        startupsCount: 0,
        startups: []
      }
      countryMap.set(country.slug, entry)
    }

    const isIncognito = Boolean(row.is_incognito)
    const cacheData = row.saas_metrics_cache
    const cacheObj = Array.isArray(cacheData) ? cacheData[0] : cacheData
    const history = cacheObj?.history_cache

    let mrrVal = row.mrr !== null && row.mrr !== undefined ? Number(row.mrr) : null
    let realAllTimeRevenue = 0

    if (history) {
      if (history.charges?.length) {
        realAllTimeRevenue = history.charges.reduce((sum: number, c: any) => sum + (Number(c.amount) || 0), 0)
      }
      if (history.subscriptions?.length) {
        const nowSec = Math.floor(Date.now() / 1000)
        let currentMrr = 0
        for (const sub of history.subscriptions) {
          if (sub.created <= nowSec && (sub.canceledAt === null || sub.canceledAt > nowSec)) {
            currentMrr += Number(sub.mrr) || 0
          }
        }
        if (currentMrr > 0) {
          mrrVal = Math.round(currentMrr)
        }
      }
    }

    let revenueVal: number | null = null
    if (realAllTimeRevenue > 0) {
      revenueVal = realAllTimeRevenue
    } else if (mrrVal !== null && mrrVal > 0) {
      revenueVal = mrrVal * 12
    } else if (mrrVal === 0) {
      revenueVal = 0
    }

    const startupRevenueStr = isIncognito ? '—' : formatRevenue(revenueVal)

    if (revenueVal !== null && !isIncognito) {
      entry.totalRevenue += revenueVal
    }

    const mrr = Number(row.mrr) || 0
    if (!isIncognito) {
      entry.totalMrr += mrr
    }
    entry.startupsCount += 1

    entry.startups.push({
      id: row.id,
      name: row.name,
      slug: row.slug,
      logoUrl: row.logo_url,
      websiteUrl: row.website_url,
      mrr: isIncognito ? null : row.mrr,
      revenue: startupRevenueStr,
      numericRevenue: isIncognito ? null : revenueVal,
      isIncognito,
      currency: row.currency || 'USD',
      founderName: row.founder_name,
      category: (row.saas_categories as any[])?.[0]?.name || (row.categories as any[])?.[0]?.name || 'Software'
    })
  }

  for (const entry of countryMap.values()) {
    entry.totalRevenueFormatted = formatRevenue(entry.totalRevenue)
    entry.startups.sort((a, b) => (Number(b.numericRevenue) || 0) - (Number(a.numericRevenue) || 0))
  }

  const leaderboard = Array.from(countryMap.values())
    .filter(c => c.startupsCount > 0)
    .sort((a, b) => {
      if (b.totalRevenue !== a.totalRevenue) return b.totalRevenue - a.totalRevenue
      return b.startupsCount - a.startupsCount
    })

  return leaderboard
})
