export const ACHIEVEMENT_THRESHOLDS = [
  50, 100, 250, 500, 750, 1_000, 1_500, 2_000,
  5_000, 10_000, 15_000, 20_000, 30_000,
  50_000, 75_000, 100_000, 500_000, 1_000_000
] as const

export type AchievementThreshold = typeof ACHIEVEMENT_THRESHOLDS[number]

export function formatMilestone(value: number): string {
  if (value >= 1_000_000) return `${value / 1_000_000}M`
  if (value >= 1_000) return `${value / 1_000}K`
  return String(value)
}

export function getMilestoneBadgeUrl(value: number | string): string {
  const supabaseUrl = process.env.SUPABASE_URL || 'https://qsjnouwunclflruotduc.supabase.co'
  return `${supabaseUrl}/storage/v1/object/public/achievements/v2/badge-${value}.png`
}
