import test from 'node:test'
import assert from 'node:assert/strict'
import {
  adsRevalidationPaths,
  cacheE2eRevalidationPaths,
  requestISRRevalidation,
  saasRevalidationPaths,
} from './isr-revalidation'

test('a SaaS mutation revalidates only its public projections and shared listings', () => {
  const paths = saasRevalidationPaths({
    slug: 'acme',
    categorySlugs: ['ai', 'payments'],
    countrySlug: 'colombia',
  })

  assert.ok(paths.includes('/saas/acme'))
  assert.ok(paths.includes('/en/saas/acme'))
  assert.ok(paths.includes('/saas/categoria/ai'))
  assert.ok(paths.includes('/saas/pais/colombia'))
  assert.ok(paths.includes('/ranking'))
  assert.ok(paths.includes('/stats'))
  assert.equal(paths.includes('/saas/other-startup'), false)
})

test('invalid dynamic segments cannot create arbitrary revalidation URLs', () => {
  const paths = saasRevalidationPaths({
    slug: '../admin',
    categorySlugs: ['valid', 'bad/path'],
    countrySlug: ' Colombia ',
  })

  assert.equal(paths.includes('/saas/../admin'), false)
  assert.ok(paths.includes('/saas/categoria/valid'))
  assert.equal(paths.some(path => path.includes('bad/path')), false)
  assert.ok(paths.includes('/saas/pais/colombia'))
})

test('an ads mutation revalidates the shared entry pages, not arbitrary profiles', () => {
  const paths = adsRevalidationPaths()
  assert.ok(paths.includes('/'))
  assert.ok(paths.includes('/ranking'))
  assert.equal(paths.some(path => path.startsWith('/saas/any-profile')), false)
})

test('the Preview probe can revalidate only its dedicated test route', () => {
  assert.deepEqual(cacheE2eRevalidationPaths(), ['/__cache-e2e'])
})

test('revalidation sends the server-only bypass token and records failures', async () => {
  const calls: Array<{ input: string, init: RequestInit }> = []
  const result = await requestISRRevalidation('https://preview.example', 'secret', ['/ok', '/fails'], async (input, init) => {
    calls.push({ input, init })
    return new Response('', { status: input.endsWith('/fails') ? 500 : 200 })
  })

  assert.deepEqual(result.failedPaths, ['/fails'])
  assert.equal(calls.length, 2)
  assert.equal(new Headers(calls[0].init.headers).get('x-prerender-revalidate'), 'secret')
})

test('without a token the helper never sends a cache-purge request', async () => {
  let called = false
  const result = await requestISRRevalidation('https://preview.example', undefined, ['/'], async () => {
    called = true
    return new Response('')
  })

  assert.equal(result.skipped, true)
  assert.equal(called, false)
})
