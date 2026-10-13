import type { AdSetupPayload } from '../../../types'
import { whopService } from '~/server/services/whop'
import { adsService } from '~/modules/ads/server/services/ads'
import { authService } from '~/server/services/auth'
import { supabase } from '~/server/lib/supabase'

export default defineEventHandler(async (event) => {
  const body = await readBody<AdSetupPayload>(event)

  if ((!body.email && !body.token) || !body.name || !body.url) {
    throw createError({ statusCode: 400, statusMessage: 'Missing required fields' })
  }

  // 1. Verificar la membresía y validar que sea de un solo uso
  let membership = null
  if (body.token) {
    membership = await whopService.getActiveUnusedMembershipById(body.token)
    if (!membership) {
      const existing = await whopService.getMembershipById(body.token)
      if (existing && existing.used) {
        throw createError({ statusCode: 409, statusMessage: 'Este cupo ya fue configurado con éxito y el token fue consumido.' })
      }
      throw createError({ statusCode: 403, statusMessage: 'Token inválido o expirado.' })
    }
  } else if (body.email) {
    membership = await whopService.getActiveUnusedMembershipByEmail(body.email.trim().toLowerCase())
  }

  if (!membership) {
    throw createError({ statusCode: 403, statusMessage: 'No valid active unused membership found' })
  }

  // El correo asociado al token tiene precedencia estricta para evitar suplantaciones
  if (membership.email && (!body.email || membership.email.toLowerCase() !== body.email.trim().toLowerCase())) {
    throw createError({ statusCode: 403, statusMessage: 'El correo proporcionado no coincide con el correo verificado del pago.' })
  }

  const targetEmail = (membership.email || body.email || '').trim().toLowerCase()
  if (!targetEmail) {
    throw createError({ statusCode: 400, statusMessage: 'El correo electrónico es obligatorio para vincular tu cuenta.' })
  }

  if (!membership.email && targetEmail) {
    await supabase.from('whop_memberships').update({ email: targetEmail }).eq('id', membership.id)
  }

  // 2. Crear o recuperar el usuario
  let userId: string
  try {
    const user = await authService.getOrCreateUser(targetEmail, body.password)
    userId = user.id
  } catch (error: any) {
    throw createError({ statusCode: 500, statusMessage: 'Error associating user account: ' + error.message })
  }

  // 3. Posición y precio
  const slotNumber = Math.max(1, Math.min(20, Math.floor(body.position || 1)))
  const basePrice = slotNumber === 1 ? 10 : 1
  const slots = await adsService.getAuctionSlots()
  const targetSlot = slots.find(s => s.position === slotNumber)
  const minPrice = targetSlot ? (targetSlot.isAvailable ? targetSlot.currentPrice : targetSlot.nextPrice) : basePrice
  const price = Math.max(minPrice, Math.floor(Number(body.price) || minPrice))

  // 4. Crear / asignar anuncio al slot
  let adData
  try {
    let cleanUrl = (body.url || '').trim()
    if (cleanUrl && !/^https?:\/\//i.test(cleanUrl)) {
      cleanUrl = `https://${cleanUrl}`
    }

    adData = await adsService.claimSlot({
      position: slotNumber,
      name: body.name,
      description: body.description || '',
      url: cleanUrl,
      image_url: body.image_url || '',
      price,
      email: targetEmail,
      user_id: userId,
      whop_membership_id: membership.whop_membership_id
    })
  } catch (error: any) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  // 5. Quemar token de forma atómica (un solo uso garantizado)
  const wasMarked = await whopService.markMembershipAsUsed(membership.id)
  if (!wasMarked) {
    throw createError({ statusCode: 409, statusMessage: 'Este token ya ha sido utilizado para configurar un anuncio.' })
  }

  return { ok: true, ad: adData }
})
