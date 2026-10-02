import { supabase } from '~/server/lib/supabase'

export default defineEventHandler(async (event) => {
  const token = getCookie(event, 'facto_founder_token') || getHeader(event, 'x-founder-token')

  if (!token) {
    throw createError({ statusCode: 401, message: 'Unauthorized session' })
  }

  const { data: session, error: sessionError } = await supabase
    .from('founder_sessions')
    .select('founder_email, expires_at')
    .eq('token', token)
    .single()

  if (sessionError || !session || new Date(session.expires_at) < new Date()) {
    throw createError({ statusCode: 401, message: 'Session expired or invalid' })
  }

  const body = await readBody<{
    name?: string
    avatarUrl?: string
    avatarFileBase64?: string
    bio?: string
    countrySlug?: string
    twitterUrl?: string
    linkedinUrl?: string
    instagramUrl?: string
  }>(event)

  const email = session.founder_email.trim().toLowerCase()

  const avatar = body.avatarFileBase64 || (body.avatarUrl !== undefined ? (body.avatarUrl.trim() || null) : undefined)

  const updateData: any = {
    email,
    name: body.name !== undefined ? (body.name.trim() || null) : undefined,
    bio: body.bio !== undefined ? (body.bio.trim() || null) : undefined,
    country_slug: body.countrySlug !== undefined ? (body.countrySlug.trim() || null) : undefined,
    twitter_url: body.twitterUrl !== undefined ? (body.twitterUrl.trim() || null) : undefined,
    linkedin_url: body.linkedinUrl !== undefined ? (body.linkedinUrl.trim() || null) : undefined,
    instagram_url: body.instagramUrl !== undefined ? (body.instagramUrl.trim() || null) : undefined
  }

  if (avatar !== undefined) {
    updateData.avatar_url = avatar
  }

  const { data: founder, error: updateError } = await supabase
    .from('founders')
    .upsert(updateData, { onConflict: 'email' })
    .select('*')
    .single()

  if (updateError) {
    throw createError({ statusCode: 500, message: 'Failed to update founder profile' })
  }

  return { success: true, founder }
})
