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
  const greeting = founderName ? `Hola, ${founderName},` : 'Hola,'

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${startupName} ya está en Facto</title>
</head>
<body style="margin:0;padding:32px 20px;background-color:#030305;color:#E5E7EB;font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;line-height:1.6;-webkit-font-smoothing:antialiased;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">Tu startup ${startupName} ya está registrada en Facto. Inicia sesión con un código OTP de 6 dígitos para editar tu perfil y métricas desde el dashboard.</div>
  <div style="max-width:560px;margin:0 auto;">
    <p style="margin:0 0 28px;color:#00D4FF;font-size:12px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;">Facto · Bienvenida de Founder</p>
    <h1 style="margin:0 0 20px;font-family:'Playfair Display',Georgia,serif;font-size:26px;font-weight:600;color:#FFFFFF;line-height:1.3;">Te damos la bienvenida a Facto</h1>
    <p style="margin:0 0 18px;color:#FFFFFF;font-size:16px;">${greeting}</p>
    <p style="margin:0 0 18px;font-size:15px;color:#D1D5DB;">Tu startup <strong style="color:#FFFFFF;">${startupName}</strong> ya está registrada en el ranking global de Facto y cuenta con su ficha pública en <a href="${startupUrl}" style="color:#00D4FF;text-decoration:underline;">${startupUrl}</a>.</p>
    <p style="margin:0 0 12px;font-size:15px;color:#FFFFFF;font-weight:600;">Cómo funciona el inicio de sesión:</p>
    <p style="margin:0 0 18px;font-size:15px;color:#D1D5DB;">En Facto no usamos contraseñas. Para iniciar sesión, ingresa al dashboard (o haz clic en "Inicia sesión aquí" en el pie de página), introduce este mismo correo de fundador y te enviaremos un código temporal de 6 dígitos (OTP) para verificar tu identidad al instante.</p>
    <p style="margin:0 0 28px;font-size:15px;color:#D1D5DB;">Una vez dentro del dashboard podrás editar los datos de <strong style="color:#FFFFFF;">${startupName}</strong>, personalizar su propuesta de valor, problema que resuelve, stack tecnológico, canales de adquisición, repositorio de GitHub, preguntas frecuentes (FAQs), tu perfil de fundador y la conexión de tu pasarela de pagos.</p>
    <p style="margin:0 0 28px;">
      <a href="${dashboardUrl}" target="_blank" style="display:inline-block;padding:14px 28px;background-color:rgba(0,212,255,0.1);border:1px solid rgba(0,212,255,0.3);border-radius:8px;color:#00D4FF;text-decoration:none;font-size:14px;font-weight:600;letter-spacing:0.05em;text-transform:uppercase;">
        Entrar al Dashboard y editar mi startup →
      </a>
    </p>
    <p style="margin:0 0 28px;font-size:15px;color:#D1D5DB;">Un saludo,<br>El equipo de Facto</p>
    <p style="margin:0;color:#6B7280;font-size:12px;">Si tienes alguna duda, responde directamente a este correo. Para darte de baja, escribe a <a href="mailto:adevsaysinfo@gmail.com" style="color:#9CA3AF;">adevsaysinfo@gmail.com</a>.</p>
  </div>
</body>
</html>`
}

export async function sendFounderWelcomeEmail(params: WelcomeEmailParams) {
  try {
    await sendFoundersReport({
      to: params.to,
      subject: `Bienvenido a Facto: gestiona ${params.startupName} desde tu dashboard`,
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
