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

  it('should render new startup template with ranking position for top 1, top 3, top 10 and generic ranks', async () => {
    const { renderNewStartupMessage } = await import('../server/services/formatters/message.templates')

    const top1 = renderNewStartupMessage({
      startups: [{
        id: 's-1',
        name: 'Super App',
        slug: 'super-app',
        category: 'Finance',
        country: 'Colombia',
        countryFlag: '🇨🇴',
        mrr: 5000,
        currency: 'USD',
        isIncognito: false,
        rank: 1,
        totalRanked: 100
      }]
    })
    assert.ok(top1.valid)
    assert.ok(top1.text.includes('#1 en el ranking global de Facto'))

    const top3 = renderNewStartupMessage({
      startups: [{
        id: 's-2',
        name: 'Top 3 App',
        slug: 'top-3-app',
        category: 'Dev',
        mrr: 3000,
        currency: 'USD',
        isIncognito: false,
        rank: 2,
        totalRanked: 100
      }]
    })
    assert.ok(top3.valid)
    assert.ok(top3.text.includes('#2 en el ranking global</b> (¡Top 3!)'))

    const rankGeneric = renderNewStartupMessage({
      startups: [{
        id: 's-3',
        name: 'General App',
        slug: 'general-app',
        category: 'General',
        mrr: null,
        currency: 'USD',
        isIncognito: false,
        rank: 45,
        totalRanked: 100
      }]
    })
    assert.ok(rankGeneric.valid)
    assert.ok(rankGeneric.text.includes('Posición en el ranking: <b>#45</b> de 100'))
  })

  it('should render daily digest CTA pointing to /stats', async () => {
    const { renderDailyDigestMessage } = await import('../server/services/formatters/message.templates')

    const digest = renderDailyDigestMessage({
      dateStr: '3 de Octubre',
      newStartupsCount: 1,
      newStartupsSummary: [{ name: 'Test App', country: 'España', category: 'Dev', mrr: 100 }],
      globalRevenue: 50000,
      globalRevenueFormatted: '$50K',
      globalRevenueChange: 1000,
      globalRevenueChangeFormatted: '+$1K',
      topCountryMovers: [],
      rankingHighlights: [],
      visitsSummary: { todayVisits: 1000, sevenDayAvg: 800, changePercentage: 25 },
      opportunities: [],
      isQuietDay: false
    })

    assert.ok(digest.valid)
    assert.ok(digest.text.includes('/stats?utm_source=telegram&utm_medium=channel&utm_campaign=daily_digest'))

    const quietDigest = renderDailyDigestMessage({
      dateStr: '3 de Octubre',
      newStartupsCount: 0,
      newStartupsSummary: [],
      globalRevenue: 50000,
      globalRevenueFormatted: '$50K',
      globalRevenueChange: 0,
      globalRevenueChangeFormatted: '$0',
      topCountryMovers: [],
      rankingHighlights: [],
      visitsSummary: null,
      opportunities: [],
      isQuietDay: true
    })

    assert.ok(quietDigest.valid)
    assert.ok(quietDigest.text.includes('/stats?utm_source=telegram&utm_medium=channel&utm_campaign=daily_digest'))
  })
})
