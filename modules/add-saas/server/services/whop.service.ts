import type { PaymentProviderService, ProviderValidationResult } from '~/modules/add-saas/types'

const WHOP_API_BASE = 'https://api.whop.com/api/v1'

interface WhopPlan {
  id: string
  renewal_price: number
  billing_period: number
  currency: string
  plan_type: 'renewal' | 'one_time'
}

interface WhopMembership {
  id: string
  status: string
  created_at: string
  canceled_at: string | null
  currency: string | null
  plan: { id: string }
}

interface WhopPayment {
  id: string
  total: number
  usd_total?: number
  created_at: string
  substatus: string
}

function calculateMembershipMrr(sub: WhopMembership, plansMap: Map<string, WhopPlan>): number {
  const plan = plansMap.get(sub.plan.id)
  if (!plan || plan.plan_type !== 'renewal' || !plan.renewal_price) return 0
  
  const price = plan.renewal_price
  const period = plan.billing_period || 30
  
  return price * (30 / period)
}

function parseWhopKey(rawKey: string): { companyId: string, apiKey: string } | null {
  const [companyId, ...keyParts] = rawKey.split(':')
  const apiKey = keyParts.join(':')

  if (!companyId || !companyId.startsWith('biz_') || !apiKey) {
    return null
  }
  
  return { companyId, apiKey }
}

function getMockMrr(): ProviderValidationResult {
  return { valid: true, mrr: 5400, currency: 'USD' }
}

function getMockHistory(): any {
  const nowSec = Math.floor(Date.now() / 1000)
  const daySec = 24 * 60 * 60

  return {
    subscriptions: [
      { created: nowSec - 45 * daySec, status: 'active', canceledAt: null, mrr: 1500 },
      { created: nowSec - 30 * daySec, status: 'active', canceledAt: null, mrr: 2000 },
      { created: nowSec - 20 * daySec, status: 'canceled', canceledAt: nowSec - 5 * daySec, mrr: 800 },
      { created: nowSec - 10 * daySec, status: 'active', canceledAt: null, mrr: 1900 }
    ],
    charges: [
      { amount: 1500, created: nowSec - 40 * daySec },
      { amount: 2000, created: nowSec - 28 * daySec },
      { amount: 800, created: nowSec - 18 * daySec },
      { amount: 1500, created: nowSec - 10 * daySec },
      { amount: 1900, created: nowSec - 8 * daySec },
      { amount: 2000, created: nowSec - 2 * daySec }
    ]
  }
}

async function fetchAll<T extends { id: string }>(baseUrl: string, headers: Record<string, string>): Promise<T[]> {
  const allMap = new Map<string, T>()
  let pagesFetched = 0
  let nextCursor: string | null = null

  while (pagesFetched < 20) { // Up to 2000 records
    let url = baseUrl
    const sep = baseUrl.includes('?') ? '&' : '?'
    
    if (nextCursor) {
      url += `${sep}page=${pagesFetched + 1}&after=${nextCursor}&cursor=${nextCursor}`
    } else {
      url += `${sep}page=${pagesFetched + 1}`
    }

    const res = await $fetch<any>(url, { headers }).catch(() => null)
    if (!res || !res.data || !Array.isArray(res.data) || res.data.length === 0) break

    let newItemsAdded = 0
    for (const item of res.data) {
      if (item.id && !allMap.has(item.id)) {
        allMap.set(item.id, item)
        newItemsAdded++
      }
    }

    // Stop if API returned identical data (ignored pagination) or returned less than limit
    if (newItemsAdded === 0 || res.data.length < 100) break

    // Attempt to extract cursor for next page if Whop uses cursor-based pagination
    if (res.pagination?.next_cursor) nextCursor = res.pagination.next_cursor
    else if (res.page_info?.end_cursor) nextCursor = res.page_info.end_cursor
    else nextCursor = null

    pagesFetched++
  }
  return Array.from(allMap.values())
}

async function fetchWhopPlans(companyId: string, headers: Record<string, string>): Promise<Map<string, WhopPlan>> {
  console.log('[Whop API] Fetching plans for company:', companyId)
  const data = await fetchAll<WhopPlan>(`${WHOP_API_BASE}/plans?limit=100&company_id=${companyId}`, headers)
  console.log('[Whop API] Plans fetch success, count:', data.length)
  
  const plansMap = new Map<string, WhopPlan>()
  data.forEach(p => plansMap.set(p.id, p))
  return plansMap
}

