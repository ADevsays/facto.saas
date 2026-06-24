import { Webhook } from 'svix'
import { whopService } from '~/server/services/whop'
import { adsService } from '~/modules/ads/server/services/ads'

export default defineEventHandler(async (event) => {
  const body = await readRawBody(event) ?? ''
  const headers = getHeaders(event) as Record<string, string>
  const secret = process.env.WHOP_WEBHOOK_SECRET

  if (!secret) {
    throw createError({ statusCode: 500, statusMessage: 'WHOP_WEBHOOK_SECRET is missing' })
  }

  let payload: any

  try {
    const b64Secret = Buffer.from(secret).toString('base64')
    const wh = new Webhook(b64Secret)
    payload = wh.verify(body, headers)
  } catch (err: any) {
    console.error('Signature verification failed:', err.message)
    throw createError({ statusCode: 401, statusMessage: 'Invalid webhook signature' })
  }

  if (payload.type === 'membership.activated') {
    const { data: membership } = payload
    const user = membership.user

    if (!user?.email || !user?.id) return { ok: true }
    await whopService.activateMembership(user, membership.id)
  }

  if (payload.type === 'membership.deactivated') {
    const { data: membership } = payload
    const user = membership.user

    if (!user?.id) return { ok: true }
    await whopService.deactivateMembership(user.id)
    await adsService.deactivateAdByMembershipId(membership.id)
  }

  return { ok: true }
})
