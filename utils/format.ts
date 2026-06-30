export function formatMrrValue(mrr: number | null): string {
  if (mrr === null) return '—'
  if (mrr >= 1000000) return `$${(mrr / 1000000).toFixed(1)}M`.replace('.0', '')
  if (mrr >= 1000) return `$${(mrr / 1000).toFixed(1)}K`.replace('.0', '')
  return `$${mrr}`
}

export function formatRevenueValue(mrr: number | null): string {
  if (mrr === null) return '—'
  const annual = mrr * 12
  if (annual >= 1000000) return `$${(annual / 1000000).toFixed(1)}M`.replace('.0', '')
  if (annual >= 1000) return `$${(annual / 1000).toFixed(1)}K`.replace('.0', '')
  return `$${annual}`
}
