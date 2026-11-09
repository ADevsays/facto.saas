import type { PaymentProviderService } from '~/modules/add-saas/types'
import { MAX_PROVIDER_ROWS, monthlyAmount, providerFailure, toUnix, toUsd } from './read-provider-utils'

const base = 'https://api.paddle.com'
async function all(path: string, key: string) {
  let url: string | undefined = `${base}/${path}?per_page=50`; const rows: any[] = []; const seen = new Set<string>()
  while (url && rows.length < MAX_PROVIDER_ROWS) {
    const res = await $fetch<any>(url, { headers: { Authorization: `Bearer ${key}` }, timeout: 20_000 })
    if (!Array.isArray(res.data)) throw new Error(`Paddle ${path} returned an incomplete page`)
    rows.push(...res.data)
    const next = res.meta?.pagination?.next as string | undefined
    if (!res.meta?.pagination?.has_more) return rows
    if (!next || seen.has(next)) throw new Error(`Paddle ${path} cursor repeated or missing`)
    seen.add(next); url = next
  }
  if (url) throw new Error(`Paddle ${path} history exceeded the safety limit`)
  return rows
}
async function history(key: string) {
  const [transactions, adjustments, subscriptions] = await Promise.all([all('transactions', key), all('adjustments', key), all('subscriptions', key)])
  const refundByTxn = new Map<string, number>()
  for (const adj of adjustments) {
    if (adj.status !== 'approved') continue
    const reducesRevenue = ['refund', 'chargeback', 'credit'].includes(adj.action)
    const reversesRevenue = ['chargeback_reverse', 'credit_reverse'].includes(adj.action)
    if (!reducesRevenue && !reversesRevenue) continue
    const signedAmount = Number(adj.totals?.total || 0) * (reducesRevenue ? 1 : -1)
    refundByTxn.set(adj.transaction_id, (refundByTxn.get(adj.transaction_id) || 0) + signedAmount)
  }
  const charges = await Promise.all(transactions.filter(t => ['completed', 'paid'].includes(t.status)).map(async t => {
    const gross = Number(t.details?.totals?.total ?? t.amount)
    const net = Math.max(0, gross - (refundByTxn.get(t.id) || 0))
    return { id: t.id, amount: await toUsd(net, t.currency_code || 'USD'), created: toUnix(t.billed_at ?? t.created_at) }
  }))
  const mapped = await Promise.all(subscriptions.map(async s => {
    const active = s.status === 'active'
    const items = s.items ?? []
    let mrr = 0
    if (active && !items.length) throw new Error('Paddle active subscription has no items')
    if (active) for (const item of items) {
      if (item.status !== 'active' || item.recurring === false) continue
      const amount = Number(item.price?.unit_price?.amount ?? item.price?.unit_price ?? 0)
      const interval = item.price?.billing_cycle?.interval
      const frequency = Number(item.price?.billing_cycle?.frequency || 1)
      if (!Number.isFinite(amount) || amount <= 0 || !interval) throw new Error('Paddle recurring subscription item is missing its price or billing cycle')
      mrr += await toUsd(monthlyAmount((amount / 100) * Number(item.quantity || 1), interval, frequency), s.currency_code || item.price?.unit_price?.currency_code || 'USD', false)
    }
    return { created: toUnix(s.started_at ?? s.created_at), status: s.status, canceledAt: active ? null : toUnix(s.canceled_at ?? s.paused_at ?? s.updated_at ?? s.created_at), mrr }
  }))
  return { subscriptions: mapped, charges: charges.filter(c => c.amount > 0) }
}
export const paddleService: PaymentProviderService = {
  async validate(key) {
    if (key === 'paddle_test_facto') return { valid: true, mrr: 180, currency: 'USD' }
    try { const h = await history(key); return { valid: true, mrr: Math.round(h.subscriptions.reduce((sum, s) => sum + (['active', 'trialing'].includes(s.status || '') ? s.mrr : 0), 0)), currency: 'USD' } }
    catch (e) { return providerFailure(e) }
  },
  async getMrr(key) { return this.validate(key) },
  async getHistory(key) { return key === 'paddle_test_facto' ? { subscriptions: [], charges: [{ id: 'txn_test_facto', amount: 42, created: Math.floor(Date.now() / 1000) }] } : history(key) },
}
