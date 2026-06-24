import type { PaymentProviderService, ProviderValidationResult } from '~/modules/add-saas/types'

interface MpResult {
  auto_recurring: { transaction_amount: number; currency_id: string }
}

interface MpResponse {
  results: MpResult[]
}

async function fetchAllMP(baseUrl: string, headers: Record<string, string>): Promise<any[]> {
  const allResults: any[] = []
  let offset = 0
  const limit = 100

  while (offset < 10000) { // Safety limit
    const sep = baseUrl.includes('?') ? '&' : '?'
    const url = `${baseUrl}${sep}limit=${limit}&offset=${offset}`
    const res = await $fetch<any>(url, { headers }).catch(() => null)
    
    if (!res || !res.results || !Array.isArray(res.results) || res.results.length === 0) break
    
    allResults.push(...res.results)
    
    const total = res.paging?.total || 0
    offset += limit
    if (offset >= total) break
  }
  return allResults
}

export const mercadopagoService: PaymentProviderService = {
  async validate(apiKey: string): Promise<ProviderValidationResult> {
    return this.getMrr(apiKey)
  },

  async getMrr(apiKey: string): Promise<ProviderValidationResult> {
    if (apiKey === 'APP_USR_TEST_FACTO') return { valid: true, mrr: 8400, currency: 'USD' }

    try {
      const headers = { Authorization: `Bearer ${apiKey}` }
      const results = await fetchAllMP(
        'https://api.mercadopago.com/preapproval/search?status=authorized',
        headers
      )

      const currency = results[0]?.auto_recurring?.currency_id ?? 'USD'
      const mrr = results.reduce((sum, r) => sum + (r.auto_recurring?.transaction_amount || 0), 0)
 
      return { valid: true, mrr: Math.round(mrr), currency }
    } catch (e: unknown) {
      const status = (e as { response?: { status?: number } })?.response?.status
      if (status === 401 || status === 403) return { valid: false, mrr: null, currency: 'USD', error: 'invalid_key' }
      return { valid: false, mrr: null, currency: 'USD', error: 'api_error' }
    }
  },
 
  async getHistory(apiKey: string): Promise<any> {
    if (apiKey === 'APP_USR_TEST_FACTO') {
      const nowSec = Math.floor(Date.now() / 1000)
      const daySec = 24 * 60 * 60
 
      const subscriptions = [
        { created: nowSec - 45 * daySec, status: 'authorized', canceledAt: null, mrr: 2400 },
        { created: nowSec - 30 * daySec, status: 'authorized', canceledAt: null, mrr: 3000 },
        { created: nowSec - 20 * daySec, status: 'cancelled', canceledAt: nowSec - 5 * daySec, mrr: 1500 },
        { created: nowSec - 10 * daySec, status: 'authorized', canceledAt: null, mrr: 3000 }
      ]
 
      const charges = [
        { amount: 2400, created: nowSec - 40 * daySec },
        { amount: 3000, created: nowSec - 28 * daySec },
        { amount: 1500, created: nowSec - 18 * daySec },
        { amount: 2400, created: nowSec - 10 * daySec },
        { amount: 3000, created: nowSec - 8 * daySec },
        { amount: 3000, created: nowSec - 2 * daySec }
      ]
 
      return { subscriptions, charges }
    }
 
    try {
      const headers = { Authorization: `Bearer ${apiKey}` }
      const [subsData, paymentsData] = await Promise.all([
        fetchAllMP('https://api.mercadopago.com/preapproval/search', headers),
        fetchAllMP('https://api.mercadopago.com/v1/payments/search?status=approved', headers)
      ])
 
      const subscriptions = subsData.map((s: any) => {
        let canceledAt = s.status === 'cancelled' && s.last_modified ? Math.floor(Date.parse(s.last_modified) / 1000) : null
        if (!canceledAt && s.status !== 'authorized') {
          canceledAt = s.date_created ? Math.floor(Date.parse(s.date_created) / 1000) : Math.floor(Date.now() / 1000)
        }
        return {
          created: s.date_created ? Math.floor(Date.parse(s.date_created) / 1000) : Math.floor(Date.now() / 1000),
          status: s.status,
          canceledAt,
          mrr: s.auto_recurring?.transaction_amount || 0
        }
      })
 
      const charges = paymentsData.map((p: any) => ({
        amount: p.transaction_amount || 0,
        created: p.date_approved ? Math.floor(Date.parse(p.date_approved) / 1000) : Math.floor(Date.now() / 1000)
      }))
 
      return { subscriptions, charges }
    } catch {
      return null
    }
  },
}
