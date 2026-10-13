import assert from 'node:assert/strict'
import test from 'node:test'
import { parseCacheE2eAd } from './cache-e2e-fixtures'

test('accepts a valid isolated ad fixture', () => {
  assert.deepEqual(parseCacheE2eAd({
    name: 'Preview Atlas',
    description: 'A fixture used only for ISR verification.',
    url: 'https://example.test',
    position: 3,
    price: 7,
    isActive: true,
  }), {
    name: 'Preview Atlas',
    description: 'A fixture used only for ISR verification.',
    url: 'https://example.test',
    imageUrl: '',
    position: 3,
    price: 7,
    isActive: true,
  })
})

test('rejects a fixture outside the auction slot range', () => {
  assert.equal(parseCacheE2eAd({
    name: 'Invalid', description: 'Outside the allowed slot range.', url: 'https://example.test', position: 21, price: 1,
  }), null)
})
