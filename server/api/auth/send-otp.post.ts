import { supabase } from '~/server/lib/supabase'
import { sendFoundersReport } from '~/modules/leadmagnets/server/services/email'
import crypto from 'crypto'

function generateOtpCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

function buildOtpEmailHtml(code: string): string {
  return `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#030305;font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#E5E7EB;-webkit-font-smoothing:antialiased;">
<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color:#030305;padding:40px 20px;">
<tr><td align="center">
<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px;background-color:#12121A;border:1px solid rgba(255,255,255,0.05);border-radius:12px;overflow:hidden;margin:0 auto;">
<tr><td align="center" style="padding:40px 20px 20px 20px;border-bottom:1px solid rgba(255,255,255,0.05);">
<h1 style="margin:0;font-family:'Playfair Display',Georgia,serif;font-size:28px;font-weight:600;color:#FFFFFF;letter-spacing:0.02em;">Facto</h1>
</td></tr>
<tr><td style="padding:40px 30px;">
<h2 style="margin:0 0 20px 0;font-family:'Playfair Display',Georgia,serif;font-size:22px;font-weight:400;color:#FFFFFF;">Tu código de verificación</h2>
<p style="margin:0 0 20px 0;font-size:15px;line-height:1.6;color:#D1D5DB;font-weight:300;">Usa este código para verificar tu identidad como fundador. El código expira en 10 minutos.</p>
<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
<tr><td align="center" style="padding:20px 0;">
<div style="display:inline-block;padding:18px 40px;background-color:rgba(0,212,255,0.08);border:2px solid rgba(0,212,255,0.3);border-radius:12px;font-family:'Inter',monospace;font-size:32px;font-weight:700;letter-spacing:0.3em;color:#00D4FF;">${code}</div>
</td></tr>
</table>
<p style="margin:20px 0 0 0;font-size:13px;line-height:1.6;color:#6B7280;font-weight:300;">Si no solicitaste este código, puedes ignorar este correo.</p>
</td></tr>
<tr><td align="center" style="padding:30px;background-color:#0A0A0F;border-top:1px solid rgba(255,255,255,0.05);">
<p style="margin:0 0 10px 0;font-size:12px;color:#6B7280;">© 2026 Facto. Todos los derechos reservados.</p>
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`
}

export default defineEventHandler(async (event) => {
  const body = await readBody<{ email: string; saasId: string }>(event)

  if (!body.email || !body.saasId) {
    throw createError({ statusCode: 400, message: 'email and saasId are required' })
  }

  const email = body.email.trim().toLowerCase()

  const { data: entry, error: entryError } = await supabase
    .from('saas_entries')
    .select('id, founder_email')
    .eq('id', body.saasId)
    .single()

  if (entryError || !entry) {
    throw createError({ statusCode: 404, message: 'Startup not found' })
  }

  if (!entry.founder_email || entry.founder_email.trim().toLowerCase() !== email) {
    throw createError({ statusCode: 403, message: 'Ese no es el email del fundador. 🤔' })
  }

  const code = generateOtpCode()
  const pepper = process.env.SUPABASE_SERVICE_KEY || 'facto-secret-pepper'
  const hashedCode = crypto.createHmac('sha256', pepper).update(code).digest('hex')
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString()

  // Limpiar cualquier código anterior para evitar duplicados o fallos de UPSERT
  await supabase.from('otp_codes').delete().eq('email', email)

  const { error: insertError } = await supabase
    .from('otp_codes')
    .insert({ email, code: hashedCode, expires_at: expiresAt, attempts: 0 })

  if (insertError) {
    throw createError({ statusCode: 500, message: 'Failed to generate verification code' })
  }

  try {
    await sendFoundersReport({
      to: email,
      subject: 'Tu código de verificación — Facto',
      html: buildOtpEmailHtml(code),
    })
  } catch (err) {
    console.error('[send-otp] Email send failed:', err)
    return { sent: true, warning: 'El código fue generado pero el correo podría tardar en llegar.' }
  }

  return { sent: true }
})
