import fs from 'node:fs'
import path from 'node:path'
import { Webhook } from 'svix'
import { whopService } from '~/server/services/whop'
import { adsService } from '~/modules/ads/server/services/ads'
import { sendAdSetupConfirmationEmail } from '~/modules/ads/server/services/adEmail'

function resolveWebhookSecret(): string {
  try {
    const envPath = path.resolve(process.cwd(), '.env')
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf8')
      for (const line of content.split('\n')) {
        const trimmed = line.trim()
        if (!trimmed || trimmed.startsWith('#')) continue
        const idx = trimmed.indexOf('=')
        if (idx !== -1) {
          const key = trimmed.slice(0, idx).trim()
          const val = trimmed.slice(idx + 1).trim()
          if (key === 'WHOP_WEBHOOK_SECRET') {
            return val
          }
        }
      }
    }
  } catch {}

  return process.env.WHOP_WEBHOOK_SECRET?.trim() || ''
}

import crypto from 'node:crypto'

export default defineEventHandler(async (event) => {
  const body = await readRawBody(event) ?? ''
  const headers = getHeaders(event) as Record<string, string>
  const secret = resolveWebhookSecret()

  if (!secret) {
    throw createError({ statusCode: 500, statusMessage: 'WHOP_WEBHOOK_SECRET is missing' })
  }

  let payload: any

  try {
    const webhookId = headers['webhook-id'] || headers['svix-id']
    const webhookTimestamp = headers['webhook-timestamp'] || headers['svix-timestamp']
    const webhookSignature = headers['webhook-signature'] || headers['svix-signature']

    if (webhookId && webhookTimestamp && webhookSignature) {
      const toSign = `${webhookId}.${webhookTimestamp}.${body}`
      const hmac = crypto.createHmac('sha256', secret).update(toSign).digest('base64')
      const expectedSig = `v1,${hmac}`
      const sigs = webhookSignature.split(' ')

      if (!sigs.includes(expectedSig) && !sigs.includes(hmac)) {
        throw new Error('HMAC signature mismatch')
      }
      payload = JSON.parse(body)
    } else {
      const b64Secret = Buffer.from(secret).toString('base64')
      const wh = new Webhook(b64Secret)
      payload = wh.verify(body, headers)
    }
  } catch (err: any) {
    console.error('[Whop Webhook] Signature verification failed:', err.message)
    throw createError({ statusCode: 401, statusMessage: 'Invalid webhook signature' })
  }

  const eventType = payload.type || payload.action || payload.event || ''

  if (eventType === 'membership.activated' || eventType === 'payment.succeeded' || eventType === 'payment.created') {
    const data = payload.data || {}
    const email = data.member?.user?.email
      || data.user?.email
      || data.member?.email
      || data.customer?.email
      || data.email
      || data.metadata?.email
      || data.checkout_configuration?.metadata?.email
      || ''

    const id = data.member?.user?.id
      || data.user?.id
      || data.user_id
      || data.member?.id
      || data.customer?.id
      || data.id
      || `usr_${Date.now()}`

    const membershipId = data.id
      || data.payment_id
      || data.membership?.id
      || data.member?.id
      || `pay_${Date.now()}`

    const setupToken = data.metadata?.setup_token
      || data.checkout_configuration?.metadata?.setup_token
      || data.membership?.metadata?.setup_token
      || data.payment?.metadata?.setup_token
      || data.custom_fields?.setup_token
      || crypto.randomUUID()

    const slot = Number(
      data.metadata?.slot
      || data.checkout_configuration?.metadata?.slot
      || data.membership?.metadata?.slot
      || 1
    )

    const price = Number(
      data.metadata?.price
      || data.checkout_configuration?.metadata?.price
      || data.membership?.metadata?.price
      || data.amount
      || 0
    )

    if (setupToken) {
      const cleanEmail = email ? email.trim().toLowerCase() : ''
      await whopService.activateMembership({ id, email: cleanEmail }, membershipId, setupToken)

      if (cleanEmail) {
        try {
          const siteUrl = process.env.NUXT_PUBLIC_SITE_URL || 'https://www.factosaas.com'
          const normalizedUrl = siteUrl.startsWith('http')
            ? siteUrl
            : (siteUrl.includes('localhost') ? `http://${siteUrl}` : `https://${siteUrl}`)
          const priceParam = price > 0 ? `&price=${price}` : ''
          const setupUrl = `${normalizedUrl}/?ad_setup=true&slot=${slot}&token=${setupToken}${priceParam}`

          await sendAdSetupConfirmationEmail({
            to: cleanEmail,
            slot,
            setupUrl,
            price: price > 0 ? price : 15
          })
        } catch (mailErr) {
          console.error('[Whop Webhook] Failed to send setup confirmation email:', mailErr)
        }
      }
    }
  }

  if (payload.type === 'membership.deactivated') {
    const { data: membership } = payload
    const userId = membership?.user?.id || membership?.user_id || membership?.member?.id

    if (userId) {
      await whopService.deactivateMembership(userId)
    }
    if (membership?.id) {
      await adsService.deactivateAdByMembershipId(membership.id)
    }
  }

  return { ok: true }
})
