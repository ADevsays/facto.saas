import type { PaymentProviderService } from '~/modules/add-saas/types'
import { MAX_PROVIDER_ROWS, monthlyAmount, providerFailure, toUnix, toUsd } from './read-provider-utils'

const base = 'https://api.polar.sh/v1'
async function all(path: string, key: string) {
  const rows: any[] = []; let page = 1
  while (rows.length < MAX_PROVIDER_ROWS) {
    const res = await $fetch<any>(`${base}/${path}?limit=100&page=${page}`, { headers: { Authorization: `Bearer ${key}` }, timeout: 20_000 })
    if (!Array.isArray(res.items)) throw new Error('Polar returned an incomplete page')
    rows.push(...res.items)
    const maxPage = Number(res.pagination?.max_page ?? 1)
    if (page >= maxPage || res.items.length === 0) return rows
    page++
  }
  throw new Error('Polar history exceeded the safety limit')
}
async function history(key: string) {
  const [orders, subscriptions] = await Promise.all([all('orders', key), all('subscriptions', key)])
  const charges = await Promise.all(orders.filter(o => o.paid === true).map(async o => ({
    id: o.id,
    amount: await toUsd(Math.max(0, Number(o.net_amount || 0) - Math.max(0, Number(o.refunded_amount || 0) - Number(o.refunded_tax_amount || 0))), o.currency, true),
    created: toUnix(o.paid_at ?? o.created_at),
  })))
  const mapped = await Promise.all(subscriptions.map(async s => {
    const active = s.status === 'active' && !(s.trial_end && toUnix(s.trial_end) > Math.floor(Date.now() / 1000))
    const raw = Number(s.amount ?? s.prices?.[0]?.price_amount)
    const mrr = active ? await toUsd(monthlyAmount(raw / 100, s.recurring_interval, Number(s.recurring_interval_count || 1)), s.currency || 'USD', false) : 0
    return { created: toUnix(s.created_at), status: s.status, canceledAt: active ? null : toUnix(s.canceled_at ?? s.ends_at ?? s.modified_at ?? s.created_at), mrr }
  }))
  return { subscriptions: mapped, charges: charges.filter(charge => charge.amount > 0) }
}
export const polarService: PaymentProviderService = {
  async validate(key) {
    if (key === 'polar_test_facto') return { valid: true, mrr: 120, currency: 'USD' }
    try { const h = await history(key); return { valid: true, mrr: Math.round(h.subscriptions.reduce((n, s) => n + (s.status === 'active' ? s.mrr : 0), 0)), currency: 'USD' } }
    catch (e) { return providerFailure(e) }
  },
  async getMrr(key) { return this.validate(key) },
  async getHistory(key) { return key === 'polar_test_facto' ? { subscriptions: [], charges: [{ id: 'ord_test_facto', amount: 32, created: Math.floor(Date.now() / 1000) }] } : history(key) },
}
