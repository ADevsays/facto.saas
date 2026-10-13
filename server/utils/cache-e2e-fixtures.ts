import { supabase } from '~/server/lib/supabase'
import type { Ad } from '~/modules/ads/types'
import type { ListQueryParams, SaasListItem } from '~/modules/ranking/types'

export const CACHE_E2E_AD_FIXTURE = 'preview-ad-primary'

export interface CacheE2eSaasInput {
  slug: string
  name: string
  description: string
  websiteUrl: string
  founderName: string
  category: string
  categorySlug: string
  mrr: number
  currency?: string
}

export interface CacheE2eAdInput {
  name: string
  description: string
  url: string
  imageUrl?: string
  position: number
  price: number
  isActive: boolean
}

function text(value: unknown, max: number): string | null {
  return typeof value === 'string' && value.trim() && value.trim().length <= max
    ? value.trim()
    : null
}

export function parseCacheE2eAd(value: unknown): CacheE2eAdInput | null {
  if (!value || typeof value !== 'object') return null
  const payload = value as Record<string, unknown>
  const name = text(payload.name, 80)
  const description = text(payload.description, 160)
  const url = text(payload.url, 500)
  const position = Number(payload.position)
  const price = Number(payload.price)
  if (!name || !description || !url || !Number.isInteger(position) || position < 1 || position > 20 || !Number.isFinite(price) || price < 1) {
    return null
  }
  return {
    name,
    description,
    url,
    imageUrl: typeof payload.imageUrl === 'string' ? payload.imageUrl.slice(0, 500) : '',
    position,
    price,
    isActive: payload.isActive !== false,
  }
}

export function parseCacheE2eSaas(value: unknown): CacheE2eSaasInput | null {
  if (!value || typeof value !== 'object') return null
  const payload = value as Record<string, unknown>
  const slug = text(payload.slug, 80)
  const name = text(payload.name, 80)
  const description = text(payload.description, 300)
  const websiteUrl = text(payload.websiteUrl, 500)
  const founderName = text(payload.founderName, 80)
  const category = text(payload.category, 50)
  const categorySlug = text(payload.categorySlug, 50)
  const mrr = Number(payload.mrr)
  if (!slug || !/^[a-z0-9-]+$/.test(slug) || !name || !description || !websiteUrl || !founderName || !category || !categorySlug || !/^[a-z0-9-]+$/.test(categorySlug) || !Number.isFinite(mrr) || mrr < 0) {
    return null
  }
  return { slug, name, description, websiteUrl, founderName, category, categorySlug, mrr, currency: text(payload.currency, 8) || 'USD' }
}

function formatRevenue(mrr: number): string {
  const annual = mrr * 12
  if (annual >= 1_000_000) return `$${(annual / 1_000_000).toFixed(1).replace('.0', '')}M`
  if (annual >= 1_000) return `$${Math.round(annual / 1_000)}K`
  return `$${Math.round(annual)}`
}

function mapCacheE2eSaas(row: any): SaasListItem | null {
  const fixture = parseCacheE2eSaas(row.payload)
  if (!fixture) return null
  return {
    id: row.id,
    name: fixture.name,
    slug: fixture.slug,
    logoUrl: null,
    websiteUrl: fixture.websiteUrl,
    founderName: fixture.founderName,
    description: fixture.description,
    isIncognito: false,
    mrr: fixture.mrr,
    revenue: formatRevenue(fixture.mrr),
    currency: fixture.currency || 'USD',
    category: fixture.category,
    categorySlug: fixture.categorySlug,
    categories: [{ name: fixture.category, slug: fixture.categorySlug }],
    country: { name: 'Global', slug: 'global', flag: 'global', iso_code: 'un' },
    provider: 'stripe',
    views: 0,
    publishedAt: row.created_at,
  }
}

/** Isolated Preview catalog. This function never queries saas_entries. */
export async function getCacheE2eSaasList(params: ListQueryParams = {}): Promise<SaasListItem[]> {
  const { data, error } = await supabase
    .from('cache_e2e_test')
    .select('id, payload, created_at')
    .eq('kind', 'saas')
    .order('created_at', { ascending: false })
  if (error) throw error

  let items = (data || [])
    .map(mapCacheE2eSaas)
    .filter((item): item is SaasListItem => item !== null)
  if (params.category) items = items.filter(item => item.categories.some(category => category.slug === params.category))
  if (params.country && params.country !== 'global') items = []
  if (params.q?.trim()) {
    const q = params.q.trim().toLowerCase()
    items = items.filter(item => item.name?.toLowerCase().includes(q) || item.founderName?.toLowerCase().includes(q))
  }
  if (params.sort === 'mrr') items.sort((a, b) => (b.mrr || 0) - (a.mrr || 0))
  if (params.sort === 'views') items.sort((a, b) => b.views - a.views)
  const offset = params.offset || 0
  return typeof params.limit === 'number' ? items.slice(offset, offset + params.limit) : items.slice(offset)
}

export async function getCacheE2eSaasBySlug(slug: string) {
  const { data, error } = await supabase
    .from('cache_e2e_test')
    .select('id, payload, created_at')
    .eq('kind', 'saas')
    .eq('fixture_key', `preview-saas-${slug}`)
    .maybeSingle()
  if (error) throw error
  const item = data ? mapCacheE2eSaas(data) : null
  if (!item) return null
  return {
    ...item,
    founderId: null,
    hasFounderEmail: false,
    allTimeRevenue: item.revenue,
    country: 'Global',
    countrySlug: 'global',
    countryFlag: 'global',
    history: null,
    founderSocials: null,
    founderAvatar: null,
    founderBio: null,
    lastSyncedAt: null,
    valueProposition: null,
    problemSolved: null,
    techStack: [],
    acquisitionChannels: [],
    factoMessage: null,
    faq: [],
    githubRepo: null,
  }
}

export async function getCacheE2eAds(): Promise<Ad[]> {
  const { data, error } = await supabase
    .from('cache_e2e_test')
    .select('id, payload, created_at')
    .eq('kind', 'ad')
    .order('updated_at', { ascending: true })

  if (error) throw error

  return (data || []).flatMap((row: any) => {
    const fixture = parseCacheE2eAd(row.payload)
    if (!fixture || !fixture.isActive) return []
    return [{
      id: row.id,
      name: fixture.name,
      description: fixture.description,
      url: fixture.url,
      image_url: fixture.imageUrl || '',
      is_active: true,
      created_at: row.created_at,
      position: fixture.position,
      price: fixture.price,
      is_affiliate: false,
    } satisfies Ad]
  })
}
