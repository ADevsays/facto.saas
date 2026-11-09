import type { PaymentProviderService } from '~/modules/add-saas/types'
import { monthlyAmount, providerFailure, toUnix } from './read-provider-utils'
import { convertToUsd } from '~/server/utils/currency'

const PAGE_SIZE = 100
const MAX_ROWS = 20_000
const LIVE_API = 'https://live.dodopayments.com'
const TEST_API = 'https://test.dodopayments.com'

function apiBase(key: string) {
  return /^(dodo_)?test_/i.test(key) ? TEST_API : LIVE_API
}

function majorUnits(amount: unknown, currency: string) {
  const value = Number(amount)
  if (!Number.isFinite(value) || value < 0) throw new Error('Dodo returned an invalid amount')
  const code = currency.toUpperCase()
  const digits = ['BIF', 'CLP', 'DJF', 'GNF', 'JPY', 'KMF', 'KRW', 'PYG', 'RWF', 'UGX', 'VND', 'VUV', 'XAF', 'XOF', 'XPF'].includes(code)
    ? 0
    : ['BHD', 'IQD', 'JOD', 'KWD', 'LYD', 'OMR', 'TND'].includes(code) ? 3 : 2
  return value / 10 ** digits
}

async function fetchAll<T>(resource: string, key: string, filters: Record<string, string> = {}): Promise<T[]> {
  const base = apiBase(key)
  const unique = new Map<string, T>()
  for (let page = 1; page <= Math.ceil(MAX_ROWS / PAGE_SIZE) + 1; page += 1) {
    const query = new URLSearchParams({ ...filters, page_number: String(page), page_size: String(PAGE_SIZE) })
    const response = await $fetch<{ items?: T[] }>(`${base}/${resource}?${query}`, {
      headers: { Authorization: `Bearer ${key}` },
      timeout: 20_000,
    })
    if (!Array.isArray(response?.items)) throw new Error(`Dodo ${resource} returned an incomplete page`)
    const items = response.items
    if (items.length === 0) return [...unique.values()]
    for (const item of items) {
      const row = item as T & Record<string, unknown>
      const id = row.payment_id ?? row.refund_id ?? row.subscription_id
      if (typeof id !== 'string' || !id) throw new Error(`Dodo ${resource} returned a row without an ID`)
      unique.set(id, item)
    }
    if (unique.size > MAX_ROWS) throw new Error(`Dodo ${resource} history exceeded the safety limit`)
    if (items.length < PAGE_SIZE) return [...unique.values()]
  }
  throw new Error(`Dodo ${resource} history exceeded the safety limit`)
}

async function history(key: string) {
  const [payments, refunds, allSubscriptions] = await Promise.all([
    fetchAll<any>('payments', key),
    fetchAll<any>('refunds', key, { status: 'succeeded' }),
    fetchAll<any>('subscriptions', key),
  ])
  const refunded = new Map<string, number>()
  for (const refund of refunds) {
    if (refund.status !== 'succeeded') continue
    const amount = Number(refund.amount)
    if (!Number.isFinite(amount) || amount < 0 || !refund.payment_id) throw new Error('Dodo returned an invalid refund')
    refunded.set(refund.payment_id, (refunded.get(refund.payment_id) || 0) + amount)
  }

  const charges = await Promise.all(payments
    .filter((payment) => payment.status === 'succeeded' && !payment.is_update_payment_method)
    .map(async (payment) => {
      const currency = String(payment.currency || '').toUpperCase()
      if (!currency) throw new Error('Dodo payment is missing its currency')
      const netMinor = Math.max(0, Number(payment.total_amount) - (refunded.get(payment.payment_id) || 0))
      return {
        id: String(payment.payment_id),
        amount: await convertToUsd(majorUnits(netMinor, currency), currency),
        created: toUnix(payment.created_at),
      }
    }))

  const subscriptions = await Promise.all(allSubscriptions.map(async (subscription) => {
    const active = subscription.status === 'active'
    const currency = String(subscription.currency || '').toUpperCase()
    const amount = Number(subscription.recurring_pre_tax_amount)
    const interval = String(subscription.payment_frequency_interval || '')
    const count = Number(subscription.payment_frequency_count || 1)
    let mrr = 0
    if (active && !subscription.on_demand) {
      if (!currency || !Number.isFinite(amount) || amount < 0 || !interval) throw new Error('Dodo active subscription is missing its recurring price data')
      const normalized = monthlyAmount(majorUnits(amount, currency), interval.toLowerCase(), count)
      mrr = await convertToUsd(normalized, currency)
    }
    const canceledAt = active
      ? (subscription.cancel_at_next_billing_date ? toUnix(subscription.next_billing_date) : null)
      : toUnix(subscription.cancelled_at ?? subscription.created_at)
    return { created: toUnix(subscription.created_at), status: subscription.status, canceledAt, mrr }
  }))

  const validCharges = charges.filter((charge) => charge.amount > 0)
  return {
    subscriptions,
    charges: validCharges,
    mrrSnapshot: Math.round(subscriptions.reduce((sum, subscription) => sum + (subscription.status === 'active' ? subscription.mrr : 0), 0)),
    revenueTotal: validCharges.reduce((sum, charge) => sum + charge.amount, 0),
  }
}

function mockHistory() {
  const now = Math.floor(Date.now() / 1000)
  return {
    subscriptions: [{ created: now - 50 * 86_400, status: 'active', canceledAt: null, mrr: 120 }],
    charges: [{ id: 'dodo_demo_001', amount: 120, created: now - 2 * 86_400 }],
    mrrSnapshot: 120,
    revenueTotal: 120,
  }
}

export const dodoService: PaymentProviderService = {
  async validate(key) {
    if (key === 'dodo_test_facto') return { valid: true, mrr: 120, currency: 'USD' }
    try {
      const result = await history(key)
      return { valid: true, mrr: result.mrrSnapshot ?? 0, currency: 'USD' }
    } catch (error) { return providerFailure(error) }
  },
  async getMrr(key) { return this.validate(key) },
  async getHistory(key) { return key === 'dodo_test_facto' ? mockHistory() : history(key) },
}
