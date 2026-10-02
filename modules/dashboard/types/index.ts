export interface DashboardFounder {
  id?: string
  email: string
  name: string | null
  avatar_url: string | null
  bio: string | null
  country_slug: string | null
  twitter_url: string | null
  linkedin_url: string | null
  instagram_url: string | null
  created_at?: string
}

export interface DashboardStartup {
  id: string
  name: string | null
  slug: string
  logo_url: string | null
  website_url: string | null
  startup_type: string | null
  status?: string
  is_incognito?: boolean
  mrr: number | null
  currency: string
  views: number
  published_at: string
  value_proposition?: string | null
  problem_solved?: string | null
  tech_stack?: string[]
  acquisition_channels?: string[]
  facto_message?: string | null
  faq?: { question: string; answer: string }[]
  github_repo?: string | null
  categories?: { name: string; slug: string }[]
  countries?: { name: string; slug: string; flag: string; iso_code?: string }[]
  payment_providers?: { slug: string }
}
