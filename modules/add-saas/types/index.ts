export type PaymentProvider = 'stripe' | 'mercadopago' | 'whop'

export interface ProviderValidationResult {
  valid: boolean
  mrr: number | null
  currency: string
  error?: 'invalid_key' | 'no_subscriptions' | 'api_error'
}

export interface PaymentProviderService {
  validate(apiKey: string): Promise<ProviderValidationResult>
  getMrr(apiKey: string): Promise<ProviderValidationResult>
  getHistory?(apiKey: string): Promise<any>
}

export interface SaasSubmission {
  id?: string
  name: string
  logoUrl?: string
  logoFileBase64?: string
  websiteUrl?: string
  founderName?: string
  founderEmail?: string
  startupType?: string
  categorySlugs: string[]
  countrySlug?: string
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
  categories: { name: string; slug: string }[]
  country?: { name: string; slug: string; flag: string } | null
  provider: PaymentProvider | null
  isIncognito: boolean
  mrr: number | null
  currency: string
  publishedAt: string
}
