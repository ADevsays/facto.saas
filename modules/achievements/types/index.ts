export interface Achievement {
  id: string
  saasId: string
  achievementType: string
  notified: boolean
  unlockedAt: string
}

export interface AchievementCheckParams {
  saasId: string
  saasName: string
  founderEmail: string | null
  saasSlug: string
  currentViews: number
}
