import type { PaymentProviderService, ProviderValidationResult } from '~/modules/add-saas/types'

interface StripeSubscription {
  items: { data: { price: { unit_amount: number; recurring: { interval: string } }; quantity: number }[] }
}

interface StripeResponse {
  data: StripeSubscription[]
}

function calcMrr(sub: StripeSubscription): number {
  return sub.items.data.reduce((sum, item) => {
    const amount = item.price.unit_amount * item.quantity
    const interval = item.price.recurring.interval
    const monthly = interval === 'year' ? amount / 12 : interval === 'week' ? amount * 4.33 : amount
    return sum + monthly / 100
  }, 0)
}

export const stripeService: PaymentProviderService = {
  async validate(apiKey: string): Promise<ProviderValidationResult> {
    return this.getMrr(apiKey)
  },

  async getMrr(apiKey: string): Promise<ProviderValidationResult> {
    // Sandbox Mode for testing
    if (apiKey === 'sk_test_facto') {
      return { valid: true, mrr: 12500, currency: 'USD' }
    }

    try {
      const res = await $fetch<StripeResponse>(
        'https://api.stripe.com/v1/subscriptions?status=active&limit=100',
        { headers: { Authorization: `Bearer ${apiKey}` } }
      )

      const mrr = res.data.reduce((sum, sub) => sum + calcMrr(sub), 0)
      return { valid: true, mrr: Math.round(mrr), currency: 'USD' }
    } catch (e: unknown) {
      const status = (e as { response?: { status?: number } })?.response?.status
      if (status === 401 || status === 403) return { valid: false, mrr: null, currency: 'USD', error: 'invalid_key' }
      return { valid: false, mrr: null, currency: 'USD', error: 'api_error' }
    }
  },
}
