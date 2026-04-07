export type PaymentProvider = 'stripe' | 'mercadopago'

export interface ProviderValidationResult {
  valid: boolean
  mrr: number | null
  currency: string
  error?: 'invalid_key' | 'no_subscriptions' | 'api_error'
}

export interface PaymentProviderService {
  validate(apiKey: string): Promise<ProviderValidationResult>
  getMrr(apiKey: string): Promise<ProviderValidationResult>
}

export interface SaasSubmission {
  name: string
  logoUrl?: string
  websiteUrl?: string
  founderName?: string
  startupType?: string
  categorySlug: string
  providerSlug?: PaymentProvider
  providerKey?: string
  isIncognito: boolean
}

export interface SaasPublicProfile {
  id: string
  name: string | null
  logoUrl: string | null
  websiteUrl: string | null
  founderName: string | null
  startupType: string | null
  category: string
  provider: PaymentProvider | null
  isIncognito: boolean
  mrr: number | null
  currency: string
  publishedAt: string
}
