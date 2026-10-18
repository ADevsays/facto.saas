import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import test from 'node:test'

const projectRoot = resolve(import.meta.dirname, '../../..')
const readProjectFile = (path: string) => readFileSync(resolve(projectRoot, path), 'utf8')

test('world ranking marks startups without confirmed revenue with a question icon', () => {
  const countryList = readProjectFile('modules/visuals/components/CountryStartupList.vue')
  assert.match(countryList, /<HelpCircle[\s\S]*?title="Revenue no confirmado"[\s\S]*?aria-label="Revenue no confirmado"/)
})

test('world ranking excludes anonymous startups from being rendered', () => {
  const countryGrid = readProjectFile('modules/visuals/views/CountryGridView.vue')
  const ranking = readProjectFile('modules/ranking/server/services/ranking.ts')
  assert.doesNotMatch(countryGrid, /t\.gem_card\.incognito/)
  assert.doesNotMatch(countryGrid, /IncognitoIcon/)
  assert.match(ranking, /\.not\('is_incognito', 'is', true\)/)
})

test('world ranking leaderboard API filters out incognito startups', () => {
  const leaderboardApi = readProjectFile('server/api/countries/leaderboard.get.ts')
  assert.match(leaderboardApi, /\.not\('is_incognito', 'is', true\)/)
  assert.doesNotMatch(leaderboardApi, /fetchCachedFinancialSummaries/)
})

test('home country cards do not request the leaderboard', () => {
  const cards = readProjectFile('modules/visuals/sections/CountryCardsSection.vue')
  assert.doesNotMatch(cards, /countries\/leaderboard/)
})

test('country startup chunks reuse public logo fallbacks and preserve unknown revenue', () => {
  const ranking = readProjectFile('modules/ranking/server/services/ranking.ts')
  const countryList = readProjectFile('modules/visuals/components/CountryStartupList.vue')
  assert.match(ranking, /website_url/)
  assert.match(ranking, /row\.revenue === null \|\| row\.revenue === undefined/)
  assert.match(ranking, /payment_providers \( slug \)/)
  assert.match(ranking, /revenue: hasProvider && revenue !== null/)
  assert.match(countryList, /<IncognitoIcon v-if="!startup\.hasProvider"|<template v-if="!startup\.hasProvider">[\s\S]*?<IncognitoIcon/)
  assert.match(countryList, /:website-url="startup\.websiteUrl"/)
  assert.match(countryList, /<HelpCircle v-else/)
})

test('connected zero revenue outranks startups without a payment provider', () => {
  const ranking = readProjectFile('modules/ranking/server/services/ranking.ts')
  const homeList = readProjectFile('composables/useSaasList.ts')
  assert.match(ranking, /hasConnectedProvider && Number\.isFinite\(numericRevenue\) && numericRevenue >= 0/)
  assert.match(ranking, /Number\(Boolean\(b\.provider\)\) - Number\(Boolean\(a\.provider\)\)/)
  assert.match(homeList, /const compareByRevenue = \(a: SaasListItem, b: SaasListItem\)/)
  assert.match(homeList, /Number\(Boolean\(b\.provider\)\) - Number\(Boolean\(a\.provider\)\)/)
})

test('recent cards use the incognito marker instead of an ARR dash without a provider', () => {
  const formatter = readProjectFile('utils/format.ts')
  const recentSection = readProjectFile('modules/visuals/sections/RecentlySection.vue')
  const card = readProjectFile('modules/visuals/components/SaasCard.vue')
  assert.match(formatter, /if \(mrr === null\) return null/)
  assert.match(recentSection, /item\.provider \? formatRevenueValue\(item\.mrr\) : null/)
  assert.doesNotMatch(card, /revenue !== '—'/)
  assert.doesNotMatch(card, /mrr !== '—'/)
})

test('startup ranking excludes anonymous startups from rankingItems and ranking endpoint', () => {
  const saasListComposable = readProjectFile('composables/useSaasList.ts')
  assert.match(saasListComposable, /rankingItems\s*=\s*computed\(\(\)\s*=>[\s\S]*?\.filter\(item\s*=>\s*!item\.isIncognito\)/)

  const rankingEndpoint = readProjectFile('modules/ranking/server/api/ranking/ranking.get.ts')
  assert.match(rankingEndpoint, /excludeIncognito:\s*true/)

  const rankingRow = readProjectFile('modules/ranking/components/RankingRow.vue')
  assert.doesNotMatch(rankingRow, /item\.isIncognito\s*\?\s*t\.row\.incognito/)
})
