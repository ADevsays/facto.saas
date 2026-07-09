export const ACHIEVEMENT_THRESHOLDS = [
  500, 750, 1_000, 1_500, 2_000,
  5_000, 10_000, 15_000, 20_000, 30_000,
  50_000, 75_000, 100_000, 500_000, 1_000_000
] as const

export type AchievementThreshold = typeof ACHIEVEMENT_THRESHOLDS[number]

export function formatMilestone(value: number): string {
  if (value >= 1_000_000) return `${value / 1_000_000}M`
  if (value >= 1_000) return `${value / 1_000}K`
  return String(value)
}
