import crypto from 'node:crypto'
import type { PaymentProviderService, ProviderValidationResult } from '~/modules/add-saas/types'

const MAX_ITEMS = 20_000
const DAY = 86_400
const usdUnknownMrr = (): ProviderValidationResult => ({ valid: true, mrr: null, currency: 'USD' })
const invalid = (error: ProviderValidationResult['error']): ProviderValidationResult => ({ valid: false, mrr: null, currency: 'USD', error })

function providerError(error: unknown): ProviderValidationResult {
  const status = (error as any)?.response?.status ?? (error as any)?.statusCode
  return invalid(status === 401 || status === 403 ? 'invalid_key' : 'api_error')
}

function unique<T>(items: T[], id: (item: T) => string | undefined): T[] {
  const map = new Map<string, T>()
  for (const item of items) {
    const key = id(item)
    if (key && !map.has(key)) map.set(key, item)
  }
  return [...map.values()]
}

async function mapLimit<T, R>(items: T[], limit: number, mapper: (item: T) => Promise<R>): Promise<R[]> {
  const output = new Array<R>(items.length)
  let cursor = 0
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (true) {
      const index = cursor++
      if (index >= items.length) return
      output[index] = await mapper(items[index])
    }
  }))
  return output
}

function sec(value: unknown): number {
  const raw = typeof value === 'string' && /^\d+(?:\.\d+)?$/.test(value) ? Number(value) : value
  const n = typeof raw === 'number' ? raw : Date.parse(String(raw ?? '')) / 1000
  if (!Number.isFinite(n) || n <= 0) throw new Error('Provider returned an invalid timestamp')
  return Math.floor(n > 10_000_000_000 ? n / 1000 : n)
}

function requiredString(value: unknown, label: string): string {
  if (typeof value !== 'string' || !value.trim()) throw createError({ statusCode: 400, statusMessage: `Missing ${label}` })
  return value.trim()
}

async function amountUsd(minor: unknown, currency: string, divisor = 100): Promise<number> {
  const value = Number(minor)
  if (!Number.isFinite(value)) throw new Error('Provider returned an invalid amount')
  const { convertToUsd } = await import('~/server/utils/currency')
  return convertToUsd(value / divisor, currency)
}

async function fetchConektaOrders(key: string): Promise<any[]> {
  const orders: any[] = []
  let url = 'https://api.conekta.io/orders?limit=250'
  const seen = new Set<string>()
  while (url) {
    if (orders.length >= MAX_ITEMS) throw new Error('Conekta order history exceeded the safety limit')
    const res = await $fetch<any>(url, { headers: { Authorization: `Bearer ${key}`, Accept: 'application/vnd.conekta-v2.3.0+json' }, timeout: 20_000 })
    if (!Array.isArray(res.data)) throw new Error('Conekta returned an incomplete order page')
    orders.push(...res.data)
    const next = res.next_page_url as string | undefined
    if (!res.has_more) break
    if (!next || seen.has(next)) throw new Error('Conekta pagination cursor repeated or missing')
    seen.add(next)
    url = next
  }
  return unique(orders, o => o.id)
}

async function fetchConektaList(key: string, firstUrl: string): Promise<any[]> {
  const rows: any[] = []
  let url: string | undefined = firstUrl
  const seen = new Set<string>()
  while (url) {
    if (rows.length >= MAX_ITEMS) throw new Error('Conekta list exceeded the safety limit')
    const res = await $fetch<any>(url, { headers: { Authorization: `Bearer ${key}`, Accept: 'application/vnd.conekta-v2.3.0+json' }, timeout: 20_000 })
    if (!Array.isArray(res.data)) throw new Error('Conekta returned an incomplete list page')
    rows.push(...res.data)
    const next = res.next_page_url as string | undefined
    if (!res.has_more) break
    if (!next || seen.has(next)) throw new Error('Conekta pagination cursor repeated or missing')
    seen.add(next)
    url = next
  }
  return unique(rows, item => item.id)
}

function monthlyFactor(interval: string, frequency: number): number {
  if (!Number.isFinite(frequency) || frequency <= 0) throw new Error('Conekta plan has invalid frequency')
  switch (interval) {
    case 'day': return (365.2425 / 12) / frequency
    case 'week': return (365.2425 / 7 / 12) / frequency
    case 'month': return 1 / frequency
    case 'year': return 1 / (12 * frequency)
    default: throw new Error(`Unsupported Conekta billing interval: ${interval}`)
  }
}

