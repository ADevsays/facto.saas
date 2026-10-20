import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import test from 'node:test'
import { buildSaasHistoryChart, formatRevenue, normalizeSaasHistory, summarizeSaasHistory } from '../../../server/utils/saas-history'
import { determineInitialChartSettings } from '../../visuals/composables/useRevenueChart'

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

test('public list uses persisted financial columns without downloading history cache', () => {
  const rankingService = readProjectFile('modules/ranking/server/services/ranking.ts')
  const founderEndpoint = readProjectFile('server/api/founder/[slug].get.ts')
  const statsEndpoint = readProjectFile('server/api/stats/index.get.ts')
  const publicLogo = readProjectFile('server/utils/public-logo.ts')

  assert.doesNotMatch(rankingService, /fetchCachedFinancialSummaries|rowsMissingFinancials/)
  assert.doesNotMatch(founderEndpoint, /fetchCachedFinancialSummaries|history_cache/)
  assert.doesNotMatch(statsEndpoint, /fetchCachedFinancialSummaries|history_cache/)
  assert.match(rankingService, /\bmrr, revenue, currency\b/)
  assert.match(rankingService, /getPublicLogoUrl\(row\.logo_url\)/)
  assert.match(publicLogo, /32 \* 1024/)
})

test('home uses a bounded union while ranking and recommendations request only what they render', () => {
  const endpoint = readProjectFile('modules/ranking/server/api/ranking/list.get.ts')
  const home = readProjectFile('pages/index.vue')
  const list = readProjectFile('composables/useSaasList.ts')
  const catalog = readProjectFile('modules/visuals/views/SaasListView.vue')
  const recent = readProjectFile('modules/visuals/sections/RecentlySection.vue')
  const best = readProjectFile('modules/visuals/sections/BestSection.vue')
  const homeView = readProjectFile('modules/visuals/views/VisualsView.vue')
  const recommendations = readProjectFile('modules/visuals/sections/MoreStartupsSection.vue')

  assert.match(endpoint, /query\.scope === 'home'/)
  assert.match(endpoint, /sort: 'mrr', limit: rankingLimit/)
  assert.match(endpoint, /sort: 'latest', limit: 6/)
  assert.match(home, /useSaasList\(\{ scope: 'home' \}\)/)
  assert.doesNotMatch(home, /await useFetch/)
  assert.match(list, /useLazyFetch<SaasListItem\[]>/)
  assert.doesNotMatch(list, /useRoute\(\)/)
  assert.match(list, /catalog: \{[^}]*limit=200/)
  assert.match(catalog, /key: catalogFetchKey/)
  assert.match(catalog, /getCachedData:/)
  assert.match(recent, /scope: 'home'/)
  assert.match(best, /scope: 'home'/)
  assert.match(homeView, /scope="home"/)
  assert.match(recommendations, /server: false, scope: 'recommendations'/)
})

