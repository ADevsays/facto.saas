import { supabase } from '~/server/lib/supabase'
import { sendFoundersReport } from '~/modules/leadmagnets/server/services/email'
import { ACHIEVEMENT_THRESHOLDS, formatMilestone } from '../const/thresholds'
import { buildAchievementEmailHtml } from '../utils/achievementEmail'
import { NotifierOrchestrator } from '~/modules/notifier/server/services/notifier.orchestrator'
import type { AchievementCheckParams } from '../../types'

export async function checkAndNotifyAchievement(params: AchievementCheckParams): Promise<void> {
  const { saasId, saasName, saasLogoUrl, founderEmail, saasSlug, currentViews } = params

  if (!ACHIEVEMENT_THRESHOLDS.includes(currentViews as any)) return

  const milestone = currentViews
  const achievementType = `${milestone}_views`

  const { data, error } = await supabase
    .from('saas_achievements')
    .insert({ saas_id: saasId, achievement_type: achievementType })
    .select('id')
    .single()

  if (error) {
    if (error.code === '23505') {
      console.warn(`[achievements] Milestone ${achievementType} already registered for ${saasName} (${saasId}), skipping.`)
    } else {
      console.error('[achievements] Insert error:', error)
    }
    return
  }

  const telegramTask = (async () => {
    try {
      const orchestrator = new NotifierOrchestrator()
      const tgRes = await orchestrator.notifyVisitsMilestoneReactive({
        startupId: saasId,
        milestone
      })
      if (!tgRes.success) {
        console.warn(`[achievements] Telegram notify skipped/failed for ${achievementType}:`, tgRes.skipReason)
      }
    } catch (err) {
      console.error(`[achievements] Telegram notify error for ${achievementType}:`, err)
    }
  })()

  const emailTask = (async () => {
    if (!data || !founderEmail) return

    try {
      const lang = params.lang || 'es'
      const html = buildAchievementEmailHtml(saasName, milestone, saasSlug, saasLogoUrl, lang)
      const formatted = formatMilestone(milestone)
      const subject = lang === 'en'
        ? `${saasName} reached ${formatted} visits on Facto`
        : `${saasName} alcanzó las ${formatted} visitas en Facto`

      await sendFoundersReport({
        to: founderEmail,
        subject,
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
  })()

  await Promise.allSettled([telegramTask, emailTask])
}