async function fetchWhopMemberships(companyId: string, headers: Record<string, string>): Promise<WhopMembership[]> {
  console.log('[Whop API] Fetching memberships for company:', companyId)
  const data = await fetchAll<WhopMembership>(`${WHOP_API_BASE}/memberships?limit=100&company_id=${companyId}`, headers)
  console.log('[Whop API] Memberships fetch success, count:', data.length)
  return data
}

async function fetchWhopPayments(companyId: string, headers: Record<string, string>): Promise<WhopPayment[]> {
  try {
    return await fetchAll<WhopPayment>(`${WHOP_API_BASE}/payments?limit=100&company_id=${companyId}`, headers)
  } catch (e: any) {
    console.warn('[Whop API Warning] Failed to fetch payments, ignoring charges history.', e?.message || e)
    return []
  }
}

export const whopService: PaymentProviderService = {
  async validate(rawKey: string): Promise<ProviderValidationResult> {
    return this.getMrr(rawKey)
  },

  async getMrr(rawKey: string): Promise<ProviderValidationResult> {
    if (rawKey === 'whop_test_facto') return getMockMrr()

    const parsed = parseWhopKey(rawKey)
    if (!parsed) return { valid: false, mrr: null, currency: 'USD', error: 'invalid_key' }

    const { companyId, apiKey } = parsed
    const headers = { Authorization: `Bearer ${apiKey}` }

    try {
      const [plansMap, memberships] = await Promise.all([
        fetchWhopPlans(companyId, headers),
        fetchWhopMemberships(companyId, headers)
      ])

      const activeMemberships = memberships.filter(m => 
        m.status === 'active' || m.status === 'trialing' || (!m.canceled_at && m.status !== 'canceled')
      )
      const currency = activeMemberships[0]?.currency?.toUpperCase() || 'USD'
      const mrr = activeMemberships.reduce((sum, m) => sum + calculateMembershipMrr(m, plansMap), 0)

      return { valid: true, mrr: Math.round(mrr), currency }
    } catch (e: any) {
      console.error('[Whop API Error (getMrr)]:', e?.data || e?.message || e)
      const status = e?.response?.status
      if (status === 401 || status === 403 || status === 400) return { valid: false, mrr: null, currency: 'USD', error: 'invalid_key' }
      return { valid: false, mrr: null, currency: 'USD', error: 'api_error' }
    }
  },

  async getHistory(rawKey: string): Promise<any> {
    if (rawKey === 'whop_test_facto') return getMockHistory()

    const parsed = parseWhopKey(rawKey)
    if (!parsed) return null

    const { companyId, apiKey } = parsed
    const headers = { Authorization: `Bearer ${apiKey}` }

    try {
      const [plansMap, memberships, payments] = await Promise.all([
        fetchWhopPlans(companyId, headers),
        fetchWhopMemberships(companyId, headers),
        fetchWhopPayments(companyId, headers)
      ])

      const subscriptions = memberships.map(s => {
        let canceledAt = s.canceled_at ? Math.floor(Date.parse(s.canceled_at) / 1000) : null
        
        // Ensure inactive subscriptions are properly marked as canceled for the graph logic
        if (!canceledAt && s.status !== 'active' && s.status !== 'trialing' && s.status !== 'valid') {
          canceledAt = s.created_at ? Math.floor(Date.parse(s.created_at) / 1000) : Math.floor(Date.now() / 1000)
        }

        return {
          created: s.created_at ? Math.floor(Date.parse(s.created_at) / 1000) : Math.floor(Date.now() / 1000),
          status: s.status,
          canceledAt,
          mrr: calculateMembershipMrr(s, plansMap)
        }
      })

      const charges = payments
        .filter(p => p.substatus === 'succeeded' || p.substatus === 'paid')
        .map(p => ({
          amount: p.usd_total || p.total || 0,
          created: p.created_at ? Math.floor(Date.parse(p.created_at) / 1000) : Math.floor(Date.now() / 1000)
        }))

      return { subscriptions, charges }
    } catch (e: any) {
      console.error('[Whop API Error (getHistory)]:', e?.data || e?.message || e)
      return null
    }
  }
}
