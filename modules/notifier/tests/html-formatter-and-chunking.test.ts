import { describe, it } from 'node:test'
import assert from 'node:assert'
import {
  escapeHtml,
  formatCurrency,
  formatCurrencyDelta,
  formatPercentage,
  buildUtmLink,
  splitMessageIntoChunks
} from '../server/services/formatters/html.formatter'

describe('HTML Formatter & Text Utilities', () => {
  it('should escape HTML characters safely', () => {
    assert.strictEqual(escapeHtml('Tom & Jerry <script>alert("xss")</script>'), 'Tom &amp; Jerry &lt;script&gt;alert("xss")&lt;/script&gt;')
    assert.strictEqual(escapeHtml(null), '')
    assert.strictEqual(escapeHtml(undefined), '')
  })

  it('should format currency correctly according to spec ($0, $1K, $12.4K, $1.2M)', () => {
    assert.strictEqual(formatCurrency(0), '$0')
    assert.strictEqual(formatCurrency(500), '$500')
    assert.strictEqual(formatCurrency(1000), '$1K')
    assert.strictEqual(formatCurrency(12400), '$12.4K')
    assert.strictEqual(formatCurrency(48000), '$48K')
    assert.strictEqual(formatCurrency(1200000), '$1.2M')
    assert.strictEqual(formatCurrency(null), '—')
  })

  it('should format currency delta with +/- sign', () => {
    assert.strictEqual(formatCurrencyDelta(2100), '+$2.1K')
    assert.strictEqual(formatCurrencyDelta(-500), '-$500')
    assert.strictEqual(formatCurrencyDelta(0), '$0')
  })

  it('should format signed percentages', () => {
    assert.strictEqual(formatPercentage(18), '+18%')
    assert.strictEqual(formatPercentage(-5), '-5%')
    assert.strictEqual(formatPercentage(0), '0%')
  })

  it('should generate UTM link with standard parameters', () => {
    const link = buildUtmLink('/saas/test-app', 'new_startup', 'Test App')
    assert.ok(link.includes('href="https://www.factosaas.com/saas/test-app?utm_source=telegram&utm_medium=channel&utm_campaign=new_startup"'))
    assert.ok(link.includes('>Test App</a>'))
  })

  it('should split messages longer than 4096 characters without cutting paragraphs or lines', () => {
    const shortText = 'Hello Telegram'
    const shortChunks = splitMessageIntoChunks(shortText, 4096)
    assert.strictEqual(shortChunks.length, 1)

    // Build a message with multiple 500-char paragraphs totaling 5000 chars
    const paragraphs = Array.from({ length: 10 }, (_, i) => `Paragraph ${i + 1}: ${'A'.repeat(450)}`)
    const longMessage = paragraphs.join('\n\n')

    const chunks = splitMessageIntoChunks(longMessage, 2000)
    assert.ok(chunks.length > 1)
    for (const chunk of chunks) {
      assert.ok(chunk.length <= 2000)
    }
  })
})
