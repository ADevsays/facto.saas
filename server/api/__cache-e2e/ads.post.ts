import { timingSafeEqual } from 'node:crypto'
import { supabase } from '~/server/lib/supabase'
import { CACHE_E2E_AD_FIXTURE, parseCacheE2eAd } from '~/server/utils/cache-e2e-fixtures'
import { revalidatePublicPaths } from '~/server/utils/isr-revalidation'

interface AdFixturePayload {
  action?: unknown
  ad?: unknown
}

function validKey(provided: string | undefined, expected: string | undefined): boolean {
  if (!provided || !expected) return false
  const left = Buffer.from(provided)
  const right = Buffer.from(expected)
  return left.length === right.length && timingSafeEqual(left, right)
}

/** Preview-only ad fixture. It never reads or writes the production ads table. */
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  if (!config.cacheE2eEnabled) throw createError({ statusCode: 404, statusMessage: 'Not found' })
  if (!validKey(getHeader(event, 'x-cache-e2e-key'), config.cacheE2eKey)) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const body = await readBody<AdFixturePayload>(event)
  if (body.action !== 'seed' && body.action !== 'update') {
    throw createError({ statusCode: 400, statusMessage: 'action must be seed or update' })
  }
  const ad = parseCacheE2eAd(body.ad)
  if (!ad) throw createError({ statusCode: 400, statusMessage: 'Invalid ad fixture' })

  const now = new Date().toISOString()
  const payload = { kind: 'ad', fixture_key: CACHE_E2E_AD_FIXTURE, value: ad.name, payload: ad, updated_at: now }
  const query = body.action === 'seed'
    ? supabase.from('cache_e2e_test').upsert(payload, { onConflict: 'fixture_key' })
    : supabase.from('cache_e2e_test').update(payload).eq('fixture_key', CACHE_E2E_AD_FIXTURE).eq('kind', 'ad')
  const { data, error } = await query.select('id, fixture_key, payload, updated_at').maybeSingle()
  if (error) throw createError({ statusCode: 500, statusMessage: 'Could not write the isolated ad fixture' })
  if (!data) throw createError({ statusCode: 404, statusMessage: 'Seed the fixture before updating it' })

  const revalidation = await revalidatePublicPaths(event, 'cache-e2e')
  setHeader(event, 'Cache-Control', 'no-store')
  return { ...data, revalidation }
})
