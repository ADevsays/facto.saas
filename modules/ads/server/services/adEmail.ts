import nodemailer from 'nodemailer'

const host = (process.env.BREVO_HOST || 'smtp-relay.brevo.com').trim()
const port = parseInt(process.env.BREVO_PORT || '587')
const user = (process.env.BREVO_USER || '').trim()
const pass = (process.env.BREVO_PASS || '').trim()

const transporter = nodemailer.createTransport({
  host,
  port,
  secure: false,
  auth: { user, pass },
  tls: {
    rejectUnauthorized: true,
    checkServerIdentity: () => undefined
  }
})

export interface OutbidNotificationParams {
  to: string
  slot: number
  oldPrice: number
  newPrice: number
  adName: string
  lang?: 'es' | 'en'
}

export async function sendOutbidNotification(params: OutbidNotificationParams) {
  const { to, slot, oldPrice, newPrice, adName, lang = 'es' } = params
  const isEn = lang === 'en'
  const siteUrl = process.env.NUXT_PUBLIC_SITE_URL || 'https://www.factosaas.com'
  const normalizedUrl = siteUrl.startsWith('http') ? siteUrl : `https://${siteUrl}`
  const reclaimUrl = isEn ? `${normalizedUrl}/en?ad_slot=${slot}` : `${normalizedUrl}/?ad_slot=${slot}`

  const subject = isEn
    ? `Your ad on Facto was outbid (Spot #${slot})`
    : `Han superado tu anuncio en Facto (Puesto #${slot})`

  const subtitle = isEn ? 'Top Header &bull; Ad Auction' : 'Banda Superior &bull; Subasta de Anuncios'
  const title = isEn ? 'Your ad was outbid in the auction' : 'Tu anuncio ha sido superado en la subasta'
  const greeting = isEn
    ? `Hello, your ad for <strong style="color: #FFFFFF;">${adName}</strong> on <strong style="color: #00D4FF;">Spot #${slot}</strong> has received a higher bid and is temporarily inactive.`
    : `Hola, tu anuncio para <strong style="color: #FFFFFF;">${adName}</strong> en el <strong style="color: #00D4FF;">Puesto #${slot}</strong> de la banda superior ha recibido una nueva puja superior y ha dejado de estar activo temporalmente.`
  const prevBidLabel = isEn ? 'Your previous bid' : 'Tu puja anterior'
  const newBidLabel = isEn ? 'New winning bid' : 'Nueva puja ganadora'
  const explanation = isEn
    ? `Top bar slots are allocated in real time. You can reclaim <strong style="color: #FFFFFF;">Spot #${slot}</strong> right now by bidding the next increment ($${newPrice + 1} USD).`
    : `Los cupos de la banda superior se asignan en tiempo real. Puedes recuperar el <strong style="color: #FFFFFF;">Puesto #${slot}</strong> ahora mismo pujando por el siguiente incremento ($${newPrice + 1} USD).`
  const ctaButton = isEn ? `Reclaim my Spot #${slot} &rarr;` : `Recuperar mi Puesto #${slot} &rarr;`
  const footerText = isEn ? 'Facto &bull; Transparent ranking for SaaS and startups.' : 'Facto &bull; El ranking transparente de SaaS y startups.'

  const html = `
<!DOCTYPE html>
<html lang="${isEn ? 'en' : 'es'}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #030305; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #E5E7EB; -webkit-font-smoothing: antialiased;">
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #030305;">
    <tr>
      <td align="center" style="padding: 40px 16px;">
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 580px; background-color: #0c0c10; border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 20px; overflow: hidden;">
          <tr>
            <td style="padding: 36px 36px 20px 36px; text-align: center; border-bottom: 1px solid rgba(255, 255, 255, 0.05);">
              <span style="display: inline-block; font-family: 'Playfair Display', Georgia, serif; font-size: 26px; font-weight: 700; color: #FFFFFF; letter-spacing: -0.02em;">
                Facto<span style="color: #00D4FF;">.</span>
              </span>
              <p style="margin: 6px 0 0 0; font-size: 11px; text-transform: uppercase; letter-spacing: 0.15em; color: #00D4FF; font-weight: 600;">
                ${subtitle}
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding: 36px;">
              <h1 style="margin: 0 0 16px 0; font-family: 'Playfair Display', Georgia, serif; font-size: 22px; line-height: 1.3; color: #FFFFFF; font-weight: 600;">
                ${title}
              </h1>
              <p style="margin: 0 0 20px 0; font-size: 14px; line-height: 1.6; color: #9CA3AF;">
                ${greeting}
              </p>

              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 24px 0; background-color: #14141c; border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 14px;">
                <tr>
                  <td style="padding: 20px; text-align: center; width: 50%; border-right: 1px solid rgba(255, 255, 255, 0.06);">
                    <div style="font-size: 10px; text-transform: uppercase; letter-spacing: 0.1em; color: #6B7280; margin-bottom: 6px;">${prevBidLabel}</div>
                    <div style="font-size: 20px; font-family: monospace; font-weight: 700; color: #9CA3AF;">$${oldPrice} USD</div>
                  </td>
                  <td style="padding: 20px; text-align: center; width: 50%;">
                    <div style="font-size: 10px; text-transform: uppercase; letter-spacing: 0.1em; color: #00D4FF; margin-bottom: 6px;">${newBidLabel}</div>
                    <div style="font-size: 20px; font-family: monospace; font-weight: 700; color: #00D4FF;">$${newPrice} USD</div>
                  </td>
                </tr>
              </table>

              <p style="margin: 0 0 28px 0; font-size: 13px; line-height: 1.6; color: #9CA3AF;">
                ${explanation}
              </p>

              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center">
                    <a href="${reclaimUrl}" target="_blank" style="display: inline-block; background-color: #00D4FF; color: #030305; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; text-decoration: none; padding: 14px 32px; border-radius: 12px; box-shadow: 0 0 25px rgba(0, 212, 255, 0.35);">
                      ${ctaButton}
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding: 20px 36px 32px 36px; border-top: 1px solid rgba(255, 255, 255, 0.05); text-align: center;">
              <p style="margin: 0; font-size: 11px; color: #4B5563;">
                ${footerText}
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`

  try {
    return await transporter.sendMail({
      from: '"Facto" <oficial@adevsays.com>',
      to,
      subject,
      html,
      headers: {
        'X-Mailin-TrackLinks': 'false'
      }
    })
  } catch (err) {
    console.error('[Ad Email Service] Error sending outbid email:', err)
  }
}

