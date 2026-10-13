import { timingSafeEqual } from 'node:crypto'
import { supabase } from '~/server/lib/supabase'
import { parseCacheE2eSaas } from '~/server/utils/cache-e2e-fixtures'
import { revalidatePublicPaths } from '~/server/utils/isr-revalidation'

interface SaasFixturePayload { action?: unknown; saas?: unknown }

function validKey(provided: string | undefined, expected: string | undefined): boolean {
  if (!provided || !expected) return false
  const left = Buffer.from(provided)
  const right = Buffer.from(expected)
  return left.length === right.length && timingSafeEqual(left, right)
}

/** Preview-only startup fixture. It only writes public.cache_e2e_test. */
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  if (!config.cacheE2eEnabled) throw createError({ statusCode: 404, statusMessage: 'Not found' })
  if (!validKey(getHeader(event, 'x-cache-e2e-key'), config.cacheE2eKey)) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }
  const body = await readBody<SaasFixturePayload>(event)
  if (body.action !== 'create' && body.action !== 'update') {
    throw createError({ statusCode: 400, statusMessage: 'action must be create or update' })
  }
  const saas = parseCacheE2eSaas(body.saas)
  if (!saas) throw createError({ statusCode: 400, statusMessage: 'Invalid startup fixture' })

  const payload = {
    kind: 'saas', fixture_key: `preview-saas-${saas.slug}`, value: saas.name,
    payload: saas, updated_at: new Date().toISOString(),
  }
  const query = body.action === 'create'
    ? supabase.from('cache_e2e_test').insert(payload)
    : supabase.from('cache_e2e_test').update(payload).eq('fixture_key', payload.fixture_key).eq('kind', 'saas')
  const { data, error } = await query.select('id, fixture_key, payload, updated_at').maybeSingle()
  if (error) {
    const statusCode = body.action === 'create' && error.code === '23505' ? 409 : 500
    throw createError({ statusCode, statusMessage: statusCode === 409 ? 'Fixture already exists' : 'Could not write the isolated startup fixture' })
  }
  if (!data) throw createError({ statusCode: 404, statusMessage: 'Create the fixture before updating it' })

  await revalidatePublicPaths(event, 'cache-e2e-saas', { slug: saas.slug })
  setHeader(event, 'Cache-Control', 'no-store')
  return data
})
