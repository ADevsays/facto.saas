import { supabase } from '~/server/lib/supabase'
import { adsService } from '~/modules/ads/server/services/ads'

export default defineEventHandler(async (event) => {
  const body = await readBody<{ position: number }>(event)

  if (!body || !body.position) {
    throw createError({ statusCode: 400, statusMessage: 'Position is required' })
  }

  const slotNumber = Math.max(1, Math.min(20, Math.floor(body.position)))

  const activeAds = await adsService.getActiveAds()
  const targetAds = activeAds.filter(a => a.position === slotNumber)

  let removedCount = 0
  for (const ad of targetAds) {
    try {
      const { error } = await supabase
        .from('ads')
        .update({ is_active: false })
        .eq('id', ad.id)

      if (!error) removedCount++
      else console.error('[Admin Remove Ad] Update error:', error.message)
    } catch (err: any) {
      console.error('[Admin Remove Ad] Exception:', err)
    }
  }

  return { ok: true, position: slotNumber, removedCount }
})