export interface AdSetupConfirmationParams {
  to: string
  slot: number
  setupUrl: string
  price?: number
}

export async function sendAdSetupConfirmationEmail(params: AdSetupConfirmationParams) {
  const { to, slot, setupUrl, price = 15 } = params

  const formattedDate = new Intl.DateTimeFormat('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(new Date())

  const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Tu cupo en la banda superior está reservado</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F8FAFC; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #0F172A; -webkit-font-smoothing: antialiased;">
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #F8FAFC;">
    <tr>
      <td align="center" style="padding: 40px 16px;">
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 560px; background-color: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);">
          <tr>
            <td style="padding: 32px 36px 20px 36px; border-bottom: 1px solid #F1F5F9;">
              <span style="font-family: 'Playfair Display', Georgia, serif; font-size: 24px; font-weight: 700; color: #0F172A; letter-spacing: -0.02em;">
                Facto<span style="color: #00D4FF;">.</span>
              </span>
            </td>
          </tr>

          <tr>
            <td style="padding: 32px 36px;">
              <div style="display: inline-block; background-color: #E0F7FA; color: #00838F; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; padding: 4px 12px; border-radius: 9999px; margin-bottom: 18px;">
                Pago confirmado
              </div>

              <h1 style="margin: 0 0 14px 0; font-family: 'Playfair Display', Georgia, serif; font-size: 24px; line-height: 1.3; color: #0F172A; font-weight: 700;">
                Tu cupo en la banda superior está reservado
              </h1>

              <p style="margin: 0 0 24px 0; font-size: 14px; line-height: 1.6; color: #475569;">
                Gracias por tu compra. Solo falta que completes los datos de tu startup para que tu anuncio se publique.
              </p>

              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; margin-bottom: 24px; padding: 6px 16px;">
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid #EDF2F7; font-size: 13px; color: #64748B;">
                    Puesto
                  </td>
                  <td align="right" style="padding: 10px 0; border-bottom: 1px solid #EDF2F7; font-size: 13px; font-weight: 700; color: #0F172A;">
                    Banda superior #${slot}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid #EDF2F7; font-size: 13px; color: #64748B;">
                    Importe pagado
                  </td>
                  <td align="right" style="padding: 10px 0; border-bottom: 1px solid #EDF2F7; font-size: 14px; font-weight: 700; color: #0F172A;">
                    $${price}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; font-size: 13px; color: #64748B;">
                    Fecha
                  </td>
                  <td align="right" style="padding: 10px 0; font-size: 13px; color: #0F172A; font-weight: 500;">
                    ${formattedDate}
                  </td>
                </tr>
              </table>

              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 10px;">
                <tr>
                  <td align="center">
                    <a href="${setupUrl}" target="_blank" style="display: block; width: 100%; box-sizing: border-box; background-color: #00D4FF; color: #030305; font-size: 14px; font-weight: 700; text-align: center; text-decoration: none; padding: 14px 24px; border-radius: 12px; box-shadow: 0 2px 10px rgba(0, 212, 255, 0.25);">
                      Configurar mi anuncio
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 0 0 24px 0; font-size: 12px; color: #64748B; text-align: center;">
                Tu anuncio se publica en cuanto completes los datos.
              </p>

              <p style="margin: 0 0 8px 0; font-size: 12px; color: #64748B;">
                Si el botón no funciona, copia y pega este enlace en tu navegador:
              </p>
              <div style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 10px 14px; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 11px; color: #475569; word-break: break-all; line-height: 1.4;">
                ${setupUrl}
              </div>
            </td>
          </tr>

          <tr>
            <td style="padding: 24px 36px 32px 36px; border-top: 1px solid #F1F5F9;">
              <p style="margin: 0 0 6px 0; font-size: 12px; color: #64748B;">
                ¿Dudas? Escríbenos a <a href="mailto:adevsaysinfo@gmail.com" style="color: #0284C7; text-decoration: underline;">adevsaysinfo@gmail.com</a>.
              </p>
              <p style="margin: 0; font-size: 11px; color: #94A3B8; line-height: 1.5;">
                Recibes este correo porque compraste un puesto en Facto. &bull; Facto, el ranking transparente de SaaS y startups.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`

  try {
    return await transporter.sendMail({
      from: '"Facto" <oficial@adevsays.com>',
      to,
      subject: `Configura tu anuncio en Facto (Puesto #${slot})`,
      html,
      headers: {
        'X-Mailin-TrackLinks': 'false'
      }
    })
  } catch (err) {
    console.error('[Ad Email Service] Error sending setup confirmation email:', err)
  }
}

