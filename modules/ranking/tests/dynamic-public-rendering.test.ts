import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import test from 'node:test'
import { summarizeSaasHistory } from '../../../server/utils/saas-history'

const projectRoot = resolve(import.meta.dirname, '../../..')
const readProjectFile = (path: string) => readFileSync(resolve(projectRoot, path), 'utf8')

test('public routes do not declare ISR or a revalidation bypass token', () => {
  const config = readProjectFile('nuxt.config.ts')

  assert.doesNotMatch(config, /\bisr\s*:/)
  assert.doesNotMatch(config, /NUXT_ISR_BYPASS_TOKEN|x-prerender-revalidate|bypassToken/)
  assert.match(config, /vercel-cdn-cache-control': 'no-store'/)
  assert.match(config, /linkChecker:\s*\{[\s\S]*?runOnBuild: false/)
  assert.equal(existsSync(resolve(projectRoot, 'server/utils/isr-revalidation.ts')), false)
})

test('public list keeps history out of the primary projection and restores missing financials from cache', () => {
  const rankingService = readProjectFile('modules/ranking/server/services/ranking.ts')

  assert.match(rankingService, /fetchCachedFinancialSummaries/)
  assert.match(rankingService, /rowsMissingFinancials/)
  assert.match(rankingService, /\bmrr, revenue, currency\b/)
})

test('initial profile stays light and history has a dedicated endpoint', () => {
  const profileEndpoint = readProjectFile('server/api/saas/[slug].get.ts')
  const profilePage = readProjectFile('pages/saas/[slug]/index.vue')
  const historyEndpoint = resolve(projectRoot, 'server/api/saas/[slug]/history.get.ts')

  assert.match(profileEndpoint, /history: null/)
  assert.doesNotMatch(profileEndpoint, /provider_key_encrypted/)
  assert.match(profilePage, /useLazyFetch/)
  assert.doesNotMatch(profilePage, /\?seo=1/)
  assert.equal(existsSync(historyEndpoint), true)
})

test('history summary calculates active MRR and charged revenue', () => {
  const summary = summarizeSaasHistory({
    subscriptions: [
      { created: 10, canceledAt: null, mrr: 100, status: 'active' },
      { created: 10, canceledAt: 90, mrr: 50, status: 'canceled' },
      { created: 110, canceledAt: null, mrr: 999, status: 'active' },
    ],
    charges: [
      { created: 50, amount: 400 },
      { created: 70, amount: 600 },
    ],
  }, 25, 100)

  assert.deepEqual(summary, {
    mrr: 100,
    revenue: 1000,
    formattedRevenue: '$1K',
  })
})

test('history summary preserves lightweight fallback without history', () => {
  assert.deepEqual(summarizeSaasHistory(null, 125, 100), {
    mrr: 125,
    revenue: 1500,
    formattedRevenue: '$2K',
  })
  assert.deepEqual(summarizeSaasHistory(null, null, 100), {
    mrr: null,
    revenue: null,
    formattedRevenue: '—',
  })
})

test('new submissions publish with a valid provider key and review without one', () => {
  const service = readProjectFile('modules/add-saas/server/services/saas.service.ts')

  assert.match(service, /let status = pData\.hasProvider \? 'published' : 'pending_review'/)
  assert.match(service, /body\.id && existingEntry\?\.status === 'published'/)
})

test('admin review endpoint requires the admin key sent by the panel', () => {
  const reviewEndpoint = readProjectFile('server/api/admin/review.post.ts')

  assert.match(reviewEndpoint, /getHeader\(event, 'x-admin-key'\)/)
  assert.match(reviewEndpoint, /adminKey !== process\.env\.ADMIN_SECRET_KEY/)
})
