import { describe, it } from 'node:test'
import assert from 'node:assert'
import { evaluateOpportunities } from '../server/services/detectors/opportunities.detector'
import type { StartupSnapshotItem, SystemSnapshotState } from '../types'

describe('Opportunities Scoring Engine', () => {
  it('should score high for verified startups with rapid verified MRR growth and novelty', () => {
    const prevSnapshot: SystemSnapshotState = {
      timestamp: '2026-09-14T00:00:00.000Z',
      date: '2026-09-14',
      ranking: [
        {
          id: 'opp-1',
          name: 'FastScale',
          slug: 'fast-scale',
          category: 'AI',
          countrySlug: 'chile',
          countryName: 'Chile',
          countryFlag: '🇨🇱',
          mrr: 1000,
          revenue: 12000,
          views: 150,
          publishedAt: '2026-09-24T00:00:00.000Z',
          isIncognito: false,
          rank: 5,
          hasVerifiedHistory: true,
          chargesCount: 10,
          subscriptionsCount: 4
        }
      ],
      countries: {},
      visits: { today: 0, history: {}, maxDailyRecord: 0 },
      global: { totalRevenue: 12000, totalStartups: 1 },
      sentOpportunities: {}
    }

    const currentStartups: StartupSnapshotItem[] = [
      {
        id: 'opp-1',
        name: 'FastScale',
        slug: 'fast-scale',
        category: 'AI',
        countrySlug: 'chile',
        countryName: 'Chile',
        countryFlag: '🇨🇱',
        mrr: 2000, // +100% growth from 1000 -> +40 points
        revenue: 24000,
        views: 150, // > 100 views -> +10 points
        publishedAt: '2026-09-24T00:00:00.000Z', // Recent launch -> +15 points
        isIncognito: false,
        rank: 3,
        hasVerifiedHistory: true, // Verified -> +15 points
        chargesCount: 20,
        subscriptionsCount: 8
      }
    ]

    const result = evaluateOpportunities(currentStartups, prevSnapshot, '2026-09-28')

    assert.ok(result.eligibleOpportunities.length > 0)
    const opp = result.eligibleOpportunities[0]
    assert.strictEqual(opp.name, 'FastScale')
    // Score should be >= 85 (40 growth + 15 mrr threshold + 15 verified + 15 novelty + 10 views = 95)
    assert.ok(opp.score >= 85, `Expected score >= 85 but got ${opp.score}`)
    assert.ok(opp.reasons.some(r => r.includes('MRR +100%')))
    assert.ok(opp.reasons.some(r => r.includes('Facturación verificada')))
    assert.strictEqual(result.standaloneAlertEvents.length, 1)
  })

  it('should ignore incognito startups from public opportunities', () => {
    const currentStartups: StartupSnapshotItem[] = [
      {
        id: 'opp-anon',
        name: '— Anónimo —',
        slug: 'opp-anon',
        category: 'Fintech',
        mrr: 50000,
        revenue: 600000,
        views: 500,
        publishedAt: new Date().toISOString(),
        isIncognito: true,
        rank: 1,
        hasVerifiedHistory: true,
        chargesCount: 50,
        subscriptionsCount: 20
      }
    ]

    const result = evaluateOpportunities(currentStartups, null, '2026-09-28')
    assert.strictEqual(result.eligibleOpportunities.length, 0)
    assert.strictEqual(result.standaloneAlertEvents.length, 0)
  })

  it('should respect the 14-day cooldown unless MRR leaped by >= 30%', () => {
    const prevSnapshot: SystemSnapshotState = {
      timestamp: '2026-09-25T00:00:00.000Z',
      date: '2026-09-25',
      ranking: [],
      countries: {},
      visits: { today: 0, history: {}, maxDailyRecord: 0 },
      global: { totalRevenue: 0, totalStartups: 0 },
      sentOpportunities: {
        'opp-cooled': {
          lastSentDate: '2026-09-24', // Sent 4 days ago (< 14 days)
          lastScore: 80,
          lastMrr: 2000
        }
      }
    }

    const currentWithSmallChange: StartupSnapshotItem[] = [
      {
        id: 'opp-cooled',
        name: 'CoolApp',
        slug: 'cool-app',
        category: 'Design',
        mrr: 2100, // +5% (not significant enough to break cooldown)
        revenue: 25000,
        views: 200,
        publishedAt: '2026-09-20T00:00:00.000Z',
        isIncognito: false,
        rank: 4,
        hasVerifiedHistory: true,
        chargesCount: 10,
        subscriptionsCount: 5
      }
    ]

    const resultCooldown = evaluateOpportunities(currentWithSmallChange, prevSnapshot, '2026-09-28')
    assert.strictEqual(resultCooldown.eligibleOpportunities.length, 0)

    const currentWithMajorJump: StartupSnapshotItem[] = [
      {
        ...currentWithSmallChange[0],
        mrr: 3500 // +75% jump from 2000 -> breaks cooldown!
      }
    ]

    const resultJump = evaluateOpportunities(currentWithMajorJump, prevSnapshot, '2026-09-28')
    assert.strictEqual(resultJump.eligibleOpportunities.length, 1)
  })
})
