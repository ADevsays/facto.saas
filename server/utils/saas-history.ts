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
  formattedRevenue: string
}

export function formatRevenue(value: number | null): string {
  if (value === null) return '—'
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`.replace('.0', '')
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`
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
  const revenue = chargedRevenue > 0
    ? chargedRevenue
    : mrr === null ? null : mrr * 12

  return {
    mrr,
    revenue,
    formattedRevenue: formatRevenue(revenue),
  }
}
