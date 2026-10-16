import { computed, type Ref } from 'vue'

export type Metric = 'mrr' | 'revenue'
export type Timeframe = '7d' | '30d' | '60d' | 'all'

export type HistoryData = Record<Timeframe, { at: number; mrr: number; revenue: number }[]>

export function useRevenueChart(
  history: Ref<HistoryData | null | undefined>,
  activeMetric: Ref<Metric>,
  activeTimeframe: Ref<Timeframe>
) {
  const TIMEFRAME_DAYS: Record<Timeframe, number> = { '7d': 7, '30d': 30, '60d': 60, 'all': 365 }

  function getDateFormat(days: number, date: Date) {
    if (days <= 7) return date.toLocaleDateString('en-US', { weekday: 'short' })
    if (days >= 365) return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const chartData = computed(() => {
    if (!history.value) return []

    const timeframe = activeTimeframe.value
    return history.value[timeframe].map(pt => ({
      label: getDateFormat(TIMEFRAME_DAYS[timeframe], new Date(pt.at)),
      value: activeMetric.value === 'mrr' ? pt.mrr : pt.revenue
    }))
  })

  return {
    chartData
  }
}
