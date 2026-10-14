import { computed, type Ref } from 'vue'

export type Metric = 'mrr' | 'revenue'
export type Timeframe = '7d' | '30d' | '60d' | 'all'

export interface HistoryData {
  subscriptions: { created: number; status: string; canceledAt: number | null; mrr: number }[]
  charges: { amount: number; created: number }[]
}

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

  function getRealSeries(days: number, historyData: HistoryData) {
    const subscriptions = Array.isArray(historyData.subscriptions) ? historyData.subscriptions : []
    const charges = Array.isArray(historyData.charges) ? historyData.charges : []
    const steps = 10
    const series = []
    
    const nowMs = Date.now()
    const daysInMs = days * 24 * 60 * 60 * 1000
    const stepMs = daysInMs / (steps - 1 || 1)

    for (let idx = 0; idx < steps; idx++) {
      const progress = idx / (steps - 1 || 1)
      const timeOffset = daysInMs * (1 - progress)
      const targetDate = new Date(nowMs - timeOffset)
      const targetTimeSec = Math.floor(targetDate.getTime() / 1000)

      let mrrValue = 0
      let revValue = 0

      for (const s of subscriptions) {
        if (s.created <= targetTimeSec) {
          const isCanceledBefore = s.canceledAt !== null && s.canceledAt <= targetTimeSec
          if (!isCanceledBefore) {
            mrrValue += s.mrr
          }
        }
      }

      const prevTimeSec = targetTimeSec - Math.floor(stepMs / 1000)
      for (const c of charges) {
        if (c.created > prevTimeSec && c.created <= targetTimeSec) {
          revValue += c.amount
        }
      }

      series.push({
        label: getDateFormat(days, targetDate),
        mrr: Math.round(mrrValue),
        revenue: Math.round(revValue)
      })
    }

    return series
  }

  const chartData = computed(() => {
    let days = TIMEFRAME_DAYS[activeTimeframe.value]

    if (activeTimeframe.value === 'all' && history.value) {
      let oldestMs = Date.now()
      if (history.value.charges?.length) {
        oldestMs = Math.min(oldestMs, ...history.value.charges.map(c => c.created * 1000))
      }
      if (history.value.subscriptions?.length) {
        oldestMs = Math.min(oldestMs, ...history.value.subscriptions.map(s => s.created * 1000))
      }
      const daysSinceOldest = Math.ceil((Date.now() - oldestMs) / (24 * 60 * 60 * 1000))
      days = Math.max(365, daysSinceOldest)
    }

    // Never invent a historical curve when provider data is unavailable.
    if (!history.value) return []

    const series = getRealSeries(days, history.value)

    return series.map(pt => ({
      label: pt.label,
      value: activeMetric.value === 'mrr' ? pt.mrr : pt.revenue
    }))
  })

  return {
    chartData
  }
}
