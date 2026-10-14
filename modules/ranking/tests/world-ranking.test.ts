import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import test from 'node:test'

const projectRoot = resolve(import.meta.dirname, '../../..')
const readProjectFile = (path: string) => readFileSync(resolve(projectRoot, path), 'utf8')

test('world ranking marks startups without confirmed revenue with a question icon', () => {
  const countryGrid = readProjectFile('modules/visuals/views/CountryGridView.vue')
  assert.match(countryGrid, /<HelpCircle[\s\S]*?title="Revenue no confirmado"[\s\S]*?aria-label="Revenue no confirmado"/)
})

test('world ranking excludes anonymous startups from being rendered', () => {
  const countryGrid = readProjectFile('modules/visuals/views/CountryGridView.vue')
  assert.doesNotMatch(countryGrid, /t\.gem_card\.incognito/)
  assert.doesNotMatch(countryGrid, /IncognitoIcon/)
  assert.match(countryGrid, /getVisibleStartups\(item\.startups\)/)
})

test('world ranking leaderboard API filters out incognito startups', () => {
  const leaderboardApi = readProjectFile('server/api/countries/leaderboard.get.ts')
  assert.match(leaderboardApi, /if\s*\(row\.is_incognito\)\s*continue/)
})
