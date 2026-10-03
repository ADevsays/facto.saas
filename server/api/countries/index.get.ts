import { supabase } from '~/server/lib/supabase'

export default defineEventHandler(async () => {
  const [countriesRes, saasCountriesRes] = await Promise.all([
    supabase
      .from('countries')
      .select('id, name, slug, flag, iso_code'),
    supabase
      .from('saas_countries')
      .select('country_id, saas_entries!inner(status)')
      .eq('saas_entries.status', 'published')
  ])

  if (countriesRes.error) {
    throw createError({ statusCode: 500, message: countriesRes.error.message })
  }

  const countMap: Record<number, number> = {}
  if (saasCountriesRes.data) {
    for (const sc of saasCountriesRes.data) {
      if (sc.country_id) {
        countMap[sc.country_id] = (countMap[sc.country_id] || 0) + 1
      }
    }
  }

  const list = (countriesRes.data || []).map((c: any) => ({
    ...c,
    startupsCount: countMap[c.id] || 0
  }))

  list.sort((a, b) => {
    if (a.slug === 'global') return -1
    if (b.slug === 'global') return 1

    const aHas = (a.startupsCount || 0) > 0
    const bHas = (b.startupsCount || 0) > 0

    if (aHas && !bHas) return -1
    if (!aHas && bHas) return 1

    if (aHas && bHas && b.startupsCount !== a.startupsCount) {
      return b.startupsCount - a.startupsCount
    }

    return a.name.localeCompare(b.name)
  })

  return list
})
