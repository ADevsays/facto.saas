import { supabase } from '~/server/lib/supabase'

function parseMrr(query: string): number | null {
  const clean = query.trim().replace(/^[$\s]+/, '').toLowerCase()
  if (!clean) return null

  const match = clean.match(/^([\d.]+)\s*(k|m|b)?$/)
  if (!match) {
    const num = Number(clean)
    return isNaN(num) ? null : num
  }

  const value = parseFloat(match[1])
  const suffix = match[2]

  if (!suffix) return value
  if (suffix === 'k') return value * 1000
  if (suffix === 'm') return value * 1000000
  if (suffix === 'b') return value * 1000000000

  return null
}

interface FormatInput {
  id: string
  name: string | null
  logoUrl: string | null
  slug: string | null
  description: string | null
  isIncognito: boolean
  mrr: number | null
  currency: string
  category: string
}

function formatItem(item: FormatInput) {
  const isIncognito = !!item.isIncognito
  return {
    id: item.id,
    name: isIncognito ? '— Anónimo —' : (item.name || 'SaaS'),
    logoUrl: isIncognito ? null : item.logoUrl,
    slug: isIncognito ? null : item.slug,
    description: item.description || (isIncognito ? 'SaaS Incógnito' : `Detalle de ${item.name || 'SaaS'}.`),
    isIncognito,
    mrr: item.mrr ? Number(item.mrr) : null,
    currency: item.currency || 'USD',
    category: item.category || 'Software',
  }
}

export default defineEventHandler(async (event) => {
  const queryParams = getQuery(event)
  const q = (queryParams.q as string | undefined)?.trim() ?? ''

  if (!q) {
    return []
  }

  const mrrValue = parseMrr(q)
  const isMrrSearch = mrrValue !== null && /^\d+(?:\.\d+)?\s*[kmb]?$/i.test(q.replace(/^[$\s]+/, ''))

  let dbResults: any[] = []

  if (isMrrSearch) {
    const { data, error } = await supabase
      .from('saas_entries')
      .select(`
        id, name, slug, logo_url, startup_type, is_incognito, mrr, currency,
        categories ( name, slug )
      `)
      .gte('mrr', mrrValue)
      .limit(20)

    if (error) throw createError({ statusCode: 500, message: error.message })
    dbResults = data ?? []
  } else {
    const { data: matchedCategories, error: catError } = await supabase
      .from('categories')
      .select('id')
      .or(`name.ilike.%${q}%,slug.ilike.%${q}%`)

    if (catError) throw createError({ statusCode: 500, message: catError.message })

    const orConditions = [
      `name.ilike.%${q}%`,
      `startup_type.ilike.%${q}%`
    ]

    if (matchedCategories && matchedCategories.length > 0) {
      const catIds = matchedCategories.map((c: any) => c.id)
      const { data: saasCats } = await supabase
        .from('saas_categories')
        .select('saas_id')
        .in('category_id', catIds)

      const saasIds = saasCats?.map(sc => sc.saas_id) || []
      if (saasIds.length > 0) {
        orConditions.push(`id.in.(${saasIds.join(',')})`)
      }
    }

    const { data, error } = await supabase
      .from('saas_entries')
      .select(`
        id, name, slug, logo_url, startup_type, is_incognito, mrr, currency,
        categories ( name, slug )
      `)
      .or(orConditions.join(','))
      .limit(20)

    if (error) throw createError({ statusCode: 500, message: error.message })
    dbResults = data ?? []
  }

  const formattedDbItems = dbResults.map((entry: any) => formatItem({
    id: entry.id,
    name: entry.name,
    logoUrl: entry.logo_url,
    slug: entry.slug,
    description: entry.startup_type,
    isIncognito: entry.is_incognito,
    mrr: entry.mrr,
    currency: entry.currency,
    category: Array.isArray(entry.categories) ? entry.categories[0]?.name : entry.categories?.name,
  }))

  return formattedDbItems.slice(0, 20)
})
