import type { AdSetupPayload } from '../../../types'
import { whopService } from '~/server/services/whop'
import { adsService } from '~/modules/ads/server/services/ads'
import { authService } from '~/server/services/auth'

export default defineEventHandler(async (event) => {
  const body = await readBody<AdSetupPayload>(event)

  if (!body.email || !body.password || !body.name || !body.url) {
    throw createError({ statusCode: 400, statusMessage: 'Missing required fields' })
  }

  // 1. Verificar la membresía
  const membership = await whopService.getActiveUnusedMembershipByEmail(body.email)
  if (!membership) {
    throw createError({ statusCode: 403, statusMessage: 'No valid membership found for this email' })
  }

  // 2. Crear el usuario
  let userId: string
  try {
    const user = await authService.createUser(body.email, body.password)
    userId = user.id
  } catch (error: any) {
    throw createError({ statusCode: 500, statusMessage: 'Error creating user account: ' + error.message })
  }

  // 3. Crear anuncio
  let adData
  try {
    adData = await adsService.createAd({
      name: body.name,
      description: body.description || '',
      url: body.url,
      image_url: body.image_url || '',
      user_id: userId,
      whop_membership_id: membership.whop_membership_id
    })
  } catch (error: any) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  // 4. Marcar usada
  await whopService.markMembershipAsUsed(membership.id)

  return { ok: true, ad: adData }
})
