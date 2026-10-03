export type EventPriority = 'high' | 'medium' | 'low'
export type EventStatus = 'pending' | 'sent' | 'failed' | 'skipped'
export type EventType =
  | 'new_startup'
  | 'country_record'
  | 'ranking_move'
  | 'visits_record'
  | 'opportunity'
  | 'digest'

export interface NotificationEvent<T = any> {
  id: string
  eventType: EventType
  dedupeKey: string
  payload: T
  priority: EventPriority
  status: EventStatus
  attempts: number
  maxAttempts: number
  lastError?: string | null
  skipReason?: string | null
  telegramMessageId?: number | null
  scheduledFor: string
  processedAt?: string | null
  createdAt: string
  updatedAt: string
}

export interface NewStartupPayload {
  startups: Array<{
    id: string
    name: string
    slug: string
    category: string
    country?: string
    countryFlag?: string
    mrr: number | null
    currency: string
    isIncognito: boolean
    websiteUrl?: string | null
    description?: string | null
    rank?: number
    totalRanked?: number
  }>
}

export interface CountryRecordPayload {
  countryName: string
  countrySlug: string
  countryFlag: string
  metric: 'revenue' | 'startups'
  previousValue: number
  newValue: number
  formattedValue: string
  growthPercentage: number
}

export interface RankingMovePayload {
  moves: Array<{
    startupId: string
    name: string
    slug: string
    countryFlag?: string
    previousRank: number
    newRank: number
    overtookName?: string
    isNewTop10: boolean
    isNewTop3: boolean
    isNewCountryInTop: boolean
  }>
}

export interface VisitsRecordPayload {
  date: string
  totalVisits: number
  previousRecord: number
  growthPercentage: number
}

export interface OpportunityScoreDetail {
  startupId: string
  name: string
  slug: string
  category: string
  country?: string
  countryFlag?: string
  currentMrr: number | null
  previousMrr?: number | null
  currency: string
  growthPercentage?: number | null
  growthDays?: number | null
  score: number
  reasons: string[]
  isVerified: boolean
  publishedAt: string
  websiteUrl?: string | null
}

export interface OpportunityPayload {
  opportunity: OpportunityScoreDetail
  isExceptionalStandalone: boolean
}

export interface DailyDigestPayload {
  dateStr: string
  newStartupsCount: number
  newStartupsSummary: Array<{
    name: string
    country?: string
    countryFlag?: string
    category: string
    mrr: number | null
  }>
  globalRevenue: number
  globalRevenueFormatted: string
  globalRevenueChange: number
  globalRevenueChangeFormatted: string
  topCountryMovers: Array<{
    country: string
    countryFlag: string
    revenueChange: number
    revenueChangeFormatted: string
    startupsCount: number
  }>
  rankingHighlights: Array<{
    startupName: string
    rank: number
    change: number
  }>
  visitsSummary?: {
    todayVisits: number
    sevenDayAvg: number
    changePercentage: number
  } | null
  opportunities: OpportunityScoreDetail[]
  isQuietDay: boolean
}

export interface StartupSnapshotItem {
  id: string
  name: string
  slug: string
  category: string
  countrySlug?: string
  countryName?: string
  countryFlag?: string
  mrr: number | null
  revenue: number | null
  views: number
  publishedAt: string
  isIncognito: boolean
  rank: number
  hasVerifiedHistory: boolean
  chargesCount: number
  subscriptionsCount: number
  description?: string | null
}

export interface SystemSnapshotState {
  timestamp: string
  date: string
  ranking: StartupSnapshotItem[]
  countries: Record<string, {
    totalRevenue: number
    startupsCount: number
    maxRevenueRecord: number
    maxStartupsRecord: number
    name?: string
    flag?: string
  }>
  visits: {
    today: number
    history: Record<string, number>
    maxDailyRecord: number
  }
  global: {
    totalRevenue: number
    totalStartups: number
  }
  sentOpportunities: Record<string, {
    lastSentDate: string
    lastScore: number
    lastMrr: number | null
  }>
}

export interface TelegramSendMessageOptions {
  chatId: string | number
  text: string
  parseMode?: 'HTML' | 'MarkdownV2'
  disableWebPagePreview?: boolean
  preferSmallMedia?: boolean
  preferLargeMedia?: boolean
  showAboveText?: boolean
}

export interface TelegramResponse<T = unknown> {
  ok: boolean
  result?: T
  description?: string
  error_code?: number
  parameters?: {
    retry_after?: number
    migrate_to_chat_id?: number
  }
}

export interface TelegramMessageResult {
  message_id: number
  date: number
  chat: {
    id: number
    title?: string
    username?: string
    type: string
  }
}
