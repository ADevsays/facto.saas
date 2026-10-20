import { formatMilestone, getMilestoneBadgeUrl } from '../const/thresholds'

export function buildAchievementEmailHtml(
  saasName: string,
  milestone: number,
  saasSlug: string,
  logoUrl: string | null,
  lang: 'es' | 'en' = 'es'
): string {
  const formattedMilestone = formatMilestone(milestone)
  const isEn = lang === 'en'
  const saasUrl = isEn ? `https://factosaas.com/en/saas/${saasSlug}` : `https://factosaas.com/saas/${saasSlug}`
  const badgeUrl = getMilestoneBadgeUrl(milestone)
  const badgeAlt = isEn ? `Milestone of ${formattedMilestone} visits` : `Logro de ${formattedMilestone} visitas`

  const emailTitle = isEn
    ? `${saasName} reached ${formattedMilestone} visits on Facto`
    : `${saasName} alcanzó las ${formattedMilestone} visitas en Facto`

  const eyebrow = isEn ? 'Facto · Traction Milestone' : 'Facto · Hito de Tracción'
  const heading = isEn
    ? `${saasName} surpassed ${formattedMilestone} visits`
    : `${saasName} superó las ${formattedMilestone} visitas`

  const introText = isEn
    ? `Your public profile at <a href="${saasUrl}" style="color:#00D4FF;text-decoration:underline;">${saasUrl}</a> has just reached <strong style="color:#FFFFFF;">${formattedMilestone} visits</strong> from founders, builders, and investors browsing Facto.`
    : `La ficha pública de <strong style="color:#FFFFFF;">${saasName}</strong> en <a href="${saasUrl}" style="color:#00D4FF;text-decoration:underline;">${saasUrl}</a> acaba de superar las <strong style="color:#FFFFFF;">${formattedMilestone} visitas</strong> de fundadores, creadores e inversores que exploran Facto.`

  const boostBadge = isEn ? 'MULTIPLY YOUR TRACTION' : 'IMPULSA TU TRACCIÓN'
  const boostTitle = isEn
    ? 'Want to reach your next milestone faster?'
    : '¿Quieres alcanzar tu próximo hito más rápido?'
  const boostText = isEn
    ? `When a startup starts getting organic visits, visibility compounds. You can secure one of the 20 exclusive spots on the top marquee to keep <strong style="color:#FFFFFF;">${saasName}</strong> visible 24/7 at the top of every page on Facto.`
    : `Cuando una startup empieza a recibir atención orgánica, la visibilidad se multiplica. Puedes asegurar uno de los 20 puestos exclusivos en la marquesina superior para mantener a <strong style="color:#FFFFFF;">${saasName}</strong> visible 24/7 en la cabecera de todas las páginas de Facto.`

  const boostBtn = isEn ? 'BOOST VISITS WITH AN AD →' : 'IMPULSAR VISITAS CON UN ANUNCIO →'
  const boostUrl = isEn
    ? 'https://factosaas.com/en?action=buy_ad&utm_source=milestone_email&utm_medium=email&utm_campaign=boost_visits'
    : 'https://factosaas.com?action=buy_ad&utm_source=milestone_email&utm_medium=email&utm_campaign=boost_visits'

  const sharePrompt = isEn
    ? 'If you prefer to share this milestone with your community, you can view and share your public page here:'
    : 'Si prefieres compartir este logro con tu comunidad, puedes ver tu insignia en tu ficha pública:'
  const ctaBtn = isEn ? 'SHARE THIS MILESTONE' : 'COMPARTE ESTE LOGRO'

  const signOff = isEn ? 'Best,<br>The Facto Team' : 'Un saludo,<br>El equipo de Facto'
  const footerNote = isEn
    ? 'If you have any questions, simply reply to this email. To unsubscribe, write to <a href="mailto:adevsaysinfo@gmail.com" style="color:#9CA3AF;">adevsaysinfo@gmail.com</a>.'
    : 'Si tienes preguntas, responde directamente a este correo. Para darte de baja, escribe a <a href="mailto:adevsaysinfo@gmail.com" style="color:#9CA3AF;">adevsaysinfo@gmail.com</a>.'

  return `<!DOCTYPE html>
<html lang="${isEn ? 'en' : 'es'}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${emailTitle}</title>
</head>
<body style="margin:0;padding:32px 20px;background-color:#030305;color:#E5E7EB;font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;line-height:1.6;-webkit-font-smoothing:antialiased;">
  <div style="max-width:560px;margin:0 auto;">
    <p style="margin:0 0 24px;color:#00D4FF;font-size:12px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;">${eyebrow}</p>
    <h1 style="margin:0 0 20px;font-family:'Playfair Display',Georgia,serif;font-size:26px;font-weight:600;color:#FFFFFF;line-height:1.3;">${heading}</h1>
    <p style="margin:0 0 24px;font-size:15px;color:#D1D5DB;">${introText}</p>
    <div style="margin:0 0 28px;text-align:center;">
      <img src="${badgeUrl}" alt="${badgeAlt}" width="180" height="166" style="width:180px;height:166px;display:inline-block;border:0;object-fit:contain;" />
    </div>
    <p style="margin:0 0 8px;color:#00D4FF;font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;">${boostBadge}</p>
    <p style="margin:0 0 12px;font-size:16px;font-weight:600;color:#FFFFFF;">${boostTitle}</p>
    <p style="margin:0 0 24px;font-size:15px;color:#D1D5DB;">${boostText}</p>
    <p style="margin:0 0 28px;">
      <a href="${boostUrl}" target="_blank" style="display:inline-block;padding:14px 28px;background-color:rgba(0,212,255,0.1);border:1px solid rgba(0,212,255,0.3);border-radius:8px;color:#00D4FF;text-decoration:none;font-size:13px;font-weight:600;letter-spacing:0.05em;text-transform:uppercase;">
        ${boostBtn}
      </a>
    </p>
    <p style="margin:0 0 24px;font-size:14px;color:#9CA3AF;">
      ${sharePrompt} <a href="${saasUrl}" target="_blank" style="color:#E5E7EB;text-decoration:underline;">${ctaBtn}</a>${logoUrl ? ` <span style="display:none;">${logoUrl}</span>` : ''}
    </p>
    <p style="margin:0 0 28px;font-size:15px;color:#D1D5DB;">${signOff}</p>
    <p style="margin:0;color:#6B7280;font-size:12px;">${footerNote}</p>
  </div>
</body>
</html>`
}
