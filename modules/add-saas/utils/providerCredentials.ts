import type { PaymentProvider } from '../types'

export interface ProviderCredentials {
  rawApiKey: string
  companyId: string
  stripeProductId: string
  stripeProducts: { id: string; name: string }[]
}

export function resetProviderCredentials(
  _previous: PaymentProvider | 'none',
  _next: PaymentProvider | 'none',
): ProviderCredentials {
  return {
    rawApiKey: '',
    companyId: '',
    stripeProductId: '',
    stripeProducts: [],
  }
}