test('home and ranking request ten-row chunks and load later chunks on demand', () => {
  const list = readProjectFile('composables/useSaasList.ts')
  const endpoint = readProjectFile('modules/ranking/server/api/ranking/list.get.ts')
  const section = readProjectFile('modules/ranking/sections/RankingSection.vue')

  assert.match(list, /rankingLimit=10&rankingOffset=0/)
  assert.match(list, /scope=ranking&limit=10&offset=0/)
  assert.match(list, /rankingOnly=true/)
  assert.match(list, /rankingOffset=\$\{offset\}/)
  assert.match(endpoint, /query\.rankingOnly === 'true'/)
  assert.match(section, /rootMargin: '650px 0px'/)
  assert.match(section, /watch\(loadMoreSentinel/)
  assert.match(section, /hasScrolled = true/)
  assert.match(section, /continuationSkeletonCount/)
  assert.match(section, /\[overflow-anchor:none\]/)
  assert.match(list, /offset \+ nextItems\.length/)
  assert.match(list, /rankingExhausted = nextItems\.length < amount/)
})

test('telegram popup opens at the beginning of the ranking with an isolated animated border', () => {
  const popup = readProjectFile('components/TelegramPopup.vue')

  assert.match(popup, /data-ranking-section/)
  assert.match(popup, /getBoundingClientRect\(\)/)
  assert.match(popup, /window\.innerHeight \* 0\.7/)
  assert.doesNotMatch(popup, /fullHeight \* 0\.7/)
  assert.match(popup, /translate\(-50%, -50%\) rotate\(360deg\)/)
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
  assert.match(profileEndpoint, /founder:founders!saas_entries_founder_id_fkey/)
  assert.match(profileEndpoint, /saas_achievements \( achievement_type, unlocked_at \)/)
  assert.doesNotMatch(profileEndpoint, /\.from\('founders'\)/)
  assert.match(profileEndpoint, /const showcaseFallbackRes/)
  assert.match(profileEndpoint, /value_proposition, problem_solved, tech_stack, acquisition_channels, facto_message, faq, github_repo/)
  assert.match(profileEndpoint, /showcaseFallbackRes\.error\?\.code === '42703'/)
})

test('SaaS SEO uses one brand suffix, the agreed templates and a modification date', () => {
  const seo = readProjectFile('composables/useAppSeo.ts')
  const profile = readProjectFile('pages/saas/[slug]/index.vue')
  const meta = readProjectFile('composables/useSaasViewMeta.ts')
  const profileEndpoint = readProjectFile('server/api/saas/[slug].get.ts')
  const schema = readProjectFile('composables/useAppSchema.ts')

  assert.match(seo, /titleTemplate: title => title \|\| 'Facto'/)
  assert.match(profile, /\$\{name\} — Software de \$\{categoryForSeo\.value\} para \$\{countryForSeo\.value\} \$\{currentYear\} \| Facto/)
  assert.match(profile, /\$\{name\} — Software de \$\{categoryForSeo\.value\} \$\{currentYear\} \| Facto/)
  assert.match(profile, /country && country !== 'Global'/)
  assert.match(meta, /Mejores herramientas de \$\{displayName\} \[\$\{year\}\] \| Facto/)
  assert.match(meta, /Mejores Software y SaaS en \$\{countryName\} \[\$\{year\}\] \| Facto/)
  assert.match(profileEndpoint, /published_at, updated_at/)
  assert.match(profileEndpoint, /updatedAt: dbEntry\.updated_at \|\| dbEntry\.published_at/)
  assert.match(schema, /dateModified: saas\.updatedAt \|\| saas\.publishedAt/)
})

test('llms.txt follows the curated site-only link format', () => {
  const llms = readProjectFile('public/llms.txt')
  const links = [...llms.matchAll(/\]\((https:\/\/[^)]+)\)/g)].map(match => match[1])
  const featured = llms.split('## Featured SaaS and alternatives')[1]

  assert.match(llms, /^# Facto\r?\n\r?\n> /)
  assert.match(llms, /^## Main pages/m)
  assert.match(llms, /^## Categories/m)
  assert.match(llms, /^## Countries/m)
  assert.equal(links.every(link => link.startsWith('https://www.factosaas.com/')), true)
  assert.equal((featured.match(/^-/gm) || []).length >= 10, true)
  assert.equal((featured.match(/^-/gm) || []).length <= 20, true)
})

test('profile OG image uses only serializable Island props', () => {
  const profilePage = readProjectFile('pages/saas/[slug]/index.vue')

  assert.match(profilePage, /defineOgImageComponent\('SaasProfile'/)
  assert.doesNotMatch(profilePage, /mrr:\s*serverSaas\.mrr\s*\?\s*Number\(serverSaas\.mrr\)\s*:\s*null/)
  assert.doesNotMatch(profilePage, /mrr:\s*null/)
})

test('visits milestone OG mirrors the normal startup OG logo handling', () => {
  const milestoneOg = readProjectFile('components/OgImage/VisitsMilestone.vue')
  const profileOg = readProjectFile('components/OgImage/SaasProfile.vue')
  const profilePage = readProjectFile('pages/saas/[slug]/index.vue')

  assert.match(milestoneOg, /<img :src="logoUrl"/)
  assert.match(milestoneOg, /return !clean\.endsWith\('\.webp'\) && !clean\.endsWith\('\.ico'\)/)
  assert.match(profileOg, /return !clean\.endsWith\('\.webp'\) && !clean\.endsWith\('\.ico'\)/)
  assert.match(profilePage, /resolveOgLogoUrl\(serverSaas\.logoUrl, serverSaas\.websiteUrl\)/)
})

test('og-island-compat plugin reconciles legacy nuxt-og-image hash in event.$fetch with Nuxt island hash algorithm', async () => {
  const plugin = (await import('../../../server/plugins/og-island-compat')).default
  const { hash } = await import('ohash')

  let requestHook: ((event: any) => void) | undefined
  const fakeNitroApp = {
    hooks: {
      hook: (name: string, fn: any) => {
        if (name === 'request') requestHook = fn
      }
    }
  }

  plugin(fakeNitroApp as any)
  assert.equal(typeof requestHook, 'function')

  const component = 'OgImageSaasProfile'
  const props = { name: 'GastroFlow', revenue: '$12K' }
  const legacyHash = hash([component, props]).replaceAll('_', '-')
  const expectedHash = hash([component, props, {}, undefined]).replace(/[-_]/g, '')

  let calledUrl = ''
  const fakeEvent: any = {
    $fetch: (url: string) => {
      calledUrl = url
      return Promise.resolve({ ok: true })
    }
  }

  requestHook!(fakeEvent)

  const legacyUrl = `/__nuxt_island/${component}_${legacyHash}.json`
  await fakeEvent.$fetch(legacyUrl, { params: { props: JSON.stringify(props) } })

  assert.equal(calledUrl, `/__nuxt_island/${component}_${expectedHash}.json`)
})

test('invalid provider credentials fall back to cached history without discarding it', () => {
  const historyEndpoint = readProjectFile('server/api/saas/[slug]/history.get.ts')
  const metricsSection = readProjectFile('modules/visuals/sections/SaasMetricsSection.vue')
  const profileView = readProjectFile('modules/visuals/views/SaasProfileView.vue')

  assert.match(historyEndpoint, /const cachedHistory = hasFinancialHistory\(history\) \? history : null/)
  assert.match(historyEndpoint, /history: buildSaasHistoryChart\(cachedHistory, nowMs\),[\s\S]*?summarizeSaasHistory\(cachedHistory, fallbackMrr\)/)
  assert.doesNotMatch(historyEndpoint, /update\(\{ mrr: null, revenue: null \}\)/)
  assert.match(metricsSection, /!props\.saas\.hasCachedHistory\) return false/)
  assert.match(profileView, /historyRevenue\.value = data\.revenue/)
})

test('startups without a revenue value render the incognito marker', () => {
  const metricsSection = readProjectFile('modules/visuals/sections/SaasMetricsSection.vue')

  assert.match(metricsSection, /<IncognitoIcon v-else class="w-5 h-5 text-neutral-500"/)
  assert.doesNotMatch(metricsSection, /<span v-else class="text-neutral-500">—<\/span>/)
})

test('only a connected provider can expose zero revenue on the public profile', () => {
  const profileEndpoint = readProjectFile('server/api/saas/[slug].get.ts')
  const historyEndpoint = readProjectFile('server/api/saas/[slug]/history.get.ts')
  const profileView = readProjectFile('modules/visuals/views/SaasProfileView.vue')

  assert.match(profileEndpoint, /const hasConnectedProvider = Boolean\(providerSlug\)/)
  assert.match(profileEndpoint, /persistedRevenue >= 0 && hasConnectedProvider/)
  assert.match(profileEndpoint, /else allTimeRev = `\$\${Math\.round\(revenueValue\)}`/)
  assert.match(historyEndpoint, /update\(\{\s*mrr: 0,\s*revenue: 0,\s*\}\)/)
  assert.match(historyEndpoint, /const effectiveRevenue = summary\.revenue \?\?/)
  assert.match(profileView, /historyRevenue\.value === 0\) return props\.saas\.provider \? '\$0'/)
})

test('home ranking randomizes zero-revenue startups per session seed while keeping chunk order stable', () => {
  const rankingService = readProjectFile('modules/ranking/server/services/ranking.ts')
  const listEndpoint = readProjectFile('modules/ranking/server/api/ranking/list.get.ts')
  const saasList = readProjectFile('composables/useSaasList.ts')

  assert.match(rankingService, /seededOrderValue\(a\.id, seed!\)/)
  assert.match(listEndpoint, /query\.seed !== undefined/)
  assert.match(saasList, /seed: options\.scope === 'home'/)
  assert.match(saasList, /seededOrderValue\(a\.id, seed\)/)
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

test('revenue chart auto-configures initial metric and timeframe with the most data', () => {
  const emptySeries = Array.from({ length: 10 }, (_, i) => ({ at: i * 1000, mrr: 0, revenue: 0 }))
  const revOnly60d = {
    '7d': emptySeries,
    '30d': emptySeries,
    '60d': emptySeries.map((pt, i) => ({ ...pt, revenue: i === 2 ? 450 : 0 })),
    'all': emptySeries.map((pt, i) => ({ ...pt, revenue: i === 1 ? 450 : 0 })),
  }
  assert.deepEqual(determineInitialChartSettings(revOnly60d, 0), {
    metric: 'revenue',
    timeframe: '60d',
  })

  const revMoreInAll = {
    '7d': emptySeries,
    '30d': emptySeries,
    '60d': emptySeries.map((pt, i) => ({ ...pt, revenue: i === 2 ? 450 : 0 })),
    'all': emptySeries.map((pt, i) => ({ ...pt, revenue: i < 4 ? 200 : 0 })),
  }
  assert.deepEqual(determineInitialChartSettings(revMoreInAll, 0), {
    metric: 'revenue',
    timeframe: 'all',
  })

  const mrrActive30d = {
    '7d': emptySeries.map(pt => ({ ...pt, mrr: 100 })),
    '30d': emptySeries.map(pt => ({ ...pt, mrr: 100 })),
    '60d': emptySeries.map(pt => ({ ...pt, mrr: 100 })),
    'all': emptySeries.map(pt => ({ ...pt, mrr: 100 })),
  }
  assert.deepEqual(determineInitialChartSettings(mrrActive30d, 100), {
    metric: 'mrr',
    timeframe: '30d',
  })
})

test('provider history is reduced to four ten-point chart series', () => {
  const chart = buildSaasHistoryChart({
    subscriptions: [{ created: 10, canceledAt: null, mrr: 100, status: 'active' }],
    charges: [{ created: 50, amount: 400 }, { created: 70, amount: 600 }],
  }, 100_000)

  assert.ok(chart)
  assert.deepEqual(Object.keys(chart), ['7d', '30d', '60d', 'all'])
  assert.equal(Object.values(chart).every(points => points.length === 10), true)
  assert.deepEqual(chart['7d'].at(-1), { at: 100_000, mrr: 100, revenue: 1000 })
})

test('SSR ads, anonymous sessions and missing logos avoid repeated internal requests', () => {
  const ads = readProjectFile('modules/ads/composables/useAdsSlots.ts')
  const adsPlugin = readProjectFile('plugins/ads-slots.server.ts')
  const session = readProjectFile('composables/useFounderSession.ts')
  const profile = readProjectFile('modules/visuals/views/SaasProfileView.vue')
  const logo = readProjectFile('ui/components/SaasLogo.vue')

  assert.doesNotMatch(ads, /useFetch<AdSlot\[]>/)
  assert.match(adsPlugin, /adsService\.getAuctionSlots\(\)/)
  assert.match(session, /isInitialized\.value && !force/)
  assert.doesNotMatch(profile, /const historyRequest = loadHistory\(\)\s+await checkSession\(\)/)
  assert.doesNotMatch(logo, /\/api\/favicon/)
  assert.match(logo, /drop_404_icon=true/)
  assert.match(logo, /\/favicon\.ico/)
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
    formattedRevenue: null,
  })
  assert.deepEqual(summarizeSaasHistory(null, null, 100), {
    mrr: null,
    revenue: null,
    formattedRevenue: null,
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
  assert.match(service, /existingEntry\?\.status === 'published' && !pData\.hasProvider/)
  assert.match(service, /const isDuplicateRegistration = !body\.id && !!existingEntry/)
  assert.match(service, /if \(isDuplicateRegistration\) \{\s*entry = existingEntry/)
})

test('replayed registrations cannot resend notifications or update an existing startup anonymously', () => {
  const publishEndpoint = readProjectFile('modules/add-saas/server/api/publish.post.ts')

  assert.match(publishEndpoint, /if \(body\.id\) await assertFounderCanUpdate\(event, body\.id\)/)
  assert.match(publishEndpoint, /if \(finalEntry\.created && finalEntry\.status === 'pending_review'\)/)
  assert.match(publishEndpoint, /if \(finalEntry\.created && body\.founderEmail\?\.trim\(\)\)/)
})

test('admin review endpoint requires the admin key sent by the panel', () => {
  const reviewEndpoint = readProjectFile('server/api/admin/review.post.ts')

  assert.match(reviewEndpoint, /getHeader\(event, 'x-admin-key'\)/)
  assert.match(reviewEndpoint, /adminKey !== process\.env\.ADMIN_SECRET_KEY/)
})
