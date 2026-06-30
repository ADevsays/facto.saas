import { supabase } from '~/server/lib/supabase'
import crypto from 'crypto'

export default defineEventHandler(async (event) => {
  const body = await readBody<{ email: string; code: string }>(event)

  if (!body.email || !body.code) {
    throw createError({ statusCode: 400, message: 'email and code are required' })
  }

  const email = body.email.trim().toLowerCase()

  const { data: otp, error: fetchError } = await supabase
    .from('otp_codes')
    .select('code, expires_at, attempts')
    .eq('email', email)
    .single()

  if (fetchError || !otp) {
    throw createError({ statusCode: 404, message: 'No hay un código activo para este email. Solicita uno nuevo.' })
  }

  if (otp.attempts >= 3) {
    await supabase.from('otp_codes').delete().eq('email', email)
    throw createError({ statusCode: 429, message: 'Código invalidado por intentos excesivos. Solicita uno nuevo.' })
  }

  if (new Date(otp.expires_at) < new Date()) {
    await supabase.from('otp_codes').delete().eq('email', email)
    throw createError({ statusCode: 410, message: 'Código expirado' })
  }

  const pepper = process.env.SUPABASE_SERVICE_KEY || 'facto-secret-pepper'
  const hashedInputCode = crypto.createHmac('sha256', pepper).update(body.code.trim()).digest('hex')

  if (otp.code !== hashedInputCode) {
    await supabase
      .from('otp_codes')
      .update({ attempts: otp.attempts + 1 })
      .eq('email', email)

    throw createError({ statusCode: 401, message: 'Código incorrecto' })
  }

  await supabase.from('otp_codes').delete().eq('email', email)

  return { verified: true, email }
})
