import { sendFoundersReport } from '~/modules/leadmagnets/server/services/email'

interface WelcomeEmailParams {
  to: string
  startupName: string
  founderName?: string | null
  startupSlug: string
  siteUrl: string
}

export function buildFounderWelcomeEmailHtml({
  startupName,
  founderName,
  startupSlug,
  siteUrl
}: {
  startupName: string
  founderName?: string | null
  startupSlug: string
  siteUrl: string
}): string {
  const cleanSiteUrl = siteUrl.replace(/\/$/, '')
  const dashboardUrl = `${cleanSiteUrl}/dashboard`
  const startupUrl = `${cleanSiteUrl}/saas/${startupSlug}`
  const greeting = founderName ? `Hola ${founderName},` : '¡Hola!'

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>¡${startupName} está registrada en Facto!</title>
</head>
<body style="margin:0;padding:0;background-color:#030305;font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#E5E7EB;-webkit-font-smoothing:antialiased;">
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color:#030305;padding:40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px;background-color:#12121A;border:1px solid rgba(255,255,255,0.08);border-radius:16px;overflow:hidden;margin:0 auto;box-shadow:0 20px 50px rgba(0,0,0,0.6);">
          
          <!-- Header Facto -->
          <tr>
            <td align="center" style="padding:40px 20px 24px 20px;border-bottom:1px solid rgba(255,255,255,0.06);">
              <span style="font-family:'Inter',sans-serif;font-size:11px;font-weight:700;letter-spacing:0.25em;text-transform:uppercase;color:#00D4FF;display:block;margin-bottom:8px;">Facto · Ranking Global</span>
              <h1 style="margin:0;font-family:'Playfair Display',Georgia,serif;font-size:30px;font-weight:600;color:#FFFFFF;letter-spacing:0.02em;">¡Tu startup está en Facto!</h1>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding:36px 32px;">
              <p style="margin:0 0 16px 0;font-size:16px;line-height:1.6;color:#FFFFFF;font-weight:400;">
                ${greeting}
              </p>
              
              <p style="margin:0 0 24px 0;font-size:15px;line-height:1.6;color:#D1D5DB;font-weight:300;">
                Acabamos de registrar con éxito a <strong style="color:#00D4FF;font-weight:600;">${startupName}</strong> en el ranking global de Facto.
              </p>

              <!-- Startup Card -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color:#0A0A0F;border:1px solid rgba(255,255,255,0.06);border-radius:12px;margin:0 0 28px 0;">
                <tr>
                  <td style="padding:20px 24px;">
                    <div style="font-size:11px;font-family:'Inter',monospace;text-transform:uppercase;letter-spacing:0.15em;color:#9CA3AF;margin-bottom:6px;">Startup registrada</div>
                    <div style="font-size:18px;font-weight:600;color:#FFFFFF;margin-bottom:4px;">${startupName}</div>
                    <div style="font-size:13px;color:#00D4FF;word-break:break-all;">${startupUrl}</div>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 24px 0;font-size:14px;line-height:1.6;color:#D1D5DB;font-weight:300;">
                Al reclamarla como founder con este correo, puedes personalizar su perfil (propuesta de valor, FAQs, repo de GitHub, tech stack y canales de adquisición) y crear tu sesión activa en el panel de control.
              </p>

              <!-- Action CTA Button -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin:32px 0 20px 0;">
                <tr>
                  <td align="center">
                    <a href="${dashboardUrl}" target="_blank" style="display:inline-block;padding:16px 36px;background-color:#00D4FF;color:#030305;font-family:'Inter',sans-serif;font-size:13px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;text-decoration:none;border-radius:999px;box-shadow:0 0 25px rgba(0,212,255,0.4);">
                      Acceder a tu Dashboard →
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:24px 0 0 0;font-size:12px;line-height:1.6;color:#6B7280;text-align:center;">
                O si prefieres, también puedes ver su página pública directamente en <a href="${startupUrl}" style="color:#9CA3AF;text-decoration:underline;">este enlace</a>.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding:24px;background-color:#0A0A0F;border-top:1px solid rgba(255,255,255,0.06);">
              <p style="margin:0;font-size:11px;color:#6B7280;letter-spacing:0.05em;">
                © 2026 Facto · factosaas.com · Plataforma de Startups & Ranking MRR
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

export async function sendFounderWelcomeEmail(params: WelcomeEmailParams) {
  try {
    await sendFoundersReport({
      to: params.to,
      subject: `¡${params.startupName} ya está registrada en Facto! 🚀`,
      html: buildFounderWelcomeEmailHtml({
        startupName: params.startupName,
        founderName: params.founderName,
        startupSlug: params.startupSlug,
        siteUrl: params.siteUrl
      })
    })
  } catch (err) {
    console.error('[sendFounderWelcomeEmail] Failed to send email:', err)
  }
}
