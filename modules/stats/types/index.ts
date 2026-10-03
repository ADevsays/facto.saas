export type TimeRange = 'all' | '90d' | '30d'

export interface StatDayPoint {
  date: string
  startupsAdded: number
  cumulativeStartups: number
  mrr: number
  revenue: number
  views: number
  mrrAdded: number
  revenueAdded: number
  viewsAdded: number
}

export interface StatWeekPoint {
  week: string
  label: string
  startupsAdded: number
  cumulativeStartups: number
  mrr: number
}

export interface StatCategoryPoint {
  name: string
  slug: string
  count: number
  totalMrr: number
  totalViews: number
}

export interface StatCountryPoint {
  name: string
  slug: string
  flag: string
  isoCode: string
  count: number
  totalMrr: number
  totalViews: number
}

export interface StatsOverviewResponse {
  summary: {
    totalStartups: number
    totalMrr: number
    totalRevenue: number
    totalViews: number
    avgMrr: number
    verifiedCount: number
    countriesCount: number
    categoriesCount: number
    today: {
      date: string
      startupsAdded: number
      mrrAdded: number
      revenueAdded: number
      viewsAdded: number
    }
    growth30d: {
      startups: number
      mrr: number
    }
  }
  timeline: {
    daily: StatDayPoint[]
    weekly: StatWeekPoint[]
  }
  byCategory: StatCategoryPoint[]
  byCountry: StatCountryPoint[]
}
