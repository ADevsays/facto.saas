import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import type { CheckoutPayload } from '../../../types'
import { adsService } from '../../services/ads'

function resolveWhopApiKey(): string {
  const envVal = (process.env.WHOP_API_KEY || process.env.WHOP_APIKEY)?.trim()
  if (envVal) return envVal

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
          if (key === 'WHOP_API_KEY' || key === 'WHOP_APIKEY') {
            return val
          }
        }
      }
    }
  } catch {}

  return ''
}

export default defineEventHandler(async (event) => {
  const body = await readBody<CheckoutPayload>(event)

  if (!body || !body.slot) {
    throw createError({ statusCode: 400, statusMessage: 'El puesto (slot) es obligatorio.' })
  }

  const slot = Math.max(1, Math.min(20, Math.floor(body.slot)))
  
  // Calculate price based on current auction slot state
  const slots = await adsService.getAuctionSlots()
  const targetSlot = slots.find(s => s.position === slot)
  const basePrice = slot === 1 ? 10 : 1
  const minPrice = targetSlot
    ? (targetSlot.isAvailable ? targetSlot.currentPrice : targetSlot.nextPrice)
    : basePrice

  if (body.price !== undefined && body.price !== null) {
    const requestedPrice = Number(body.price)
    if (isNaN(requestedPrice) || requestedPrice < minPrice) {
      throw createError({
        statusCode: 400,
        statusMessage: `La puja enviada ($${requestedPrice} USD) es menor a la base mínima requerida ($${minPrice} USD) para el puesto ${slot}.`
      })
    }
  }

  const price = Math.max(minPrice, Math.floor(Number(body.price) || minPrice))

  const setupToken = crypto.randomUUID()

  const config = useRuntimeConfig()
  const siteUrl = config.public.siteUrl || 'https://www.factosaas.com'
  const isHttps = siteUrl.startsWith('https://')
  const baseUrl = isHttps ? siteUrl : 'https://www.factosaas.com'
  const redirectUrl = `${baseUrl}/dashboard/ads?ad_setup=true&slot=${slot}&price=${price}&token=${setupToken}`

  const whopApiKey = resolveWhopApiKey()
  const whopAccountId = (process.env.WHOP_ACCOUNT_ID || 'biz_LGcptk06n8Q82U').trim()
  const whopProductId = (process.env.WHOP_PRODUCT_ID || 'prod_7A3GOWDazvmNj').trim()
  let checkoutUrl = ''

  if (whopApiKey) {
    try {
      let existingPlanId: string | undefined
      try {
        const plansRes = await $fetch<any>(`https://api.whop.com/api/v1/plans?account_id=${whopAccountId}&product_id=${whopProductId}`, {
          headers: { Authorization: `Bearer ${whopApiKey}` }
        })
        const match = plansRes?.data?.find((p: any) => p.plan_type === 'one_time' && Number(p.initial_price) === price)
        if (match) {
          existingPlanId = match.id
        }
      } catch {}

      const checkoutBody: Record<string, any> = {
        account_id: whopAccountId,
        redirect_url: redirectUrl,
        metadata: {
          setup_token: setupToken,
          slot: String(slot),
          price: String(price),
          email: body.email || ''
        }
      }

      if (existingPlanId) {
        checkoutBody.plan_id = existingPlanId
      } else {
        checkoutBody.plan = {
          product_id: whopProductId,
          title: `Header Ad ($${price})`,
          initial_price: price,
          currency: 'usd',
          plan_type: 'one_time',
          visibility: 'hidden',
          force_create_new_plan: false
        }
      }

      const response = await $fetch<any>('https://api.whop.com/api/v1/checkout_configurations', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${whopApiKey}`,
          'Content-Type': 'application/json'
        },
        body: checkoutBody
      })

      if (response?.purchase_url) {
        checkoutUrl = response.purchase_url
      }
    } catch (apiErr: any) {
      console.error('[Whop Checkout] API call failed:', apiErr?.data || apiErr?.message)
    }
  }

  if (!checkoutUrl) {
    if (price > 1) {
      throw createError({
        statusCode: 500,
        statusMessage: 'No fue posible generar el checkout para este precio. Inténtalo nuevamente.'
      })
    }
    const planId = config.public.whopPlanId || 'plan_hTUcUBQJcr8lE'
    checkoutUrl = `https://whop.com/checkout/${planId}?redirect_url=${encodeURIComponent(redirectUrl)}`
  }

  return {
    ok: true,
    checkoutUrl,
    slot,
    price,
    setupToken
  }
})
