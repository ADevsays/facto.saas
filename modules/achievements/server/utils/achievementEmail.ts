import { formatMilestone } from '../const/thresholds'

export function buildAchievementEmailHtml(saasName: string, milestone: number, saasSlug: string): string {
  const formattedMilestone = formatMilestone(milestone)
  const saasUrl = `https://factosaas.com/saas/${saasSlug}`

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>¡${formattedMilestone} visitas!</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=Inter:wght@300;400;600&display=swap');
    body {
      margin: 0;
      padding: 0;
      background-color: #030305;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #E5E7EB;
    }
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
              <h2 style="margin: 0 0 8px 0; font-family: 'Playfair Display', Georgia, serif; font-size: 24px; font-weight: 600; color: #FFFFFF; text-align: center;">
                Tu SaaS está creciendo 🚀
              </h2>

              <p style="margin: 0 0 32px 0; font-size: 15px; line-height: 1.6; color: #9CA3AF; font-weight: 300; text-align: center;">
                ¡Enhorabuena! <strong style="color: #E5E7EB;">${saasName}</strong> ha superado las <strong style="color: #00D4FF;">${formattedMilestone}</strong> visitas en Facto.
              </p>

              <!-- Badge -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center" style="padding: 20px 0 40px 0;">
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center" style="width: 140px; height: 140px; background: linear-gradient(135deg, rgba(0, 212, 255, 0.15), rgba(0, 212, 255, 0.05)); border: 2px solid rgba(0, 212, 255, 0.4); border-radius: 20px; box-shadow: 0 0 40px rgba(0, 212, 255, 0.15), 0 0 80px rgba(0, 212, 255, 0.05);">
                          <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                            <tr>
                              <td align="center">
                                <span style="font-size: 14px; color: #9CA3AF; font-weight: 300; letter-spacing: 0.1em; text-transform: uppercase;">visitas</span>
                              </td>
                            </tr>
                            <tr>
                              <td align="center">
                                <span style="font-family: 'Inter', sans-serif; font-size: 36px; font-weight: 600; color: #00D4FF; letter-spacing: -0.02em;">${formattedMilestone}</span>
                              </td>
                            </tr>
                            <tr>
                              <td align="center">
                                <span style="font-size: 20px;">✦</span>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <p style="margin: 0 0 30px 0; font-size: 14px; line-height: 1.6; color: #6B7280; font-weight: 300; text-align: center;">
                Tu producto está ganando visibilidad en el ranking. Sigue construyendo.
              </p>

              <!-- CTA Button -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center">
                    <a href="${saasUrl}" target="_blank" style="display: inline-block; padding: 14px 28px; background-color: rgba(0, 212, 255, 0.1); border: 1px solid rgba(0, 212, 255, 0.3); border-radius: 8px; color: #00D4FF; text-decoration: none; font-size: 14px; font-weight: 600; letter-spacing: 0.05em; text-transform: uppercase;">
                      Ver mi SaaS
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
