import nodemailer from 'nodemailer'

const host = (process.env.BREVO_HOST || 'smtp-relay.brevo.com').trim()
const port = parseInt(process.env.BREVO_PORT || '587')
const user = (process.env.BREVO_USER || '').trim()
const pass = (process.env.BREVO_PASS || '').trim()

const transporter = nodemailer.createTransport({
    host,
    port,
    secure: false, 
    auth: {
        user,
        pass,
    },
    tls: {
        rejectUnauthorized: true,
        checkServerIdentity: () => undefined
    }
})

export interface SendEmailParams {
    to: string
    subject: string
    html: string
    from?: string
}

export const sendFoundersReport = async (params: SendEmailParams) => {
    const { to, subject, html } = params

    try {
        const info = await transporter.sendMail({
            from: params.from || '"Facto" <oficial@adevsays.com>',
            to: to,
            subject: subject,
            html: html,
            headers: {
                'X-Mailin-TrackLinks': 'false'
            }
        })
        
        return info
    } catch (err) {
        console.error('[Email Service] Error sending via SMTP:', err)
        throw err
    }
}
