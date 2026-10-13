import { supabase } from '~/server/lib/supabase'
import type { Ad } from '~/modules/ads/types'

export const CACHE_E2E_AD_FIXTURE = 'preview-ad-primary'

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
