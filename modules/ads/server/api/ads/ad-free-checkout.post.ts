import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { supabase } from '~/server/lib/supabase'

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
  const body = await readBody<{ email?: string }>(event).catch(() => ({} as { email?: string }))

  const token = getCookie(event, 'facto_founder_token') || getHeader(event, 'x-founder-token')
  let userEmail = body?.email?.trim().toLowerCase() || ''

  if (!userEmail && token) {
    const { data: session } = await supabase
      .from('founder_sessions')
      .select('founder_email, expires_at')
      .eq('token', token)
      .single()

    if (session && new Date(session.expires_at) > new Date()) {
      userEmail = session.founder_email.trim().toLowerCase()
    }
  }

  const adFreeToken = `ad_free_${crypto.randomUUID()}`

  const config = useRuntimeConfig()
  const siteUrl = (config.public.siteUrl || 'https://www.factosaas.com').trim()
  const isHttps = siteUrl.startsWith('https://')
  const baseUrl = isHttps ? siteUrl : 'https://www.factosaas.com'
  const redirectUrl = `${baseUrl}/dashboard/ads?ad_free_success=true&token=${adFreeToken}`

  const whopApiKey = resolveWhopApiKey()
  const whopAccountId = (process.env.WHOP_ACCOUNT_ID || 'biz_LGcptk06n8Q82U').trim()
  const whopProductId = (process.env.WHOP_PRODUCT_ID || 'prod_7A3GOWDazvmNj').trim()
  let checkoutUrl = ''

  const price = 10

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
          type: 'ad_free',
          token: adFreeToken,
          email: userEmail
        }
      }

      if (existingPlanId) {
        checkoutBody.plan_id = existingPlanId
      } else {
        checkoutBody.plan = {
          product_id: whopProductId,
          title: `Facto Ad-Free ($${price})`,
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
    } catch (err: any) {
      console.error('[AdFree Checkout] Whop API error:', err?.data || err?.message)
    }
  }

  if (!checkoutUrl) {
    const planId = config.public.whopPlanId || 'plan_hTUcUBQJcr8lE'
    checkoutUrl = `https://whop.com/checkout/${planId}?redirect_url=${encodeURIComponent(redirectUrl)}`
  }

  return {
    ok: true,
    checkoutUrl,
    token: adFreeToken
  }
})
