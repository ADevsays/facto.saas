import type { PaymentProviderService, ProviderValidationResult } from '~/modules/add-saas/types'

interface MpResult {
  auto_recurring: { transaction_amount: number; currency_id: string }
}

interface MpResponse {
  results: MpResult[]
}

export const mercadopagoService: PaymentProviderService = {
  async validate(apiKey: string): Promise<ProviderValidationResult> {
    return this.getMrr(apiKey)
  },

  async getMrr(apiKey: string): Promise<ProviderValidationResult> {
    // Sandbox Mode for testing
    if (apiKey === 'APP_USR_TEST_FACTO') {
      return { valid: true, mrr: 8400, currency: 'USD' }
    }

    try {
      const res = await $fetch<MpResponse>(
        'https://api.mercadopago.com/preapproval/search?status=authorized&limit=100',
        { headers: { Authorization: `Bearer ${apiKey}` } }
      )

      const results = res.results ?? []
      const currency = results[0]?.auto_recurring.currency_id ?? 'USD'
      const mrr = results.reduce((sum, r) => sum + r.auto_recurring.transaction_amount, 0)

      return { valid: true, mrr: Math.round(mrr), currency }
    } catch (e: unknown) {
      const status = (e as { response?: { status?: number } })?.response?.status
      if (status === 401 || status === 403) return { valid: false, mrr: null, currency: 'USD', error: 'invalid_key' }
      return { valid: false, mrr: null, currency: 'USD', error: 'api_error' }
    }
  },
}