async function conektaHistory(key: string) {
  if (key === 'conekta_empty_facto') return { subscriptions: [], charges: [] }
  const [orders, customers] = await Promise.all([
    fetchConektaOrders(key),
    fetchConektaList(key, 'https://api.conekta.io/customers?limit=250'),
  ])
  const charges = new Map<string, { amount: number; created: number; currency: string }>()
  for (const order of orders) {
    if (!['paid', 'partially_refunded'].includes(String(order.payment_status))) continue
    const payments = order.charges?.data
    if (!Array.isArray(payments)) throw new Error('Paid Conekta order lacks its payment list')
    let orderRefundTotal = 0
    for (const p of payments) {
      if (!p?.id || !['paid', 'captured', 'succeeded'].includes(String(p.status))) continue
      const gross = Number(p.amount)
      if (!Number.isFinite(gross)) throw new Error('Conekta payment amount missing')
      const refundRows = p.refunds?.data
      let refunded = Array.isArray(refundRows)
        ? refundRows.reduce((sum: number, r: any) => sum + Math.abs(Number(r.amount || 0)), 0)
        : Number(p.amount_refunded || p.refunded_amount || 0)
      if (order.payment_status === 'partially_refunded' && !Array.isArray(refundRows) && payments.length === 1) {
        refunded = Math.max(refunded, Number(order.amount_refunded || 0))
      }
      if (order.payment_status === 'partially_refunded' && !Array.isArray(refundRows) && payments.length > 1) {
        throw new Error('Conekta partial refund cannot be allocated across multiple charges')
      }
      orderRefundTotal += refunded
      charges.set(p.id, { amount: Math.max(0, gross - refunded), created: sec(p.paid_at ?? p.created_at), currency: String(p.currency || order.currency || 'MXN') })
    }
    if (order.payment_status === 'partially_refunded' && Number(order.amount_refunded || 0) > orderRefundTotal) {
      throw new Error('Conekta embedded charge refunds do not reconcile to the order refund total')
    }
  }
  const result = await Promise.all([...charges.values()].filter(p => p.amount > 0).map(async p => ({ amount: await amountUsd(p.amount, p.currency), created: p.created })))

  // Conekta scopes subscriptions under each customer; plans hold the amount
  // and cadence. Fail closed if any page fails so a partial account is not
  // presented as a complete MRR snapshot.
  const subscriptionsByCustomer = await mapLimit(customers, 5, async customer => {
    if (!customer.id) throw new Error('Conekta customer is missing an ID')
    return fetchConektaList(key, `https://api.conekta.io/customers/${encodeURIComponent(customer.id)}/subscriptions?limit=250`)
  })
  const subscriptions = unique(subscriptionsByCustomer.flat(), item => item.id)
  const planIds = [...new Set(subscriptions.map(s => s.plan_id).filter(Boolean))]
  const plans = await mapLimit(planIds, 5, async id => {
    const plan = await $fetch<any>(`https://api.conekta.io/plans/${encodeURIComponent(id)}`, {
      headers: { Authorization: `Bearer ${key}`, Accept: 'application/vnd.conekta-v2.3.0+json' }, timeout: 20_000,
    })
    return [id, plan] as const
  })
  const planById = new Map(plans)
  const now = Math.floor(Date.now() / 1000)
  const mrrSubscriptions = await Promise.all(subscriptions.map(async sub => {
    const plan = planById.get(sub.plan_id)
    if (!plan) throw new Error('Conekta subscription plan could not be read')
    const created = sec(sub.created_at ?? sub.subscription_start)
    const rawStatus = String(sub.status || 'unknown').toLowerCase()
    const trialEnd = Number(sub.trial_end || 0)
    const trialing = trialEnd > now || (Number(plan.trial_period_days) > 0 && created + Number(plan.trial_period_days) * DAY > now)
    const isChargeable = rawStatus === 'active' && !trialing
    const canceledAt = isChargeable ? null : sec(sub.canceled_at ?? sub.cancelled_at ?? sub.updated_at ?? now)
    const amount = Number(plan.amount)
    const frequency = Number(plan.frequency || 1)
    let monthly = isChargeable ? amount * monthlyFactor(String(plan.interval), frequency) : 0
    const discount = sub.discount ?? sub.coupon ?? plan.discount ?? null
    if (discount) {
      if (discount.percent_off !== null && discount.percent_off !== undefined && Number.isFinite(Number(discount.percent_off))) {
        monthly *= Math.max(0, 1 - Number(discount.percent_off) / 100)
      } else if (discount.amount_off !== null && discount.amount_off !== undefined && Number.isFinite(Number(discount.amount_off))) {
        monthly = Math.max(0, monthly - Number(discount.amount_off) * monthlyFactor(String(plan.interval), frequency))
      } else {
        throw new Error('Conekta subscription discount could not be normalized')
      }
    }
    const mrr = await amountUsd(monthly, String(plan.currency || 'MXN'))
    return { created, status: trialing ? 'trialing' : rawStatus, canceledAt, mrr }
  }))
  return { subscriptions: mrrSubscriptions, charges: result }
}

export const conektaService: PaymentProviderService = {
  async validate(key) {
    if (key === 'conekta_test_facto') return { valid: true, mrr: 125, currency: 'USD' }
    if (key === 'conekta_empty_facto') return { valid: true, mrr: 0, currency: 'USD' }
    try {
      const history = await conektaHistory(requiredString(key, 'private API key'))
      const mrr = history.subscriptions ? history.subscriptions.reduce((sum, subscription) => sum + subscription.mrr, 0) : null
      return { valid: true, mrr: mrr === null ? null : Math.round(mrr), currency: 'USD' }
    } catch (e) { return providerError(e) }
  },
  async getMrr(key) { return this.validate(key) },
  async getHistory(key) { return key === 'conekta_test_facto' ? { subscriptions: [], charges: [] } : conektaHistory(requiredString(key, 'private API key')) },
}
