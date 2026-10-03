import { supabase } from '~/server/lib/supabase'
import { getDailyViewsMap, getTodayDateString } from '~/server/lib/dailyViews'

export interface VisitsDataSource {
  getSourceName(): string
  isAvailable(): Promise<boolean>
  getTodayVisits(dateStr: string): Promise<number>
  getVisitsHistory(days: number): Promise<Record<string, number>>
  getSevenDayAverage(history: Record<string, number>): number
}

/**
 * Default Visits Provider aggregating anonymous platform interaction counts.
 */
export class PlatformVisitsProvider implements VisitsDataSource {
  getSourceName(): string {
    return 'Facto Database Aggregations'
  }

  async isAvailable(): Promise<boolean> {
    try {
      const { count, error } = await supabase
        .from('saas_entries')
        .select('*', { count: 'exact', head: true })
      return !error && count !== null
    } catch {
      return false
    }
  }

  /**
   * Returns current aggregate platform views for the specified date.
   */
  async getTodayVisits(dateStr?: string): Promise<number> {
    try {
      const targetDate = dateStr || getTodayDateString()
      const viewsMap = await getDailyViewsMap()
      if (viewsMap.has(targetDate)) {
        return viewsMap.get(targetDate) || 0
      }

      const { data, error } = await supabase
        .from('saas_entries')
        .select('views')

      if (error || !data) return 0
      return data.reduce((sum, item) => sum + (Number(item.views) || 0), 0)
    } catch {
      return 0
    }
  }

  async getVisitsHistory(_days = 7): Promise<Record<string, number>> {
    try {
      const viewsMap = await getDailyViewsMap()
      const history: Record<string, number> = {}
      for (const [date, views] of viewsMap.entries()) {
        history[date] = views
      }
      return history
    } catch {
      return {}
    }
  }

  getSevenDayAverage(history: Record<string, number>): number {
    const values = Object.values(history).filter(v => typeof v === 'number' && v > 0)
    if (values.length === 0) return 0
    const sum = values.reduce((a, b) => a + b, 0)
    return Math.round(sum / values.length)
  }
}
