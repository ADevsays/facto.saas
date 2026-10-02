import 'dotenv/config'
import { describe, it } from 'node:test'
import assert from 'node:assert'
import { NotifierOrchestrator } from '../server/services/notifier.orchestrator'
import { MemoryStorageProvider } from '../server/db/memory.storage'
import { TelegramClient } from '../server/services/telegram.client'
import type { VisitsDataSource } from '../server/services/visits.provider'
import type { StartupSnapshotItem, SystemSnapshotState } from '../types'

class MockVisitsProvider implements VisitsDataSource {
  private visits: number
  constructor(visits = 500) {
    this.visits = visits
  }
  getSourceName(): string { return 'Mock Visits' }
  async isAvailable(): Promise<boolean> { return true }
  async getTodayVisits(): Promise<number> { return this.visits }
  async getVisitsHistory(): Promise<Record<string, number>> { return { '2026-09-27': 450 } }
  getSevenDayAverage(): number { return 450 }
}

describe('Notifier Orchestrator Pipeline & Dry Run', () => {
  it('should initialize baseline on first run without generating or sending events', async () => {
    const storage = new MemoryStorageProvider()
    const client = new TelegramClient({ dryRun: true })
    const visits = new MockVisitsProvider(200)

    const orchestrator = new NotifierOrchestrator({
      storage,
      telegramClient: client,
      visitsProvider: visits,
      dryRun: true
    })

    // Mock captureCurrentState on snapshotService
    orchestrator.snapshotService.captureCurrentState = async () => ({
      timestamp: '2026-09-28T12:00:00.000Z',
      date: '2026-09-28',
      ranking: [
        {
          id: 'init-1',
          name: 'First SaaS',
          slug: 'first-saas',
          category: 'Design',
          mrr: 1000,
          revenue: 12000,
          views: 50,
          publishedAt: '2026-09-28T00:00:00.000Z',
          isIncognito: false,
          rank: 1,
          hasVerifiedHistory: false,
          chargesCount: 0,
          subscriptionsCount: 0
        }
      ],
      countries: {},
      visits: { today: 200, history: {}, maxDailyRecord: 200 },
      global: { totalRevenue: 12000, totalStartups: 1 },
      sentOpportunities: {}
    })

    const cycleResult = await orchestrator.runMilestoneCycle()
    assert.strictEqual(cycleResult.isBaseline, true)
    assert.strictEqual(cycleResult.enqueuedCount, 0)
    assert.strictEqual(cycleResult.dispatchResult.sent, 0)

    // Snapshot should be persisted
    const savedSnap = await storage.getLatestSnapshot('milestone')
    assert.ok(savedSnap !== null)
    assert.strictEqual(savedSnap?.state.ranking.length, 1)
  })

  it('should detect additions on second run, enqueue events, and dispatch them in dry-run', async () => {
    const storage = new MemoryStorageProvider()
    const client = new TelegramClient({ dryRun: true })
    const visits = new MockVisitsProvider(200)

    const orchestrator = new NotifierOrchestrator({
      storage,
      telegramClient: client,
      visitsProvider: visits,
      dryRun: true
    })

    // 1. Initial snapshot in storage
    const initialSnap: SystemSnapshotState = {
      timestamp: '2026-09-28T10:00:00.000Z',
      date: '2026-09-28',
      ranking: [
        {
          id: 'init-1',
          name: 'First SaaS',
          slug: 'first-saas',
          category: 'Design',
          mrr: 1000,
          revenue: 12000,
          views: 50,
          publishedAt: '2026-09-28T00:00:00.000Z',
          isIncognito: false,
          rank: 1,
          hasVerifiedHistory: false,
          chargesCount: 0,
          subscriptionsCount: 0
        }
      ],
      countries: {},
      visits: { today: 200, history: {}, maxDailyRecord: 200 },
      global: { totalRevenue: 12000, totalStartups: 1 },
      sentOpportunities: {}
    }
    await storage.saveSnapshot(initialSnap, 'milestone')

    // 2. Current state with 1 new startup
    orchestrator.snapshotService.captureCurrentState = async () => ({
      ...initialSnap,
      timestamp: '2026-09-28T10:15:00.000Z',
      ranking: [
        ...initialSnap.ranking,
        {
          id: 'init-2',
          name: 'Second SaaS',
          slug: 'second-saas',
          category: 'AI',
          countryName: 'Colombia',
          countryFlag: '🇨🇴',
          mrr: 2500,
          revenue: 30000,
          views: 10,
          publishedAt: '2026-09-28T10:10:00.000Z',
          isIncognito: false,
          rank: 2,
          hasVerifiedHistory: true,
          chargesCount: 5,
          subscriptionsCount: 2
        }
      ]
    })

    const cycleResult = await orchestrator.runMilestoneCycle()
    assert.strictEqual(cycleResult.isBaseline, false)
    assert.strictEqual(cycleResult.enqueuedCount, 2) // 1 new_startup + 1 country_record
    assert.strictEqual(cycleResult.dispatchResult.processed, 2)
    assert.strictEqual(cycleResult.dispatchResult.sent, 2)
  })
})
