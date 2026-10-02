import { whopService } from '~/server/services/whop'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const token = (query.token as string)?.trim()
  const email = (query.email as string)?.trim()?.toLowerCase()

  if (!token && !email) {
    throw createError({ statusCode: 400, statusMessage: 'Token or email is required' })
  }

  // 1. Si solo se provee token (validación preliminar del enlace)
  // Confirma que el token existe y está activo sin revelar el email ni saltarse la verificación
  if (token && !email) {
    const membership = await whopService.getActiveUnusedMembershipById(token)
    if (!membership) {
      const existing = await whopService.getMembershipById(token)
      if (existing && existing.used) {
        throw createError({ statusCode: 409, statusMessage: '¡Este cupo ya fue configurado con éxito y tu anuncio se encuentra activo en Facto!' })
      }
      throw createError({ statusCode: 404, statusMessage: 'No se encontró un pago activo para este token' })
    }
    return { ok: true, requiresEmailVerification: true }
  }

  // 2. Si se proveen token y email (el usuario ingresa su email en el paso 1 para comprobar propiedad)
  if (token && email) {
    const membership = await whopService.getActiveUnusedMembershipById(token)
    if (!membership) {
      const existing = await whopService.getMembershipById(token)
      if (existing && existing.used) {
        throw createError({ statusCode: 409, statusMessage: '¡Este cupo ya fue configurado con éxito y tu anuncio se encuentra activo en Facto!' })
      }
      throw createError({ statusCode: 404, statusMessage: 'No se encontró un pago activo para este token' })
    }

    if (membership.email && membership.email.trim().toLowerCase() !== email) {
      throw createError({ statusCode: 403, statusMessage: 'El correo electrónico no coincide con el pago realizado.' })
    }

    return { ok: true, membership }
  }

  // 3. Si solo se provee email (flujo manual)
  if (!token && email) {
    const membership = await whopService.getActiveUnusedMembershipByEmail(email)
    if (!membership) {
      throw createError({ statusCode: 404, statusMessage: 'No se encontró un pago activo para este correo electrónico.' })
    }
    return { ok: true, membership }
  }
})
