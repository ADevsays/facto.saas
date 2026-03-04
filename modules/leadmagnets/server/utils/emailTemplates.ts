import type { Tip } from '../../const/tips'

export interface EmailReportData {
    email: string
    valuation: string
    ranking: number
    chartUrl: string
    tips: Tip[]
    projections: {
        current: string
        optimized: string
        metric: string
    }
}

export const generateReportHtml = (data: EmailReportData) => {
    const { valuation, ranking, chartUrl, tips, projections } = data

    const isGood = ranking <= 20
    const isAverage = ranking > 20 && ranking <= 50
    const rankLabel = isGood ? 'ÉLITE' : (isAverage ? 'SÓLIDO' : 'POTENCIAL')
    const rankColor = isGood ? '#00D4FF' : (isAverage ? '#FFD400' : '#FF4B4B')
    const visualPercent = 100 - ranking

    const BG = '#030305'
    const CARD_BG = '#0A0A0C'
    const BORDER = '#1a1a20'
    const TEXT = '#ffffff'
    const TEXT_MUTED = '#888899'
    const CYAN = '#00D4FF'

    return `<!DOCTYPE html>
<html lang="es" xmlns="http://www.w3.org/1999/xhtml">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>Tu Reporte de Valoración SaaS · Facto</title>
    <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,700&family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
    <!--[if mso]>
    <style>* { font-family: Arial, sans-serif !important; }</style>
    <![endif]-->
</head>
<body style="margin:0;padding:0;background-color:${BG};" bgcolor="${BG}">

<!-- Wrapper table para que bgcolor funcione en todos los clientes -->
<table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${BG}" style="background-color:${BG};min-height:100vh;">
<tr><td align="center" style="padding:40px 16px;">

    <!-- Contenedor principal -->
    <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;">

        <!-- LOGO -->
        <tr>
            <td align="center" style="padding-bottom:40px;">
                <a href="https://facto-saas.vercel.app" style="font-family:'Inter',Arial,sans-serif;font-size:20px;font-weight:700;letter-spacing:0.15em;color:${TEXT};text-decoration:none;">FACTO</a>
            </td>
        </tr>

        <!-- HERO CARD -->
        <tr>
            <td bgcolor="${CARD_BG}" style="background-color:${CARD_BG};border:1px solid ${BORDER};border-radius:24px;padding:48px 32px;text-align:center;">
                <p style="font-family:'Inter',Arial,sans-serif;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.25em;color:${TEXT_MUTED};margin:0 0 16px 0;">Valoración de Mercado</p>
                <p style="font-family:'Playfair Display','Georgia',serif;font-size:52px;font-weight:700;font-style:italic;color:${TEXT};margin:0 0 32px 0;line-height:1;">${valuation}</p>

                <!-- Ranking text -->
                <p style="font-family:'Playfair Display','Georgia',serif;font-size:16px;color:${TEXT};margin:0 0 12px 0;text-align:left;">
                    Estás en el <strong>Top ${ranking}%</strong> del mercado
                </p>

                <!-- Ranking bar usando tabla -->
                <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:10px;">
                    <tr>
                        <!-- Parte rellena -->
                        <td width="${visualPercent}%" bgcolor="${rankColor}" style="background-color:${rankColor};height:8px;border-radius:10px 0 0 10px;line-height:8px;font-size:1px;">&nbsp;</td>
                        <!-- Parte vacía -->
                        <td width="${100 - visualPercent}%" bgcolor="#1e1e28" style="background-color:#1e1e28;height:8px;border-radius:0 10px 10px 0;line-height:8px;font-size:1px;">&nbsp;</td>
                    </tr>
                </table>

                <!-- Eje del ranking -->
                <table width="100%" cellpadding="0" cellspacing="0" border="0">
                    <tr>
                        <td style="font-family:'Inter',Arial,sans-serif;font-size:10px;font-weight:700;color:${TEXT_MUTED};text-align:left;letter-spacing:0.05em;">MERCADO</td>
                        <td style="font-family:'Inter',Arial,sans-serif;font-size:10px;font-weight:900;color:${rankColor};text-align:center;letter-spacing:0.05em;">${rankLabel}</td>
                        <td style="font-family:'Inter',Arial,sans-serif;font-size:10px;font-weight:700;color:${TEXT_MUTED};text-align:right;letter-spacing:0.05em;">ÉLITE</td>
                    </tr>
                </table>
            </td>
        </tr>

        <!-- SPACER -->
        <tr><td style="height:40px;"></td></tr>

        <!-- SECCIÓN: Análisis de Distribución -->
        <tr>
            <td>
                <p style="font-family:'Inter',Arial,sans-serif;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.2em;color:${TEXT_MUTED};margin:0 0 20px 0;border-bottom:1px solid ${BORDER};padding-bottom:12px;">Análisis de Distribución</p>
            </td>
        </tr>
        <tr>
            <td bgcolor="#000000" style="background-color:#000000;border:1px solid ${BORDER};border-radius:16px;overflow:hidden;padding:0;">
                <img src="${chartUrl}" alt="Tu posición en el mercado" width="600" style="width:100%;max-width:600px;display:block;border:0;">
            </td>
        </tr>

        <!-- SPACER -->
        <tr><td style="height:40px;"></td></tr>

        <!-- SECCIÓN: Plan de Optimización -->
        <tr>
            <td>
                <p style="font-family:'Inter',Arial,sans-serif;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.2em;color:${TEXT_MUTED};margin:0 0 20px 0;border-bottom:1px solid ${BORDER};padding-bottom:12px;">Plan de Optimización</p>
            </td>
        </tr>
        <tr>
            <td bgcolor="${CARD_BG}" style="background-color:${CARD_BG};border:1px solid #003344;border-radius:16px;padding:28px;">
                <p style="font-family:'Inter',Arial,sans-serif;font-size:16px;line-height:1.7;color:#ccddee;margin:0;">
                    Al optimizar tu <strong style="color:${TEXT};">${projections.metric}</strong>, el valor de tu SaaS 
                    podría escalar de <strong style="color:${CYAN};">${valuation}</strong> 
                    a <strong style="color:${CYAN};">${projections.optimized}</strong>.
                </p>
            </td>
        </tr>

        <!-- SPACER -->
        <tr><td style="height:40px;"></td></tr>

        <!-- SECCIÓN: Estrategias -->
        <tr>
            <td>
                <p style="font-family:'Inter',Arial,sans-serif;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.2em;color:${TEXT_MUTED};margin:0 0 20px 0;border-bottom:1px solid ${BORDER};padding-bottom:12px;">Estrategias Recomendadas</p>
            </td>
        </tr>

        ${tips.map(tip => `
        <tr>
            <td bgcolor="${CARD_BG}" style="background-color:${CARD_BG};border:1px solid ${BORDER};border-radius:16px;padding:28px;margin-bottom:20px;">
                <p style="font-family:'Inter',Arial,sans-serif;font-size:11px;font-weight:700;color:${CYAN};text-transform:uppercase;letter-spacing:0.1em;margin:0 0 10px 0;">${tip.concept}</p>
                <p style="font-family:'Playfair Display','Georgia',serif;font-size:20px;font-weight:700;color:${TEXT};margin:0 0 10px 0;">${tip.title}</p>
                <p style="font-family:'Inter',Arial,sans-serif;font-size:14px;line-height:1.7;color:${TEXT_MUTED};margin:0 0 20px 0;">${tip.explanation}</p>
                <table width="100%" cellpadding="0" cellspacing="0" border="0">
                    <tr>
                        <td bgcolor="#001a22" style="background-color:#001a22;border-radius:10px;padding:14px 16px;">
                            <p style="font-family:'Inter',Arial,sans-serif;font-size:11px;font-weight:700;color:${CYAN};margin:0 0 6px 0;">PRÓXIMO PASO</p>
                            <p style="font-family:'Inter',Arial,sans-serif;font-size:14px;line-height:1.6;color:${TEXT};margin:0;">${tip.actionable}</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
        <tr><td style="height:20px;"></td></tr>
        `).join('')}

        <!-- FOOTER -->
        <tr>
            <td style="border-top:1px solid ${BORDER};padding-top:32px;padding-bottom:20px;text-align:center;">
                <p style="font-family:'Inter',Arial,sans-serif;font-size:11px;color:${TEXT_MUTED};margin:0;">&copy; 2026 Facto. Demuestra que tu MRR es real.</p>
            </td>
        </tr>

    </table>

</td></tr>
</table>

</body>
</html>`
}

