import type { StorageProvider } from '../db/storage.interface'
import { SupabaseStorageProvider } from '../db/supabase.storage'
import { TelegramClient } from './telegram.client'
import { PlatformVisitsProvider, type VisitsDataSource } from './visits.provider'
import { SnapshotService } from './snapshot.service'
import { OutboxService } from './outbox.service'
import { AntiSpamService } from './anti-spam.service'
import { detectNewStartups } from './detectors/new-startups.detector'
import { detectCountryRecords } from './detectors/country-records.detector'
import { detectRankingMoves } from './detectors/ranking-moves.detector'
import { detectVisitsRecord } from './detectors/visits-records.detector'
import { evaluateOpportunities } from './detectors/opportunities.detector'
import { generateDailyDigest } from './detectors/digest.detector'
import type { SystemSnapshotState } from '../../types'

export interface OrchestratorOptions {
  storage?: StorageProvider
  telegramClient?: TelegramClient
  visitsProvider?: VisitsDataSource
  antiSpam?: AntiSpamService
  dryRun?: boolean
}

export class NotifierOrchestrator {
  public storage: StorageProvider
  public telegramClient: TelegramClient
  public visitsProvider: VisitsDataSource
  public snapshotService: SnapshotService
  public outboxService: OutboxService
  public antiSpam: AntiSpamService

  constructor(options: OrchestratorOptions = {}) {
    this.storage = options.storage || new SupabaseStorageProvider()
    this.telegramClient = options.telegramClient || new TelegramClient({ dryRun: options.dryRun })
    if (options.dryRun !== undefined) {
      this.telegramClient.setDryRun(options.dryRun)
    }
    this.visitsProvider = options.visitsProvider || new PlatformVisitsProvider()
    this.antiSpam = options.antiSpam || new AntiSpamService({ ignoreSilenceHours: options.dryRun })
    this.snapshotService = new SnapshotService(this.storage, this.visitsProvider)
    this.outboxService = new OutboxService(this.storage, this.telegramClient, this.antiSpam)
  }

  /**
   * Initializes baseline snapshot without generating or sending any historical events.
   */
  async initializeBaseline(): Promise<{ state: SystemSnapshotState; message: string }> {
    const currentState = await this.snapshotService.captureCurrentState()
    await this.snapshotService.saveSnapshot(currentState, 'milestone')
    return {
      state: currentState,
      message: 'Baseline snapshot initialized successfully. No events enqueued.'
    }
  }

  /**
   * Runs the regular milestone detection and dispatch cycle (every 5-15 mins).
   */
  async runMilestoneCycle(): Promise<{
    isBaseline: boolean
    enqueuedCount: number
    dispatchResult: { processed: number; sent: number; skipped: number; failed: number }
  }> {
    const previousSnapshot = await this.snapshotService.getLatestSnapshot('milestone')

    if (!previousSnapshot) {
      // First run: save baseline and exit safely without spamming
      console.log('[NotifierOrchestrator] No previous snapshot found. Initializing baseline.')
      await this.initializeBaseline()
      return {
        isBaseline: true,
        enqueuedCount: 0,
        dispatchResult: { processed: 0, sent: 0, skipped: 0, failed: 0 }
      }
    }

    const currentState = await this.snapshotService.captureCurrentState()
    let enqueuedCount = 0

    // 1. Detect New Startups
    const newStartupEvents = detectNewStartups(currentState.ranking, previousSnapshot)
    for (const evt of newStartupEvents) {
      const saved = await this.storage.enqueueEvent(evt)
      if (saved) enqueuedCount++
    }

    // 2. Detect Country Records
    const countryAggregates = Object.entries(currentState.countries).map(([slug, c]) => ({
      slug,
      name: c.name || slug,
      flag: c.flag || '',
      totalRevenue: c.totalRevenue,
      startupsCount: c.startupsCount
    }))
    const countryRecordEvents = detectCountryRecords(countryAggregates, previousSnapshot)
    for (const evt of countryRecordEvents) {
      const saved = await this.storage.enqueueEvent(evt)
      if (saved) enqueuedCount++
    }

    // 3. Detect Ranking Moves
    const rankingMoveEvents = detectRankingMoves(currentState.ranking, previousSnapshot)
    for (const evt of rankingMoveEvents) {
      const saved = await this.storage.enqueueEvent(evt)
      if (saved) enqueuedCount++
    }

    // 4. Detect Visits Records
    const visitsEvents = detectVisitsRecord(currentState.visits.today, currentState.date, previousSnapshot)
    for (const evt of visitsEvents) {
      const saved = await this.storage.enqueueEvent(evt)
      if (saved) enqueuedCount++
    }

    // 5. Evaluate Opportunities for Standalone Alert (if exceptional)
    const oppResult = evaluateOpportunities(currentState.ranking, previousSnapshot, currentState.date)
    for (const evt of oppResult.standaloneAlertEvents) {
      const saved = await this.storage.enqueueEvent(evt)
      if (saved) enqueuedCount++
    }

    // Save updated snapshot state
    await this.snapshotService.saveSnapshot(currentState, 'milestone')

    // Process outbox queue
    const dispatchResult = await this.outboxService.processOutbox()

    return {
      isBaseline: false,
      enqueuedCount,
      dispatchResult
    }
  }

