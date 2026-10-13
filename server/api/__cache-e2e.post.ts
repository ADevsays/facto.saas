import { timingSafeEqual } from 'node:crypto'
import { supabase } from '~/server/lib/supabase'
import { revalidatePublicPaths } from '~/server/utils/isr-revalidation'

interface CacheE2ePayload {
  value?: unknown
}

function matchesTestKey(provided: string | undefined, expected: string | undefined): boolean {
  if (!provided || !expected) return false
  const providedBytes = Buffer.from(provided)
  const expectedBytes = Buffer.from(expected)
  return providedBytes.length === expectedBytes.length && timingSafeEqual(providedBytes, expectedBytes)
}

/**
 * Deliberately isolated Preview mutation. It may only create rows in
 * `cache_e2e_test`; no application table is read or written from this route.
 */
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  if (!config.cacheE2eEnabled) {
    throw createError({ statusCode: 404, statusMessage: 'Not found' })
  }

  if (!matchesTestKey(getHeader(event, 'x-cache-e2e-key'), config.cacheE2eKey)) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const body = await readBody<CacheE2ePayload>(event)
  const value = typeof body?.value === 'string' ? body.value.trim() : ''
  if (!value || value.length > 128) {
    throw createError({ statusCode: 400, statusMessage: 'value must contain 1 to 128 characters' })
  }

  const { data, error } = await supabase
    .from('cache_e2e_test')
    .insert({ value })
    .select('id, value, revision, created_at')
    .single()

  if (error) {
    console.error('[cache-e2e] isolated insert failed', error)
    throw createError({ statusCode: 500, statusMessage: 'Could not write the isolated cache test row' })
  }

  await revalidatePublicPaths(event, 'cache-e2e')
  setHeader(event, 'Cache-Control', 'no-store')
  return data
})
