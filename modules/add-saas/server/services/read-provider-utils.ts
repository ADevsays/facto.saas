export const MAX_PROVIDER_ROWS = 20_000

export function toUnix(value: unknown): number {
  const n = typeof value === 'number' ? value : Date.parse(String(value ?? '')) / 1000
  if (!Number.isFinite(n) || n <= 0) throw new Error('Invalid provider timestamp')
  return Math.floor(n > 10_000_000_000 ? n / 1000 : n)
}

export async function toUsd(amount: unknown, currency: string, minorUnits = true): Promise<number> {
  const n = Number(amount)
  if (!Number.isFinite(n)) throw new Error('Invalid provider amount')
  const { convertToUsd } = await import('~/server/utils/currency')
  return convertToUsd(minorUnits ? n / 100 : n, currency)
}

export function providerFailure(error: unknown) {
  const status = (error as any)?.response?.status ?? (error as any)?.statusCode
  return { valid: false, mrr: null, currency: 'USD', error: status === 401 || status === 403 ? 'invalid_key' as const : 'api_error' as const }
}

export function monthlyAmount(amount: number, interval: string, count = 1): number {
  if (!Number.isFinite(amount) || !Number.isFinite(count) || count < 1) throw new Error('Invalid recurring amount')
  switch (interval) {
    case 'day': return amount * (365.2425 / 12) / count
    case 'week': return amount * (365.2425 / 7 / 12) / count
    case 'month': return amount / count
    case 'year': return amount / (12 * count)
    default: throw new Error(`Unsupported recurring interval: ${interval}`)
  }
}
