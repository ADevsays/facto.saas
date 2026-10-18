import { supabase } from '~/server/lib/supabase'
import type { CountryLeaderboardItem } from '~/modules/ranking/types'

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

export default defineEventHandler(async (event) => {
  setResponseHeaders(event, {
    'Cache-Control': 'public, max-age=0, s-maxage=300, stale-while-revalidate=900',
    'CDN-Cache-Control': 'max-age=300, stale-while-revalidate=900',
    'Vercel-CDN-Cache-Control': 's-maxage=300, stale-while-revalidate=900'
  })

  const { data, error } = await supabase
    .from('saas_entries')
    .select('revenue, countries!saas_countries (name, slug, flag, iso_code)')
    .eq('status', 'published')
    .not('is_incognito', 'is', true)

  if (error) throw createError({ statusCode: 500, message: error.message })

  const countries = new Map<string, CountryLeaderboardItem>()

  for (const row of data || []) {
    const country = (row.countries || [])[0]
    if (!country || country.slug === 'global') continue

    const current = countries.get(country.slug) || {
      name: country.name,
      slug: country.slug,
      flag: country.flag,
      isoCode: (country.iso_code || COUNTRY_ISO_MAP[country.slug] || '').toLowerCase(),
      totalRevenue: 0,
      startupsCount: 0
    }
    const revenue = Number(row.revenue)
    if (Number.isFinite(revenue) && revenue >= 0) current.totalRevenue += revenue
    current.startupsCount += 1
    countries.set(current.slug, current)
  }

  return Array.from(countries.values()).sort((a, b) => (
    b.totalRevenue - a.totalRevenue || b.startupsCount - a.startupsCount
  ))
})