  /**
   * Runs the Daily Digest generation and dispatch cycle.
   */
  async runDailyDigestCycle(
    dateStr = new Date().toISOString().substring(0, 10),
    force = false
  ): Promise<{
    digestEnqueued: boolean
    dispatchResult: { processed: number; sent: number; skipped: number; failed: number }
  }> {
    const previousSnapshot = await this.snapshotService.getLatestSnapshot('milestone')
    const currentState = await this.snapshotService.captureCurrentState(dateStr)

    // Calculate visits 7-day average
    const sevenDayAvg = this.visitsProvider.getSevenDayAverage(currentState.visits.history)

    // Evaluate opportunities for inclusion in digest
    const oppResult = evaluateOpportunities(currentState.ranking, previousSnapshot, dateStr)
    const selectedOpps = oppResult.eligibleOpportunities.slice(0, 5)

    // Update sent opportunities cooldown registry in current state
    const sentOpps = { ...(currentState.sentOpportunities || {}) }
    for (const opp of selectedOpps) {
      sentOpps[opp.startupId] = {
        lastSentDate: dateStr,
        lastScore: opp.score,
        lastMrr: opp.currentMrr
      }
    }
    currentState.sentOpportunities = sentOpps

    // Generate daily digest
    const digestEvent = generateDailyDigest({
      currentRanking: currentState.ranking,
      currentCountries: currentState.countries,
      currentGlobalRevenue: currentState.global.totalRevenue,
      previousSnapshot,
      todayVisits: currentState.visits.today,
      sevenDayAvgVisits: sevenDayAvg,
      opportunities: selectedOpps,
      dateStr
    })

    if (force) {
      digestEvent.dedupeKey = `digest:${dateStr}:${Date.now()}`
    }

    const saved = await this.storage.enqueueEvent(digestEvent)
    await this.snapshotService.saveSnapshot(currentState, 'milestone')

    // Process outbox immediately
    const dispatchResult = await this.outboxService.processOutbox()

    return {
      digestEnqueued: Boolean(saved),
      dispatchResult
    }
  }

  /**
   * Sends a test diagnostic message directly to admin chat.
   */
  async sendTestMessage(adminChatId?: string | number): Promise<{ success: boolean; messageId?: number }> {
    const targetChat = adminChatId || process.env.TELEGRAM_ADMIN_CHAT_ID || process.env.TELEGRAM_CHANNEL_ID
    if (!targetChat) {
      throw new Error('Neither TELEGRAM_ADMIN_CHAT_ID nor TELEGRAM_CHANNEL_ID is configured')
    }

    const dateStr = new Date().toLocaleString('es-CO', { timeZone: 'America/Bogota' })
    const text = `🧪 <b>Prueba de conexión Facto Notifier</b>\n\nEl bot de Telegram está correctamente configurado.\nFecha: <code>${dateStr}</code>\nModo Dry-Run: <b>${this.telegramClient.isDryRun() ? 'ACTIVADO (Simulación)' : 'DESACTIVADO (Envíos Reales)'}</b>`

    const res = await this.telegramClient.sendMessage({
      chatId: targetChat,
      text,
      parseMode: 'HTML'
    })

    return {
      success: true,
      messageId: res.message_id
    }
  }
}
