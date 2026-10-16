import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import test from 'node:test'

test('catalog requests cards incrementally with reveal animation, skeletons, and SSR hydration safety', () => {
  const source = readFileSync(resolve(import.meta.dirname, '../views/SaasListView.vue'), 'utf8')
  assert.match(source, /const PAGE_SIZE = 12/)
  assert.match(source, /key: catalogFetchKey/)
  assert.match(source, /useReveal\(\[category, country, sort, items\]\)/)
  assert.match(source, /class="reveal-card"/)
  assert.match(source, /rootMargin: '650px 0px'/)
  assert.match(source, /v-if="loadingMore"/)
  assert.match(source, /SaasGemCardSkeleton v-for="n in PAGE_SIZE" :key="'gem-more-sk-' \+ n"/)
  assert.match(source, /getCachedData:/)
  assert.match(source, /async function fetchNext\(\)/)
  assert.match(source, /offset: items\.value\.length/)
})
