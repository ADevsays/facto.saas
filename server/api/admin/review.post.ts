import { supabase } from '~/server/lib/supabase'
import { sendFoundersReport } from '~/modules/leadmagnets/server/services/email'

function buildApprovalEmail(name: string, slug: string | null, siteUrl: string): string {
  const profileUrl = slug ? `${siteUrl}/saas/${slug}` : siteUrl
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Tu startup fue aprobada en Facto</title>
</head>
<body style="margin:0;padding:0;background-color:#030305;font-family:'Inter',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#030305;padding:48px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:580px;background-color:#0a0a0f;border:1px solid rgba(255,255,255,0.06);border-radius:16px;overflow:hidden;">

          <!-- Header -->
          <tr>
            <td style="padding:40px 40px 0 40px;text-align:center;">
              <p style="margin:0 0 28px 0;font-size:11px;font-weight:500;letter-spacing:0.2em;text-transform:uppercase;color:#00D4FF;">Facto · Verificación</p>
              <h1 style="margin:0;font-family:'Playfair Display',Georgia,serif;font-size:36px;font-weight:700;color:#ffffff;line-height:1.15;letter-spacing:-0.5px;">
                ¡Tu startup fue<br/>aprobada! 🎉
              </h1>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding:32px 40px 0 40px;">
              <div style="height:1px;background:linear-gradient(90deg, transparent, rgba(0,212,255,0.3), transparent);"></div>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px 40px;">
              <p style="margin:0 0 16px 0;font-size:15px;font-weight:300;color:#a0a0b0;line-height:1.7;letter-spacing:0.03em;">
                El equipo de <span style="color:#ffffff;font-weight:400;">Facto</span> ha revisado y aprobado
                <strong style="color:#ffffff;font-weight:600;">${name}</strong>.
                Tu página ya es <span style="color:#00D4FF;">visible en el ranking público</span>.
              </p>
              <p style="margin:0 0 32px 0;font-size:14px;font-weight:300;color:#606070;line-height:1.7;letter-spacing:0.03em;">
                Si quieres mostrar tu MRR real y hacer tu perfil más completo,
                conecta tu proveedor de pagos desde tu página de Facto.
              </p>

              <!-- CTA Button -->
              <table cellpadding="0" cellspacing="0" style="margin:0 auto;">
                <tr>
                  <td align="center" style="border-radius:999px;background-color:#ffffff;box-shadow:0 0 20px rgba(0,212,255,0.35),0 0 40px rgba(0,212,255,0.15);">
                    <a href="${profileUrl}" target="_blank"
                      style="display:inline-block;padding:14px 32px;font-size:11px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:#030305;text-decoration:none;border-radius:999px;">
                      Ver tu página en Facto →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:0 40px 40px 40px;text-align:center;border-top:1px solid rgba(255,255,255,0.04);">
              <p style="margin:24px 0 0 0;font-size:11px;font-weight:300;color:#40404f;letter-spacing:0.08em;">
                Hecho por <a href="https://www.instagram.com/a_dev_says/" style="color:#40404f;text-decoration:none;">Adevsays</a>
                &nbsp;·&nbsp;
                <a href="${siteUrl}" style="color:#40404f;text-decoration:none;">${siteUrl.replace('https://', '')}</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

function buildRejectionEmail(name: string, siteUrl: string): string {
  const retryUrl = siteUrl
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Actualización sobre tu startup en Facto</title>
</head>
<body style="margin:0;padding:0;background-color:#030305;font-family:'Inter',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#030305;padding:48px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:580px;background-color:#0a0a0f;border:1px solid rgba(255,255,255,0.06);border-radius:16px;overflow:hidden;">

          <!-- Header -->
          <tr>
            <td style="padding:40px 40px 0 40px;text-align:center;">
              <p style="margin:0 0 28px 0;font-size:11px;font-weight:500;letter-spacing:0.2em;text-transform:uppercase;color:#f87171;">Facto · Revisión</p>
              <h1 style="margin:0;font-family:'Playfair Display',Georgia,serif;font-size:34px;font-weight:700;color:#ffffff;line-height:1.2;letter-spacing:-0.5px;">
                Tu startup no fue<br/>aprobada esta vez
              </h1>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding:32px 40px 0 40px;">
              <div style="height:1px;background:linear-gradient(90deg, transparent, rgba(248,113,113,0.25), transparent);"></div>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px 40px;">
              <p style="margin:0 0 16px 0;font-size:15px;font-weight:300;color:#a0a0b0;line-height:1.7;letter-spacing:0.03em;">
                Lamentamos informarte que <strong style="color:#ffffff;font-weight:600;">${name}</strong>
                no ha pasado la revisión del equipo de <span style="color:#ffffff;font-weight:400;">Facto</span>.
              </p>
              <p style="margin:0 0 16px 0;font-size:14px;font-weight:300;color:#606070;line-height:1.7;letter-spacing:0.03em;">
                Esto puede deberse a información incompleta o a que la startup no cumple
                con los criterios actuales de la plataforma.
              </p>
              <p style="margin:0 0 32px 0;font-size:14px;font-weight:300;color:#606070;line-height:1.7;letter-spacing:0.03em;">
                Si crees que es un error o quieres volver a intentarlo con información más completa,
                puedes volver a enviar tu startup desde Facto.
              </p>

              <!-- CTA Button -->
              <table cellpadding="0" cellspacing="0" style="margin:0 auto;">
                <tr>
                  <td align="center" style="border-radius:999px;border:1px solid rgba(248,113,113,0.4);">
                    <a href="${retryUrl}" target="_blank"
                      style="display:inline-block;padding:14px 32px;font-size:11px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:#f87171;text-decoration:none;border-radius:999px;">
                      Volver a intentarlo →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:0 40px 40px 40px;text-align:center;border-top:1px solid rgba(255,255,255,0.04);">
              <p style="margin:24px 0 0 0;font-size:11px;font-weight:300;color:#40404f;letter-spacing:0.08em;">
                Hecho por <a href="https://www.instagram.com/a_dev_says/" style="color:#40404f;text-decoration:none;">Adevsays</a>
                &nbsp;·&nbsp;
                <a href="${siteUrl}" style="color:#40404f;text-decoration:none;">${siteUrl.replace('https://', '')}</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

export default defineEventHandler(async (event) => {
  const body = await readBody<{ saasId: string; action: 'approve' | 'reject' }>(event)

  if (!body.saasId || !['approve', 'reject'].includes(body.action)) {
    throw createError({ statusCode: 400, message: 'saasId and action (approve|reject) are required' })
  }

  const { data: entry, error } = await supabase
    .from('saas_entries')
    .select('id, name, slug, founder_email, status')
    .eq('id', body.saasId)
    .single()

  if (error || !entry) {
    throw createError({ statusCode: 404, message: 'Startup not found' })
  }

  if (entry.status !== 'pending_review') {
    throw createError({ statusCode: 409, message: `Startup is already '${entry.status}', cannot review` })
  }

  const newStatus = body.action === 'approve' ? 'published' : 'rejected'

  const { error: updateError } = await supabase
    .from('saas_entries')
    .update({
      status: newStatus,
      ...(body.action === 'approve' ? { published_at: new Date().toISOString() } : {})
    })
    .eq('id', body.saasId)

  if (updateError) {
    throw createError({ statusCode: 500, message: updateError.message })
  }

  if (entry.founder_email) {
    const saasName = entry.name || 'Tu startup'
    const config = useRuntimeConfig()
    const siteUrl = config.public.siteUrl || 'https://factosaas.com'

    if (body.action === 'approve') {
      sendFoundersReport({
        to: entry.founder_email,
        subject: `¡${saasName} ha sido aprobada en Facto!`,
        html: buildApprovalEmail(saasName, entry.slug, siteUrl)
      }).catch(e => console.error('[Review] Error sending approval email:', e))
    } else {
      sendFoundersReport({
        to: entry.founder_email,
        subject: `Actualización sobre ${saasName} en Facto`,
        html: buildRejectionEmail(saasName, siteUrl)
      }).catch(e => console.error('[Review] Error sending rejection email:', e))
    }
  }

  return { success: true, saasId: body.saasId, status: newStatus }
})
