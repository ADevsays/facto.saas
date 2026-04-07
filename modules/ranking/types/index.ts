export type PaymentProvider = 'stripe' | 'mercadopago'
export type SortOption = 'mrr' | 'latest' | 'views'

export interface SaasListItem {
  id: string
  name: string | null
  logoUrl: string | null
  websiteUrl: string | null
  founderName: string | null
  isIncognito: boolean
  mrr: number | null
  currency: string
  category: string
  categorySlug: string
  provider: PaymentProvider
  views: number
  publishedAt: string
}

export interface SaasListState {
  items: SaasListItem[]
  loading: boolean
  error: string | null
}

export interface ListQueryParams {
  sort?: SortOption
  category?: string
  q?: string
  limit?: number
  offset?: number
}
