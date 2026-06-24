import { computed, type Ref } from 'vue'

export type Metric = 'mrr' | 'revenue'
export type Timeframe = '7d' | '30d' | '60d' | 'all'

export interface HistoryData {
  subscriptions: { created: number; status: string; canceledAt: number | null; mrr: number }[]
  charges: { amount: number; created: number }[]
}

export function useRevenueChart(
  history: Ref<HistoryData | null | undefined>,
  baseMrr: Ref<number>,
  activeMetric: Ref<Metric>,
  activeTimeframe: Ref<Timeframe>
) {
  const TIMEFRAME_DAYS: Record<Timeframe, number> = { '7d': 7, '30d': 30, '60d': 60, 'all': 365 }

  function getDateFormat(days: number, date: Date) {
    if (days <= 7) return date.toLocaleDateString('en-US', { weekday: 'short' })
    if (days >= 365) return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  function generateSeries(days: number, mrr: number) {
    const steps = Math.min(Math.max(days <= 7 ? days : Math.ceil(days / 7), 5), 12)
    const stepMs = (days * 24 * 60 * 60 * 1000) / (steps - 1 || 1)
    const daysPerStep = stepMs / (24 * 60 * 60 * 1000)

    return Array.from({ length: steps }, (_, idx) => {
      const dayOffset = Math.round(((steps - 1 - idx) / (steps - 1 || 1)) * days)
      const targetDate = new Date()
      targetDate.setDate(targetDate.getDate() - dayOffset)

      const progress = idx / (steps - 1 || 1)
      const factor = 0.75 + progress * 0.22 + Math.sin(idx) * 0.03
      
      const currentMrr = Math.round(mrr * factor)
      // Coherecy Fix: simulate revenue based on bucket size rather than annualized
      const bucketRevenue = Math.round((currentMrr / 30) * daysPerStep * 0.95)

      return {
        label: getDateFormat(days, targetDate),
        mrr: currentMrr,
        revenue: bucketRevenue
      }
    })
  }

  function getRealSeries(days: number, historyData: HistoryData) {
    const { subscriptions, charges } = historyData
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

    const series = history.value
      ? getRealSeries(days, history.value)
      : generateSeries(days, baseMrr.value)

    return series.map(pt => ({
      label: pt.label,
      value: activeMetric.value === 'mrr' ? pt.mrr : pt.revenue
    }))
  })

  return {
    chartData
  }
}
