import { adsService } from '~/modules/ads/server/services/ads'
import type { AdminAssignAdPayload } from '~/modules/ads/types'

export default defineEventHandler(async (event) => {
  const body = await readBody<AdminAssignAdPayload>(event)

  if (!body || !body.position || !body.name || !body.url) {
    throw createError({ statusCode: 400, statusMessage: 'Missing required fields (position, name, url)' })
  }

  const slotNumber = Math.max(1, Math.min(20, Math.floor(body.position)))
  const price = body.price !== undefined && body.price > 0 ? body.price : 1

  const ad = await adsService.claimSlot({
    position: slotNumber,
    name: body.name,
    description: body.description || '',
    url: body.url,
    image_url: body.image_url || '',
    price,
    is_affiliate: true
  })

  return { ok: true, ad }
})
