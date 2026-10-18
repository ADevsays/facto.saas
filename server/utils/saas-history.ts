export interface SaasHistoryData {
  subscriptions?: Array<{
    created: number
    status?: string
    canceledAt: number | null
    mrr: number
  }>
  charges?: Array<{
    amount: number
    created: number
  }>
}

export interface SaasHistorySummary {
  mrr: number | null
  revenue: number | null
  formattedRevenue: string | null
}

export type SaasHistoryTimeframe = '7d' | '30d' | '60d' | 'all'

export interface SaasHistoryPoint {
  at: number
  mrr: number
  revenue: number
}

export type SaasHistoryChart = Record<SaasHistoryTimeframe, SaasHistoryPoint[]>

export interface SaasLegacyFinancialSnapshot {
  mrr: number | null
  revenue: number | null
  source?: string
}

export function getLegacyFinancialSnapshot(value: unknown): SaasLegacyFinancialSnapshot | null {
  if (!value || typeof value !== 'object') return null
  const snapshot = (value as Record<string, unknown>).legacySnapshot
  if (!snapshot || typeof snapshot !== 'object') return null
  const raw = snapshot as Record<string, unknown>
  const mrr = raw.mrr === null ? null : Number(raw.mrr)
  const revenue = raw.revenue === null ? null : Number(raw.revenue)
  if (mrr !== null && !Number.isFinite(mrr)) return null
  if (revenue !== null && !Number.isFinite(revenue)) return null
  return { mrr, revenue, source: typeof raw.source === 'string' ? raw.source : undefined }
}

export function normalizeSaasHistory(value: unknown): SaasHistoryData | null {
  if (!value || typeof value !== 'object') return null

  const raw = value as Record<string, unknown>
  const subscriptions = Array.isArray(raw.subscriptions)
    ? raw.subscriptions.flatMap((item) => {
        if (!item || typeof item !== 'object') return []
        const row = item as Record<string, unknown>
        const created = Number(row.created)
        const mrr = Number(row.mrr)
        if (!Number.isFinite(created) || !Number.isFinite(mrr)) return []
        const canceledAt = row.canceledAt === null || row.canceledAt === undefined
          ? null
          : Number(row.canceledAt)
        return [{
          created,
          status: typeof row.status === 'string' ? row.status : undefined,
          canceledAt: Number.isFinite(canceledAt as number) ? canceledAt : null,
          mrr,
        }]
      })
    : []
  const charges = Array.isArray(raw.charges)
    ? raw.charges.flatMap((item) => {
        if (!item || typeof item !== 'object') return []
        const row = item as Record<string, unknown>
        const created = Number(row.created)
        const amount = Number(row.amount)
        if (!Number.isFinite(created) || !Number.isFinite(amount)) return []
        return [{ created, amount }]
      })
    : []

  return subscriptions.length > 0 || charges.length > 0
    ? { subscriptions, charges }
    : null
}

export function hasFinancialHistory(history: SaasHistoryData | null | undefined): boolean {
  return Boolean(
    (Array.isArray(history?.subscriptions) && history.subscriptions.length > 0)
    || (Array.isArray(history?.charges) && history.charges.length > 0),
  )
}

export function formatRevenue(value: number | null): string | null {
  if (value === null) return null
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`.replace('.0', '')
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1).replace('.0', '')}K`
  return `$${Math.round(value)}`
}

export function summarizeSaasHistory(
  history: SaasHistoryData | null | undefined,
  fallbackMrr: number | null,
  nowSec = Math.floor(Date.now() / 1000),
): SaasHistorySummary {
  let mrr = fallbackMrr
  const subscriptions = Array.isArray(history?.subscriptions) ? history.subscriptions : []
  const charges = Array.isArray(history?.charges) ? history.charges : []

  if (subscriptions.length > 0) {
    mrr = Math.round(subscriptions.reduce((sum, subscription) => {
      const active = subscription.created <= nowSec
        && (subscription.canceledAt === null || subscription.canceledAt > nowSec)
      return active ? sum + (Number(subscription.mrr) || 0) : sum
    }, 0))
  }

  const chargedRevenue = Math.round(charges.reduce(
    (sum, charge) => sum + (Number(charge.amount) || 0),
    0,
  ))
  const revenue = chargedRevenue > 0 ? chargedRevenue : null

  return {
    mrr,
    revenue,
    formattedRevenue: formatRevenue(revenue),
  }
}

export function buildSaasHistoryChart(
  history: SaasHistoryData | null | undefined,
  nowMs = Date.now(),
): SaasHistoryChart | null {
  if (!hasFinancialHistory(history)) return null

  const subscriptions = history?.subscriptions || []
  const charges = history?.charges || []
  const oldest = Math.min(nowMs, ...subscriptions.map(item => item.created * 1000), ...charges.map(item => item.created * 1000))
  const allDays = Math.max(365, Math.ceil((nowMs - oldest) / 86_400_000))
  const days: Record<SaasHistoryTimeframe, number> = { '7d': 7, '30d': 30, '60d': 60, all: allDays }

  return Object.fromEntries(Object.entries(days).map(([timeframe, range]) => {
    const stepMs = range * 86_400_000 / 9
    const points = Array.from({ length: 10 }, (_, index) => {
      const at = nowMs - range * 86_400_000 * (1 - index / 9)
      const atSec = Math.floor(at / 1000)
      const fromSec = atSec - Math.floor(stepMs / 1000)
      const mrr = subscriptions.reduce((sum, item) => (
        item.created <= atSec && (item.canceledAt === null || item.canceledAt > atSec) ? sum + item.mrr : sum
      ), 0)
      const revenue = charges.reduce((sum, item) => (
        item.created > fromSec && item.created <= atSec ? sum + item.amount : sum
      ), 0)
      return { at, mrr: Math.round(mrr), revenue: Math.round(revenue) }
    })
    return [timeframe, points]
  })) as SaasHistoryChart
}
