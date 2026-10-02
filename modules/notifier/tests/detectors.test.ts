import { describe, it } from 'node:test'
import assert from 'node:assert'
import { detectNewStartups } from '../server/services/detectors/new-startups.detector'
import { detectCountryRecords } from '../server/services/detectors/country-records.detector'
import { detectRankingMoves } from '../server/services/detectors/ranking-moves.detector'
import { detectVisitsRecord } from '../server/services/detectors/visits-records.detector'
import { generateDailyDigest } from '../server/services/detectors/digest.detector'
import type { StartupSnapshotItem, SystemSnapshotState } from '../types'

function createMockSnapshot(partial: Partial<SystemSnapshotState> = {}): SystemSnapshotState {
  return {
    timestamp: '2026-09-28T12:00:00.000Z',
    date: '2026-09-28',
    ranking: [
      {
        id: 's-1',
        name: 'Alpha SaaS',
        slug: 'alpha-saas',
        category: 'Dev Tools',
        countrySlug: 'colombia',
        countryName: 'Colombia',
        countryFlag: '🇨🇴',
        mrr: 5000,
        revenue: 60000,
        views: 120,
        publishedAt: '2026-09-20T10:00:00.000Z',
        isIncognito: false,
        rank: 1,
        hasVerifiedHistory: true,
        chargesCount: 15,
        subscriptionsCount: 8
      },
      {
        id: 's-2',
        name: 'Beta Cloud',
        slug: 'beta-cloud',
        category: 'AI',
        countrySlug: 'mexico',
        countryName: 'México',
        countryFlag: '🇲🇽',
        mrr: 3000,
        revenue: 36000,
        views: 80,
        publishedAt: '2026-09-22T10:00:00.000Z',
        isIncognito: false,
        rank: 2,
        hasVerifiedHistory: true,
        chargesCount: 10,
        subscriptionsCount: 5
      }
    ],
    countries: {
      colombia: {
        totalRevenue: 60000,
        startupsCount: 1,
        maxRevenueRecord: 60000,
        maxStartupsRecord: 1
      },
      mexico: {
        totalRevenue: 36000,
        startupsCount: 1,
        maxRevenueRecord: 36000,
        maxStartupsRecord: 1
      }
    },
    visits: {
      today: 1000,
      history: { '2026-09-27': 950 },
      maxDailyRecord: 1200
    },
    global: {
      totalRevenue: 96000,
      totalStartups: 2
    },
    sentOpportunities: {},
    ...partial
  }
}

describe('Detector: New Startups', () => {
  it('should return empty when there is no previous snapshot (baseline)', () => {
    const current: StartupSnapshotItem[] = [
      {
        id: 's-1',
        name: 'Alpha SaaS',
        slug: 'alpha-saas',
        category: 'Dev Tools',
        mrr: 5000,
        revenue: 60000,
        views: 100,
        publishedAt: new Date().toISOString(),
        isIncognito: false,
        rank: 1,
        hasVerifiedHistory: false,
        chargesCount: 0,
        subscriptionsCount: 0
      }
    ]
    const events = detectNewStartups(current, null)
    assert.strictEqual(events.length, 0)
  })

  it('should detect newly added startups and batch them correctly', () => {
    const prev = createMockSnapshot()
    const current: StartupSnapshotItem[] = [
      ...prev.ranking,
      {
        id: 's-3',
        name: 'Gamma AI',
        slug: 'gamma-ai',
        category: 'AI',
        countrySlug: 'chile',
        countryName: 'Chile',
        countryFlag: '🇨🇱',
        mrr: 1500,
        revenue: 18000,
        views: 20,
        publishedAt: new Date().toISOString(),
        isIncognito: false,
        rank: 3,
        hasVerifiedHistory: false,
        chargesCount: 0,
        subscriptionsCount: 0
      }
    ]

    const events = detectNewStartups(current, prev)
    assert.strictEqual(events.length, 1)
    assert.strictEqual(events[0].eventType, 'new_startup')
    assert.strictEqual(events[0].dedupeKey, 'new_startup:s-3')
    assert.strictEqual(events[0].payload.startups.length, 1)
    assert.strictEqual(events[0].payload.startups[0].name, 'Gamma AI')
  })

  it('should batch multiple incoming startups up to max batch size', () => {
    const prev = createMockSnapshot()
    const newItems: StartupSnapshotItem[] = Array.from({ length: 7 }, (_, i) => ({
      id: `new-${i + 1}`,
      name: `Startup ${i + 1}`,
      slug: `startup-${i + 1}`,
      category: 'Software',
      mrr: 100,
      revenue: 1200,
      views: 5,
      publishedAt: new Date().toISOString(),
      isIncognito: false,
      rank: 3 + i,
      hasVerifiedHistory: false,
      chargesCount: 0,
      subscriptionsCount: 0
    }))

    const events = detectNewStartups([...prev.ranking, ...newItems], prev)
    // 7 items with batch limit of 5 should produce 2 events (5 + 2)
    assert.strictEqual(events.length, 2)
    assert.strictEqual(events[0].payload.startups.length, 5)
    assert.strictEqual(events[1].payload.startups.length, 2)
  })
})

