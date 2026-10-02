import { supabase } from '~/server/lib/supabase'
import type { Ad } from '~/modules/ads/types'

function parseAdRecord(raw: any): Ad {
  const ad: Ad = {
    id: raw.id,
    name: raw.name,
    description: raw.description || '',
    url: raw.url,
    image_url: raw.image_url || '',
    is_active: raw.is_active,
    created_at: raw.created_at,
    user_id: raw.user_id,
    whop_membership_id: raw.whop_membership_id,
    position: raw.position,
    price: raw.price,
    email: raw.email,
    is_affiliate: raw.is_affiliate
  }

  if (ad.position === undefined || ad.position === null) {
    const metaMatch = ad.description?.match(/<!--meta:(\{.*?\})-->/)
    if (metaMatch) {
      try {
        const meta = JSON.parse(metaMatch[1])
        if (meta.position !== undefined) ad.position = meta.position
        if (meta.price !== undefined) ad.price = meta.price
        if (meta.email !== undefined) ad.email = meta.email
        if (meta.is_affiliate !== undefined) ad.is_affiliate = meta.is_affiliate
      } catch (_) {}
    }
  }

  if (ad.description) {
    ad.description = ad.description.replace(/<!--meta:\{.*?\}-->/, '').trim()
  }

  return ad
}

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const queryEmail = (query.email as string)?.trim().toLowerCase()

  const token = getCookie(event, 'facto_founder_token') || getHeader(event, 'x-founder-token')
  let sessionEmail = ''

  if (token) {
    const { data: session } = await supabase
      .from('founder_sessions')
      .select('founder_email, expires_at')
      .eq('token', token)
      .single()

    if (session && new Date(session.expires_at) > new Date()) {
      sessionEmail = session.founder_email.trim().toLowerCase()
    }
  }

  const targetEmail = queryEmail || sessionEmail

  if (!targetEmail) {
    return {
      authenticated: false,
      email: null,
      ads: [] as Ad[],
      canHideAds: false,
      isAdFree: false,
      hasPaidAds: false
    }
  }

  // 1. Fetch user active memberships to correlate ads and check ad-free status
  const { data: memberships } = await supabase
    .from('whop_memberships')
    .select('*')
    .ilike('email', targetEmail)
    .eq('status', 'active')

  const userMembershipIds = new Set(
    (memberships || [])
      .map(m => m.whop_membership_id || m.id)
      .filter(Boolean)
  )
  const userWhopUserIds = new Set(
    (memberships || [])
      .map(m => m.whop_user_id)
      .filter(Boolean)
  )

  // 2. Fetch all ads and parse metadata tags (handling environments where email/position are meta-encoded)
  const { data: rawAds, error } = await supabase
    .from('ads')
    .select('*')
    .order('created_at', { ascending: false })

  let parsedAds: Ad[] = []
  if (!error && rawAds) {
    parsedAds = rawAds
      .map(parseAdRecord)
      .filter(ad => {
        const emailMatch = !!ad.email && ad.email.trim().toLowerCase() === targetEmail
        const membershipMatch = !!ad.whop_membership_id && userMembershipIds.has(ad.whop_membership_id)
        const userMatch = !!ad.user_id && userWhopUserIds.has(ad.user_id)
        return emailMatch || membershipMatch || userMatch
      })
  }

  // 3. Check ad-free and sponsor privileges
  const isAdFree = !!memberships?.some(m => m.whop_membership_id?.includes('ad_free') || m.id?.includes('ad_free'))
  const hasPaidAds = parsedAds.some(a => Number(a.price) > 0)
  const canHideAds = hasPaidAds || isAdFree

  return {
    authenticated: !!sessionEmail,
    email: targetEmail,
    ads: parsedAds,
    canHideAds,
    isAdFree,
    hasPaidAds
  }
})
