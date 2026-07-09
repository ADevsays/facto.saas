import { supabase } from '~/server/lib/supabase'
import { sendFoundersReport } from '~/modules/leadmagnets/server/services/email'
import { ACHIEVEMENT_THRESHOLDS, formatMilestone } from '../const/thresholds'
import { buildAchievementEmailHtml } from '../utils/achievementEmail'
import type { AchievementCheckParams } from '../../types'

export async function checkAndNotifyAchievement(params: AchievementCheckParams): Promise<void> {
  const { saasId, saasName, saasLogoUrl, founderEmail, saasSlug, currentViews } = params

  if (!ACHIEVEMENT_THRESHOLDS.includes(currentViews as any)) return

  const achievementType = `${currentViews}_views`

  const { data, error } = await supabase
    .from('saas_achievements')
    .insert({ saas_id: saasId, achievement_type: achievementType })
    .select('id')
    .single()

  if (error) {
    if (error.code !== '23505') {
      console.error('[achievements] Insert error:', error)
    }
    return
  }

  if (!data || !founderEmail) return

  try {
    const html = buildAchievementEmailHtml(saasName, currentViews, saasSlug, saasLogoUrl)
    const formatted = formatMilestone(currentViews)

    await sendFoundersReport({
      to: founderEmail,
      subject: `🚀 ${saasName} alcanzó las ${formatted} visitas en Facto`,
      html
    })

    await supabase
      .from('saas_achievements')
      .update({ notified: true })
      .eq('id', data.id)

    console.log(`[achievements] Notified ${founderEmail} for ${achievementType} on ${saasName}`)
  } catch (err) {
    console.error(`[achievements] Email send error for ${achievementType}:`, err)
  }
}
