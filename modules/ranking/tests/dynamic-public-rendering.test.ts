import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import test from 'node:test'
import { formatRevenue, normalizeSaasHistory, summarizeSaasHistory } from '../../../server/utils/saas-history'

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

test('invalid provider credentials fall back to cached history without discarding it', () => {
  const historyEndpoint = readProjectFile('server/api/saas/[slug]/history.get.ts')
  const metricsSection = readProjectFile('modules/visuals/sections/SaasMetricsSection.vue')
  const profileView = readProjectFile('modules/visuals/views/SaasProfileView.vue')

  assert.match(historyEndpoint, /const cachedHistory = hasFinancialHistory\(history\) \? history : null/)
  assert.match(historyEndpoint, /history: cachedHistory,[\s\S]*?summarizeSaasHistory\(cachedHistory, fallbackMrr\)/)
  assert.doesNotMatch(historyEndpoint, /update\(\{ mrr: null, revenue: null \}\)/)
  assert.match(metricsSection, /!props\.saas\.hasCachedHistory\) return false/)
  assert.match(profileView, /historyRevenue\.value = data\.revenue/)
})

test('an expired key with prior data changes the verification legend and sends one deduplicated email', () => {
  const historyEndpoint = readProjectFile('server/api/saas/[slug]/history.get.ts')
  const legend = readProjectFile('modules/visuals/components/VerificationLegend.vue')
  const emailService = readProjectFile('modules/add-saas/server/services/providerKeyExpiredEmail.ts')

  assert.match(historyEndpoint, /status === 401 && hasPriorFinancialData && entry\.founder_email/)
  assert.match(historyEndpoint, /notifyProviderKeyExpiredOnce/)
  assert.match(legend, /keyStatus === 'invalid'/)
  assert.match(legend, /key_outdated/)
  assert.match(emailService, /provider-key-expired-email:/)
  assert.match(emailService, /reservationError\?\.code === '23505'/)
})

test('Stripe history keeps restricted-key fallback when invoices are unauthorized', () => {
  const stripeService = readProjectFile('modules/add-saas/server/services/stripe.service.ts')
  assert.match(stripeService, /invoices\?status=paid&limit=100[\s\S]*?\.catch\(/)
  assert.match(stripeService, /using charge fallback/)
})

test('ranking financial fallback reads cached history without requesting provider APIs', () => {
  const financials = readProjectFile('server/utils/saas-financials.ts')
  assert.doesNotMatch(financials, /getProvider|decryptProviderKey|provider_key_encrypted/)
})

test('revenue chart does not fabricate matching MRR and revenue curves without provider history', () => {
  const chart = readProjectFile('modules/visuals/composables/useRevenueChart.ts')
  assert.match(chart, /if \(!history\.value\) return \[\]/)
  assert.doesNotMatch(chart, /generateSeries|bucketRevenue/)
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

test('history summary never annualizes MRR as all-time revenue', () => {
  assert.deepEqual(summarizeSaasHistory(null, 125, 100), {
    mrr: 125,
    revenue: null,
    formattedRevenue: '—',
  })
  assert.deepEqual(summarizeSaasHistory(null, null, 100), {
    mrr: null,
    revenue: null,
    formattedRevenue: '—',
  })
})

test('compact revenue keeps one decimal for thousands', () => {
  assert.equal(formatRevenue(6500), '$6.5K')
  assert.equal(formatRevenue(6000), '$6K')
})

test('legacy financial snapshots can restore summary values without fabricating history', () => {
  const history = readProjectFile('server/utils/saas-history.ts')
  const financials = readProjectFile('server/utils/saas-financials.ts')
  assert.match(history, /getLegacyFinancialSnapshot/)
  assert.match(financials, /getLegacyFinancialSnapshot\(row\.history_cache\)/)
})

test('invalid or partial cached history is rejected before chart hydration', () => {
  assert.equal(normalizeSaasHistory({ subscriptions: [{ created: 'bad', mrr: 500 }] }), null)
  assert.deepEqual(normalizeSaasHistory({
    subscriptions: [{ created: '10', canceledAt: null, mrr: '125' }],
    charges: [{ created: '20', amount: '900' }],
  }), {
    subscriptions: [{ created: 10, canceledAt: null, mrr: 125, status: undefined }],
    charges: [{ created: 20, amount: 900 }],
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
