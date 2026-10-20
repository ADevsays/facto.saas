import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import test from 'node:test'

const projectRoot = resolve(import.meta.dirname, '../../..')
const readProjectFile = (path: string) => readFileSync(resolve(projectRoot, path), 'utf8')

test('GEO routes emit honest HTTP errors and keep private screens out of indexing', () => {
  const saasProfile = readProjectFile('pages/saas/[slug]/index.vue')
  const founderProfile = readProjectFile('pages/founder/[slug].vue')
  const config = readProjectFile('nuxt.config.ts')

  assert.match(saasProfile, /setResponseStatus\(useRequestEvent\(\)!/)
  assert.match(saasProfile, /onResponseError: \(\{ response \}\)/)
  assert.match(saasProfile, /watchEffect\(\(\) => \{[\s\S]*?error\.value/)
  assert.match(founderProfile, /setResponseStatus\(useRequestEvent\(\)!/)
  assert.match(config, /'\/dashboard\/\*\*':[\s\S]*?sitemap: false/)
  assert.match(config, /'X-Robots-Tag': 'noindex, nofollow, noarchive'/)
})

test('sitemap uses existing directory routes and published profile records only', () => {
  const sitemap = readProjectFile('server/api/__sitemap__/urls.ts')

  assert.match(sitemap, /\.eq\('status', 'published'\)/)
  assert.match(sitemap, /\/saas\/categoria/)
  assert.match(sitemap, /\/saas\/pais/)
  assert.doesNotMatch(sitemap, /'\/categorias'/)
  assert.doesNotMatch(sitemap, /'\/paises'/)
  assert.match(sitemap, /reservedSlugs/)
  assert.match(sitemap, /lastmod: entry\.published_at/)
})

test('profile schema uses evidence without a fabricated free offer', () => {
  const schema = readProjectFile('composables/useAppSchema.ts')
  const methodology = readProjectFile('pages/metodologia.vue')

  assert.match(schema, /'@type': 'Dataset'/)
  assert.match(schema, /'@type': 'BreadcrumbList'/)
  assert.doesNotMatch(schema.split('defineSaasProfile')[1], /offers:/)
  assert.match(methodology, /48 horas/)
  assert.match(methodology, /MRR/)
})
