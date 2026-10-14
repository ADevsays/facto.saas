import { supabase } from '~/server/lib/supabase'
import { sendFoundersReport } from '~/modules/leadmagnets/server/services/email'

interface ProviderKeyExpiredEmailParams {
  saasId: string
  startupName: string
  startupSlug: string
  founderEmail: string
  lastSyncedAt: number | null
}

export function buildProviderKeyExpiredEmailHtml(dashboardUrl: string): string {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Actualiza tu API Key en Facto</title>
</head>
<body style="margin:0;padding:0;background-color:#030305;font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#E5E7EB;">
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color:#030305;padding:40px 20px;">
    <tr><td align="center">
      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px;background-color:#12121A;border:1px solid rgba(255,255,255,0.08);border-radius:16px;overflow:hidden;margin:0 auto;">
        <tr><td align="center" style="padding:36px 20px 22px;border-bottom:1px solid rgba(255,255,255,0.06);">
          <div style="font-family:'Playfair Display',Georgia,serif;font-size:29px;font-weight:600;color:#FFFFFF;">Facto</div>
        </td></tr>
        <tr><td style="padding:36px 32px;">
          <p style="margin:0 0 18px;font-family:'Playfair Display',Georgia,serif;font-size:25px;color:#FFFFFF;">Hey!</p>
          <p style="margin:0 0 18px;font-size:15px;line-height:1.65;color:#D1D5DB;font-weight:300;">Estamos revisando que la conexión de tu pasarela de pagos ha expirado.</p>
          <p style="margin:0 0 18px;font-size:15px;line-height:1.65;color:#D1D5DB;font-weight:300;">Por ahora seguiremos usando tus últimos datos.</p>
          <p style="margin:0 0 24px;font-size:15px;line-height:1.65;color:#D1D5DB;font-weight:300;">Puedes entrar al <a href="${dashboardUrl}" style="color:#00D4FF;text-decoration:underline;">dashboard</a> y actualizar tu key con permisos que no expiren o responder este mensaje si es intencional para no mostrar más tus datos.</p>
          <p style="margin:0;font-size:15px;line-height:1.65;color:#D1D5DB;font-weight:300;">Saludos.</p>
        </td></tr>
        <tr><td align="center" style="padding:24px;background-color:#0A0A0F;border-top:1px solid rgba(255,255,255,0.06);">
          <p style="margin:0;font-size:11px;color:#6B7280;">© 2026 Facto · factosaas.com</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

export async function notifyProviderKeyExpiredOnce(params: ProviderKeyExpiredEmailParams): Promise<boolean> {
  const cacheVersion = params.lastSyncedAt ? new Date(params.lastSyncedAt).toISOString() : 'legacy'
  const dedupeKey = `provider-key-expired-email:${params.saasId}:${cacheVersion}`
  const { data: reservation, error: reservationError } = await supabase
    .from('notification_events')
    .insert({
      event_type: 'provider_key_expired_email',
      dedupe_key: dedupeKey,
      payload: { saasId: params.saasId, startupSlug: params.startupSlug },
      priority: 'low',
      status: 'skipped',
      max_attempts: 1,
      skip_reason: 'Reserved for transactional email sender',
    })
    .select('id')
    .single()

  if (reservationError?.code === '23505') return false
  if (reservationError || !reservation) throw reservationError || new Error('Unable to reserve provider key email')

  try {
    const siteUrl = (process.env.NUXT_PUBLIC_SITE_URL || 'https://www.factosaas.com').replace(/\/$/, '')
    await sendFoundersReport({
      to: params.founderEmail,
      subject: `Actualiza la conexión de ${params.startupName} en Facto`,
      html: buildProviderKeyExpiredEmailHtml(`${siteUrl}/dashboard/saas/${encodeURIComponent(params.startupSlug)}`),
    })
    await supabase.from('notification_events').update({
      status: 'sent',
      skip_reason: null,
      processed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }).eq('id', reservation.id)
    return true
  } catch (error) {
    await supabase.from('notification_events').delete().eq('id', reservation.id)
    throw error
  }
}
