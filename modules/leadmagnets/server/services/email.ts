import nodemailer from 'nodemailer'

const host = (process.env.BREVO_HOST || 'smtp-relay.brevo.com').trim()
const port = parseInt(process.env.BREVO_PORT || '587')
const user = (process.env.BREVO_USER || '').trim()
const pass = (process.env.BREVO_PASS || '').trim()

console.log('[Email Service] Diagnostic:', {
    host,
    port,
    userLength: user.length,
    passLength: pass.length,
    hasUser: !!user,
    hasPass: !!pass
})

const transporter = nodemailer.createTransport({
    host,
    port,
    secure: false, 
    auth: {
        user,
        pass,
    },
    debug: true,
    logger: true,
    tls: {
        rejectUnauthorized: true,
        checkServerIdentity: () => undefined
    }
})

// Verificar conexión al inicio
if (process.env.BREVO_USER && process.env.BREVO_PASS) {
    transporter.verify((error) => {
        if (error) {
            console.error('[Email Service] SMTP Connection Error:', error)
        } else {
            console.log('[Email Service] SMTP Server is ready')
        }
    })
} else {
    console.warn('[Email Service] Warning: SMTP credentials (BREVO_USER/PASS) are missing.')
}

export interface SendEmailParams {
    to: string
    subject: string
    html: string
}

export const sendFoundersReport = async (params: SendEmailParams) => {
    const { to, subject, html } = params

    try {
        const info = await transporter.sendMail({
            from: '"Adevsays" <oficial@adevsays.com>',
            to: to,
            subject: subject,
            html: html,
            headers: {
                'X-Mailin-TrackLinks': 'false'
            }
        })
        
        console.log('[Email Service] Email sent successfully via SMTP:', info.messageId)
        return info
    } catch (err) {
        console.error('[Email Service] Error sending via SMTP:', err)
        throw err
    }
}
