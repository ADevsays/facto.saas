import { formatMilestone } from '../const/thresholds'

export function buildAchievementEmailHtml(saasName: string, milestone: number, saasSlug: string, logoUrl: string | null): string {
  const formattedMilestone = formatMilestone(milestone)
  const saasUrl = `https://factosaas.com/saas/${saasSlug}`
  const shareText = encodeURIComponent(`🚀 ¡${saasName} acaba de superar las ${formattedMilestone} visitas en @factosaas!\n\n${saasUrl}`)
  const twitterShareUrl = `https://twitter.com/intent/tweet?text=${shareText}`
  const linkedinShareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(saasUrl)}`

  const startupLogoBlock = logoUrl
    ? `<tr>
        <td align="center" style="padding: 0 0 8px 0;">
          <img src="${logoUrl}" alt="${saasName}" width="48" height="48" style="width: 48px; height: 48px; border-radius: 10px; object-fit: cover; display: block; pointer-events: none; user-select: none; -webkit-user-drag: none;" />
        </td>
      </tr>`
    : ''

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>¡${formattedMilestone} visitas!</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=Inter:wght@300;400;600&display=swap');
    body { margin: 0; padding: 0; background-color: #030305; }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #030305; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #E5E7EB; -webkit-font-smoothing: antialiased;">

  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #030305; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #12121A; border: 1px solid rgba(255, 255, 255, 0.05); border-radius: 12px; overflow: hidden; margin: 0 auto;">

          <!-- Header -->
          <tr>
            <td align="center" style="padding: 40px 20px 20px 20px; border-bottom: 1px solid rgba(255, 255, 255, 0.05);">
              <h1 style="margin: 0; font-family: 'Playfair Display', Georgia, serif; font-size: 28px; font-weight: 600; color: #FFFFFF; letter-spacing: 0.02em;">
                Facto
              </h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 40px 30px;">

              <!-- Title -->
              <h2 style="margin: 0 0 8px 0; font-family: 'Playfair Display', Georgia, serif; font-size: 24px; font-weight: 600; color: #FFFFFF; text-align: center;">
                Impacto en Facto
              </h2>
              <p style="margin: 0 0 6px 0; font-size: 15px; line-height: 1.6; color: #9CA3AF; font-weight: 300; text-align: center;">
                ¡Enhorabuena! <strong style="color: #E5E7EB;">${saasName}</strong> ha superado las <strong style="color: #00D4FF;">${formattedMilestone}</strong> visitas en Facto.
              </p>
              <p style="margin: 0 0 36px 0; font-size: 13px; color: #6B7280; text-align: center;">
                ${new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>

              <!-- Hexagonal Badge (Static Image) -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center" style="padding: 0 0 24px 0;">
                    <img src="${process.env.SUPABASE_URL}/storage/v1/object/public/achievements/v2/badge-${milestone}.png" alt="Logro de ${formattedMilestone} visitas" width="220" height="203" style="width: 220px; height: 203px; display: block; border: 0; object-fit: contain; pointer-events: none; user-select: none; -webkit-user-drag: none;" />
                  </td>
                </tr>
              </table>

              <!-- Startup Logo -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center" style="padding: 0 0 32px 0;">
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                      ${startupLogoBlock}
                      <tr>
                        <td align="center">
                          <span style="font-size: 13px; color: #6B7280; font-weight: 400;">${saasName}</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- CTA -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center" style="padding-top: 24px;">
                    <p style="margin: 0 0 16px 0; font-size: 14px; color: #9CA3AF;">
                      Comparte este logro con tu comunidad
                    </p>
                    <a href="${saasUrl}" style="display: inline-block; padding: 14px 28px; background-color: #061020; border: 1px solid #00D4FF; color: #00D4FF; text-decoration: none; font-size: 13px; font-weight: 600; font-family: 'Inter', sans-serif; letter-spacing: 0.05em; border-radius: 8px; text-transform: uppercase;">
                      COMPARTE ESTE LOGRO
                    </a>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding: 30px; background-color: #0A0A0F; border-top: 1px solid rgba(255, 255, 255, 0.05);">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding-bottom: 12px;">
                    <a href="https://factosaas.com" target="_blank" style="display: inline-block; padding: 8px 16px; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 6px; text-decoration: none; color: #9CA3AF; font-size: 12px; font-weight: 400;">
                      ▲ factosaas.com
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin: 0 0 10px 0; font-size: 12px; color: #6B7280;">
                © 2026 Facto. Todos los derechos reservados.
              </p>
              <p style="margin: 0; font-size: 11px; color: #4B5563;">
                Si tienes preguntas, simplemente responde a este correo.
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
