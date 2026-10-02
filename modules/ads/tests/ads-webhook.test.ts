import { describe, it } from 'node:test'
import assert from 'node:assert'
import crypto from 'node:crypto'

function verifyHmacSignature(rawBody: string, headers: Record<string, string>, secret: string): boolean {
  const webhookId = headers['webhook-id'] || headers['svix-id']
  const webhookTimestamp = headers['webhook-timestamp'] || headers['svix-timestamp']
  const webhookSignature = headers['webhook-signature'] || headers['svix-signature']

  if (!webhookId || !webhookTimestamp || !webhookSignature) {
    return false
  }

  const toSign = `${webhookId}.${webhookTimestamp}.${rawBody}`
  const hmac = crypto.createHmac('sha256', secret).update(toSign).digest('base64')
  const expectedSig = `v1,${hmac}`
  const sigs = webhookSignature.split(' ')

  return sigs.includes(expectedSig) || sigs.includes(hmac)
}

function parseWebhookEvent(payload: any) {
  const eventType = payload.type || payload.action || payload.event || ''
  const data = payload.data || {}

  const email = data.user?.email || data.member?.email || data.email || data.metadata?.email || null
  const id = data.user?.id || data.user_id || data.member?.id || data.id || null
  const membershipId = data.id || data.member?.id || null

  const setupToken = data.metadata?.setup_token
    || data.checkout_configuration?.metadata?.setup_token
    || data.membership?.metadata?.setup_token
    || data.payment?.metadata?.setup_token
    || data.custom_fields?.setup_token
    || null

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

  return {
    eventType,
    email: email ? email.trim().toLowerCase() : null,
    id,
    membershipId,
    setupToken,
    slot,
    price
  }
}

describe('Whop Webhook Verification & Event Extraction', () => {
  const secret = 'whsec_test_secret_key_123456789'

  it('should successfully verify valid Svix HMAC signature', () => {
    const rawBody = JSON.stringify({ type: 'payment.succeeded', data: { amount: 15 } })
    const webhookId = 'msg_test123'
    const webhookTimestamp = String(Math.floor(Date.now() / 1000))

    const toSign = `${webhookId}.${webhookTimestamp}.${rawBody}`
    const hmac = crypto.createHmac('sha256', secret).update(toSign).digest('base64')
    const headers = {
      'webhook-id': webhookId,
      'webhook-timestamp': webhookTimestamp,
      'webhook-signature': `v1,${hmac}`
    }

    const isValid = verifyHmacSignature(rawBody, headers, secret)
    assert.strictEqual(isValid, true)
  })

  it('should reject invalid or tampered signature', () => {
    const rawBody = JSON.stringify({ type: 'payment.succeeded', data: { amount: 15 } })
    const headers = {
      'webhook-id': 'msg_test123',
      'webhook-timestamp': '1600000000',
      'webhook-signature': 'v1,invalid_hmac_signature'
    }

    const isValid = verifyHmacSignature(rawBody, headers, secret)
    assert.strictEqual(isValid, false)
  })

  it('should extract email, setupToken, slot, and price from payment.succeeded payload', () => {
    const mockPayload = {
      type: 'payment.succeeded',
      data: {
        id: 'pay_999',
        user: {
          id: 'usr_founder1',
          email: 'Founder@MyStartup.com'
        },
        metadata: {
          setup_token: '87654321-4321-4321-4321-210987654321',
          slot: '5',
          price: '25'
        }
      }
    }

    const extracted = parseWebhookEvent(mockPayload)
    assert.strictEqual(extracted.eventType, 'payment.succeeded')
    assert.strictEqual(extracted.email, 'founder@mystartup.com')
    assert.strictEqual(extracted.id, 'usr_founder1')
    assert.strictEqual(extracted.membershipId, 'pay_999')
    assert.strictEqual(extracted.setupToken, '87654321-4321-4321-4321-210987654321')
    assert.strictEqual(extracted.slot, 5)
    assert.strictEqual(extracted.price, 25)
  })
})
