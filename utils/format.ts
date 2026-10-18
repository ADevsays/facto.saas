export function formatMrrValue(mrr: number | null): string | null {
  if (mrr === null) return null
  if (mrr >= 1000000) return `$${(mrr / 1000000).toFixed(1)}M`.replace('.0', '')
  if (mrr >= 1000) return `$${(mrr / 1000).toFixed(1)}K`.replace('.0', '')
  return `$${mrr}`
}

export function formatRevenueValue(mrr: number | null): string | null {
  if (mrr === null) return null
  const annual = mrr * 12
  if (annual >= 1000000) return `$${(annual / 1000000).toFixed(1)}M`.replace('.0', '')
  if (annual >= 1000) return `$${(annual / 1000).toFixed(1)}K`.replace('.0', '')
  return `$${annual}`
}
