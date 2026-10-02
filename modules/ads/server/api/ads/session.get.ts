import { whopService } from '~/server/services/whop'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const token = (query.token as string)?.trim()
  const email = (query.email as string)?.trim()

  if (!token && !email) {
    throw createError({ statusCode: 400, statusMessage: 'Token or email is required' })
  }

  let membership = null

  if (token) {
    membership = await whopService.getActiveUnusedMembershipById(token)
    if (!membership && !email) {
      const existing = await whopService.getMembershipById(token)
      if (existing && existing.used) {
        throw createError({ statusCode: 409, statusMessage: '¡Este cupo ya fue configurado con éxito y tu anuncio se encuentra activo en Facto!' })
      }
      throw createError({ statusCode: 404, statusMessage: 'No se encontró un pago activo para este token' })
    }
  }

  if (!membership && email) {
    membership = await whopService.getActiveUnusedMembershipByEmail(email.toLowerCase())
    if (!membership) {
      throw createError({ statusCode: 404, statusMessage: 'No active unused membership found for this email' })
    }
  }

  if (!membership) {
    throw createError({ statusCode: 404, statusMessage: 'No active unused membership found' })
  }

  return { ok: true, membership }
})