describe('Detector: Country Records', () => {
  it('should detect when country exceeds previous revenue record by margin (>5%)', () => {
    const prev = createMockSnapshot()
    const currentCountries = [
      {
        slug: 'colombia',
        name: 'Colombia',
        flag: '🇨🇴',
        totalRevenue: 70000, // previous was 60,000 -> +16.6% (> 5%)
        startupsCount: 1
      }
    ]

    const events = detectCountryRecords(currentCountries, prev)
    assert.strictEqual(events.length, 1)
    assert.strictEqual(events[0].eventType, 'country_record')
    assert.strictEqual(events[0].payload.metric, 'revenue')
    assert.strictEqual(events[0].payload.previousValue, 60000)
    assert.strictEqual(events[0].payload.newValue, 70000)
  })

  it('should ignore revenue growth that does not reach minimum margin threshold', () => {
    const prev = createMockSnapshot()
    const currentCountries = [
      {
        slug: 'colombia',
        name: 'Colombia',
        flag: '🇨🇴',
        totalRevenue: 60500, // +0.8% -> below 5% margin
        startupsCount: 1
      }
    ]

    const events = detectCountryRecords(currentCountries, prev)
    assert.strictEqual(events.length, 0)
  })
})

describe('Detector: Ranking Moves', () => {
  it('should detect when a startup overtakes another and climbs into Top 3', () => {
    const prev = createMockSnapshot()
    // In prev: s-1 is #1, s-2 is #2.
    // In current: s-2 climbs to #1, s-1 drops to #2.
    const current: StartupSnapshotItem[] = [
      { ...prev.ranking[1], rank: 1 },
      { ...prev.ranking[0], rank: 2 }
    ]

    const events = detectRankingMoves(current, prev, '2026-09-28T14:00:00.000Z')
    assert.strictEqual(events.length, 1)
    assert.strictEqual(events[0].eventType, 'ranking_move')
    assert.strictEqual(events[0].payload.moves.length, 1)
    assert.strictEqual(events[0].payload.moves[0].name, 'Beta Cloud')
    assert.strictEqual(events[0].payload.moves[0].newRank, 1)
    assert.strictEqual(events[0].payload.moves[0].previousRank, 2)
    assert.strictEqual(events[0].payload.moves[0].overtookName, 'Alpha SaaS')
  })
})

describe('Detector: Visits Records', () => {
  it('should detect when today visits beat all-time record', () => {
    const prev = createMockSnapshot() // max was 1200
    const events = detectVisitsRecord(1500, '2026-09-28', prev) // 1500 > 1200 (+25%)

    assert.strictEqual(events.length, 1)
    assert.strictEqual(events[0].eventType, 'visits_record')
    assert.strictEqual(events[0].payload.totalVisits, 1500)
    assert.strictEqual(events[0].payload.previousRecord, 1200)
  })

  it('should ignore visits below previous historical maximum', () => {
    const prev = createMockSnapshot() // max was 1200
    const events = detectVisitsRecord(1100, '2026-09-28', prev)

    assert.strictEqual(events.length, 0)
  })
})

describe('Detector: Daily Digest', () => {
  it('should generate honest quiet-day digest when no metrics changed', () => {
    const prev = createMockSnapshot()
    const digestEvent = generateDailyDigest({
      currentRanking: prev.ranking,
      currentCountries: prev.countries,
      currentGlobalRevenue: prev.global.totalRevenue,
      previousSnapshot: prev,
      todayVisits: 0,
      sevenDayAvgVisits: 0,
      opportunities: [],
      dateStr: '2026-09-28'
    })

    assert.strictEqual(digestEvent.eventType, 'digest')
    assert.strictEqual(digestEvent.dedupeKey, 'digest:2026-09-28')
    assert.strictEqual(digestEvent.payload.isQuietDay, true)
    assert.strictEqual(digestEvent.payload.newStartupsCount, 0)
  })

  it('should generate rich digest with active news and opportunities', () => {
    const prev = createMockSnapshot()
    const newStartup: StartupSnapshotItem = {
      id: 's-99',
      name: 'NewGen AI',
      slug: 'newgen-ai',
      category: 'AI',
      countrySlug: 'mexico',
      countryName: 'México',
      countryFlag: '🇲🇽',
      mrr: 2000,
      revenue: 24000,
      views: 50,
      publishedAt: new Date().toISOString(),
      isIncognito: false,
      rank: 3,
      hasVerifiedHistory: true,
      chargesCount: 5,
      subscriptionsCount: 3
    }

    const digestEvent = generateDailyDigest({
      currentRanking: [...prev.ranking, newStartup],
      currentCountries: {
        ...prev.countries,
        mexico: { ...prev.countries.mexico, totalRevenue: 60000, startupsCount: 2 }
      },
      currentGlobalRevenue: 120000,
      previousSnapshot: prev,
      todayVisits: 1400,
      sevenDayAvgVisits: 1000,
      opportunities: [
        {
          startupId: 's-99',
          name: 'NewGen AI',
          slug: 'newgen-ai',
          category: 'AI',
          country: 'México',
          countryFlag: '🇲🇽',
          currentMrr: 2000,
          currency: 'USD',
          score: 75,
          reasons: ['Lanzamiento reciente', 'Facturación verificada'],
          isVerified: true,
          publishedAt: new Date().toISOString()
        }
      ],
      dateStr: '2026-09-28'
    })

    assert.strictEqual(digestEvent.payload.isQuietDay, false)
    assert.strictEqual(digestEvent.payload.newStartupsCount, 1)
    assert.strictEqual(digestEvent.payload.globalRevenueChange, 24000)
    assert.strictEqual(digestEvent.payload.opportunities.length, 1)
    assert.strictEqual(digestEvent.payload.visitsSummary?.changePercentage, 40)
  })
})
