import { supabase } from '~/server/lib/supabase'
import { whopService } from '~/server/services/whop'

export default defineEventHandler(async (event) => {
  const body = await readBody<{ token: string; email?: string }>(event)

  if (!body?.token) {
    throw createError({ statusCode: 400, message: 'Token is required' })
  }

  const founderCookie = getCookie(event, 'facto_founder_token')
  let resolvedEmail = body.email?.trim().toLowerCase() || ''

  if (!resolvedEmail && founderCookie) {
    const { data: session } = await supabase
      .from('founder_sessions')
      .select('founder_email, expires_at')
      .eq('token', founderCookie)
      .single()

    if (session && new Date(session.expires_at) > new Date()) {
      resolvedEmail = session.founder_email.trim().toLowerCase()
    }
  }

  if (!resolvedEmail) {
    resolvedEmail = 'ad_free_supporter@factosaas.com'
  }

  const membershipId = `mem_ad_free_${Date.now()}`
  const userId = `usr_ad_free_${Date.now()}`

  try {
    await whopService.activateMembership(
      { id: userId, email: resolvedEmail },
      membershipId,
      body.token
    )
  } catch (err: any) {
    console.warn('[AdFree Verify] Non-fatal activation notice:', err?.message)
  }

  return {
    ok: true,
    adFree: true,
    token: body.token
  }
})
