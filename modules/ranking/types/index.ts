export type PaymentProvider = 'stripe' | 'mercadopago'
export type SortOption = 'mrr' | 'latest' | 'views'

export interface SaasListItem {
  id: string
  name: string | null
  slug?: string | null
  logoUrl: string | null
  websiteUrl: string | null
  founderName: string | null
  description?: string | null
  isIncognito: boolean
  mrr: number | null
  revenue?: string | null
  currency: string
  category: string
  categorySlug: string
  categories: { name: string; slug: string }[]
  country?: { name: string; slug: string; flag: string; iso_code?: string } | null
  provider: PaymentProvider | null
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
  country?: string
  countries?: string[]
  q?: string
  limit?: number
  offset?: number
  excludeIncognito?: boolean
}

export interface CountryLeaderboardItem {
  name: string
  slug: string
  flag: string
  isoCode: string
  totalRevenue: number
  startupsCount: number
}

export interface CountryStartupItem {
  name: string
  slug: string
  logoUrl: string | null
  websiteUrl: string | null
  revenue: number | null
  hasProvider: boolean
}

export interface CountryStartupPage {
  items: CountryStartupItem[]
  hasMore: boolean
}
