export const NOTIFIER_CONFIG = {
  // Telegram Bot API base
  telegramApiBase: 'https://api.telegram.org',

  // Timezone and scheduling defaults
  defaultTimezone: process.env.NOTIFIER_TIMEZONE || 'America/Bogota',
  digestHour: Number(process.env.DIGEST_HOUR || 18),

  // Message formatting limits
  maxMessageLength: 4096,
  maxStartupsPerBatch: 5,

  // Milestone thresholds
  countryRecordMarginPercent: 0.05, // +5% minimum over historical record
  minCountryRevenueForRecord: 500,  // minimum USD to trigger country milestone

  // Ranking moves
  rankingMoveCycleMaxItems: 5,
  rankingMoveMinRankToWatch: 10,

  // Anti-spam limits
  maxDailyMilestones: Number(process.env.NOTIFIER_MAX_DAILY_MILESTONES || 8),
  silenceHours: {
    start: 23, // 11 PM
    end: 7     // 7 AM
  },

  // Opportunities Engine
  opportunity: {
    minScore: 50,
    exceptionalScore: 85,
    maxPerDigest: 5,
    cooldownDays: 14,
    significantMrrJumpPercent: 30
  },

  // Network & Rate Limits
  rateLimitDelayMs: 1000,
  maxRetryAttempts: 3,
  retryInitialDelayMs: 2000,
  lockTtlSeconds: 120,

  // App URLs & UTM
  baseSiteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'https://www.factosaas.com',
  utmMedium: 'channel',
  utmSource: 'telegram',
  financialDisclaimer: 'Información de la plataforma, no es asesoría financiera.'
} as const
