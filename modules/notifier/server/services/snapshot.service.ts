import { supabase } from '~/server/lib/supabase'
import type { StorageProvider } from '../db/storage.interface'
import type { VisitsDataSource } from './visits.provider'
import type { StartupSnapshotItem, SystemSnapshotState } from '../../types'

export class SnapshotService {
  private storage: StorageProvider
  private visitsProvider: VisitsDataSource

  constructor(storage: StorageProvider, visitsProvider: VisitsDataSource) {
    this.storage = storage
    this.visitsProvider = visitsProvider
  }

  /**
   * Captures the full current state of the platform from the database.
   */
  async captureCurrentState(dateStr = new Date().toISOString().substring(0, 10)): Promise<SystemSnapshotState> {
    // 1. Fetch published startups with metrics and joins
    const { data: saasRows, error } = await supabase
      .from('saas_entries')
      .select(
        'id, name, slug, logo_url, website_url, startup_type, founder_name, mrr, currency, views, published_at, is_incognito,' +
        'saas_metrics_cache ( history_cache ),' +
        'countries!saas_countries ( id, name, slug, flag, iso_code ),' +
        'categories!saas_categories ( name, slug )'
      )
      .eq('status', 'published')
      .order('mrr', { ascending: false, nullsFirst: false })

    if (error) {
      throw new Error(`Failed to query startups for snapshot: ${error.message}`)
    }

    const startups: StartupSnapshotItem[] = []
    const countriesMap: Record<string, {
      totalRevenue: number
      startupsCount: number
      maxRevenueRecord: number
      maxStartupsRecord: number
      name?: string
      flag?: string
    }> = {}

    let globalRevenue = 0
    let rank = 1

    for (const row of ((saasRows as any[]) || [])) {
      const isIncognito = Boolean(row.is_incognito)
      const mrrVal = row.mrr !== null && row.mrr !== undefined ? Number(row.mrr) : null

      const cacheData = (row as any).saas_metrics_cache
      const cacheObj = Array.isArray(cacheData) ? cacheData[0] : cacheData
      const history = cacheObj?.history_cache

      let chargesCount = 0
      let subscriptionsCount = 0
      let realRevenue = 0

      if (history) {
        chargesCount = history.charges?.length || 0
        subscriptionsCount = history.subscriptions?.length || 0
        if (chargesCount > 0) {
          realRevenue = history.charges.reduce((sum: number, c: any) => sum + (Number(c.amount) || 0), 0)
        }
      }

      let numericRevenue: number | null = null
      if (realRevenue > 0) {
        numericRevenue = realRevenue
      } else if (mrrVal !== null && mrrVal > 0) {
        numericRevenue = mrrVal * 12
      } else if (mrrVal === 0) {
        numericRevenue = 0
      }

      if (!isIncognito && numericRevenue !== null) {
        globalRevenue += numericRevenue
      }

      const countries = (row.saas_countries as any[]) || (row.countries as any[]) || []
      const country = countries[0]
      const categories = (row.saas_categories as any[]) || (row.categories as any[]) || []
      const category = categories[0]

      if (country && country.slug && country.slug !== 'global') {
        if (!countriesMap[country.slug]) {
          countriesMap[country.slug] = {
            totalRevenue: 0,
            startupsCount: 0,
            maxRevenueRecord: 0,
            maxStartupsRecord: 0,
            name: country.name,
            flag: country.flag
          }
        }
        if (!isIncognito && numericRevenue !== null) {
          countriesMap[country.slug].totalRevenue += numericRevenue
        }
        countriesMap[country.slug].startupsCount += 1
      }

      startups.push({
        id: row.id,
        name: isIncognito ? '— Anónimo —' : (row.name || 'Startup'),
        slug: row.slug || row.id,
        category: category?.name || 'Software',
        countrySlug: country?.slug,
        countryName: country?.name,
        countryFlag: country?.flag,
        mrr: isIncognito ? null : mrrVal,
        revenue: isIncognito ? null : numericRevenue,
        views: Number(row.views) || 0,
        publishedAt: row.published_at || new Date().toISOString(),
        isIncognito,
        rank: rank++,
        hasVerifiedHistory: chargesCount > 0 || subscriptionsCount > 0,
        chargesCount,
        subscriptionsCount,
        description: (row as any).startup_type || (row as any).value_proposition || null
      })
    }

    // 2. Fetch platform visits
    const todayVisits = await this.visitsProvider.getTodayVisits(dateStr)

    // Load previous snapshot to inherit peak record values and historical records
    const previousSnapshotDoc = await this.storage.getLatestSnapshot('milestone')
    const previousState = previousSnapshotDoc?.state

    const visitsHistory: Record<string, number> = { ...(previousState?.visits?.history || {}) }
    if (todayVisits > 0) {
      visitsHistory[dateStr] = todayVisits
    }

    const previousMaxVisits = previousState?.visits?.maxDailyRecord || 0
    const maxDailyRecord = Math.max(todayVisits, previousMaxVisits)

    // Preserve country records
    for (const [slug, item] of Object.entries(countriesMap)) {
      const prevC = previousState?.countries?.[slug]
      item.maxRevenueRecord = Math.max(item.totalRevenue, prevC?.maxRevenueRecord || prevC?.totalRevenue || 0)
      item.maxStartupsRecord = Math.max(item.startupsCount, prevC?.maxStartupsRecord || prevC?.startupsCount || 0)
    }

    return {
      timestamp: new Date().toISOString(),
      date: dateStr,
      ranking: startups,
      countries: countriesMap,
      visits: {
        today: todayVisits,
        history: visitsHistory,
        maxDailyRecord
      },
      global: {
        totalRevenue: globalRevenue,
        totalStartups: startups.length
      },
      sentOpportunities: { ...(previousState?.sentOpportunities || {}) }
    }
  }

  async getLatestSnapshot(type = 'milestone'): Promise<SystemSnapshotState | null> {
    const doc = await this.storage.getLatestSnapshot(type)
    return doc?.state || null
  }

  async saveSnapshot(state: SystemSnapshotState, type = 'milestone'): Promise<void> {
    await this.storage.saveSnapshot(state, type)
  }
}
