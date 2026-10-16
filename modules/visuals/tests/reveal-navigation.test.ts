import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import test from 'node:test'

test('catalog reinitializes card reveals when async items arrive', () => {
  const source = readFileSync(resolve(import.meta.dirname, '../views/SaasListView.vue'), 'utf8')
  assert.match(source, /useReveal\(\[category, country, sort, items\]\)/)
})
