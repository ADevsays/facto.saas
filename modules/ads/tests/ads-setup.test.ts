import { describe, it } from 'node:test'
import assert from 'node:assert'
import type { Ad } from '../types'

function normalizeAdUrl(rawUrl: string): string {
  let clean = (rawUrl || '').trim()
  if (clean && !/^https?:\/\//i.test(clean)) {
    clean = `https://${clean}`
  }
  return clean
}

function formatAdMetadataTag(metadata: {
  position: number
  price: number
  email?: string
  is_affiliate?: boolean
}): string {
  return `<!--meta:${JSON.stringify(metadata)}-->`
}

function parseAdDescriptionMetadata(description: string): { cleanDescription: string; meta: any } {
  let meta: any = null
  const metaMatch = description?.match(/<!--meta:(\{.*?\})-->/)
  if (metaMatch) {
    try {
      meta = JSON.parse(metaMatch[1])
    } catch (_) {}
  }
  const cleanDescription = description ? description.replace(/<!--meta:\{.*?\}-->/, '').trim() : ''
  return { cleanDescription, meta }
}

describe('Ads Setup, URL Normalization and Metadata Parsing', () => {
  it('should automatically prepend https:// to bare domain URLs', () => {
    assert.strictEqual(normalizeAdUrl('mystartup.com'), 'https://mystartup.com')
    assert.strictEqual(normalizeAdUrl('app.mystartup.com/dashboard'), 'https://app.mystartup.com/dashboard')
    assert.strictEqual(normalizeAdUrl('http://myinsecure.com'), 'http://myinsecure.com')
    assert.strictEqual(normalizeAdUrl('https://secure.com'), 'https://secure.com')
  })

  it('should encode and decode embedded metadata in description seamlessly', () => {
    const originalPitch = 'La mejor herramienta de analíticas'
    const metaTag = formatAdMetadataTag({
      position: 1,
      price: 25,
      email: 'founder@saas.com',
      is_affiliate: false
    })

    const fullDescription = `${originalPitch} ${metaTag}`
    const parsed = parseAdDescriptionMetadata(fullDescription)

    assert.strictEqual(parsed.cleanDescription, originalPitch)
    assert.strictEqual(parsed.meta.position, 1)
    assert.strictEqual(parsed.meta.price, 25)
    assert.strictEqual(parsed.meta.email, 'founder@saas.com')
  })
})
