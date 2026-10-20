import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import test from 'node:test'

test('catalog requests cards incrementally with reveal animation, skeletons, and SSR hydration safety', () => {
  const source = readFileSync(resolve(import.meta.dirname, '../views/SaasListView.vue'), 'utf8')
  const headerSource = readFileSync(resolve(import.meta.dirname, '../components/SaasListHeader.vue'), 'utf8')
  const cardSource = readFileSync(resolve(import.meta.dirname, '../components/SaasGemCard.vue'), 'utf8')
  const skeletonSource = readFileSync(resolve(import.meta.dirname, '../components/SaasGemCardSkeleton.vue'), 'utf8')

  assert.match(source, /const PAGE_SIZE = 12/)
  assert.match(source, /key: catalogFetchKey/)
  assert.match(source, /useReveal\(\[category, country, sort, items\]\)/)
  assert.match(source, /class="reveal-card"/)
  assert.match(source, /rootMargin: '650px 0px'/)
  assert.match(source, /v-if="hasMore \|\| loadingMore"/)
  assert.match(source, /hasUserScrolled/)
  assert.match(source, /getCachedData:/)
  assert.match(source, /async function fetchNext\(\)/)
  assert.match(source, /offset: items\.value\.length/)
  assert.doesNotMatch(source, /<main[^>]*overflow-x-clip/)
  assert.match(cardSource, /\bh-\[210px\]/)
  assert.match(skeletonSource, /\bh-\[210px\]/)
  assert.match(skeletonSource, /\[overflow-anchor:none\]/)
  assert.match(source, /scrollYOnStart/)
  assert.match(headerSource, /top-\[91px\] md:top-\[105px\]/)
  assert.match(headerSource, /z-\[15\]/)
  assert.match(headerSource, /useAdPreferences/)
})
