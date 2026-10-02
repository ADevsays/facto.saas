import { supabase } from '~/server/lib/supabase'

export default defineEventHandler(async (event) => {
  const body = await readBody<{
    id: string
    name: string
    description?: string
    url: string
    image_url?: string
  }>(event)

  if (!body || !body.id || !body.name?.trim() || !body.url?.trim()) {
    throw createError({
      statusCode: 400,
      statusMessage: 'El ID, nombre y enlace web son obligatorios.'
    })
  }

  // 1. Verify user session
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

  if (!sessionEmail) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Debes tener una sesión activa para editar tu anuncio.'
    })
  }

  // 2. Fetch existing ad
  const { data: existingAd, error: fetchError } = await supabase
    .from('ads')
    .select('*')
    .eq('id', body.id)
    .single()

  if (fetchError || !existingAd) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Anuncio no encontrado.'
    })
  }

  // 3. Authorization check: does this ad belong to the session founder?
  let adEmail = existingAd.email || ''
  let metaObj: Record<string, any> = {}

  const metaMatch = existingAd.description?.match(/<!--meta:(\{.*?\})-->/)
  if (metaMatch) {
    try {
      metaObj = JSON.parse(metaMatch[1])
      if (metaObj.email) adEmail = metaObj.email
    } catch {}
  }

  let isAuthorized = false
  if (adEmail && adEmail.trim().toLowerCase() === sessionEmail) {
    isAuthorized = true
  } else {
    // Check whop memberships for this founder
    const { data: memberships } = await supabase
      .from('whop_memberships')
      .select('whop_membership_id, id')
      .ilike('email', sessionEmail)
      .eq('status', 'active')

    const membershipIds = new Set((memberships || []).map(m => m.whop_membership_id || m.id))
    if (existingAd.whop_membership_id && membershipIds.has(existingAd.whop_membership_id)) {
      isAuthorized = true
    }
  }

  if (!isAuthorized) {
    throw createError({
      statusCode: 403,
      statusMessage: 'No tienes permisos para editar este anuncio.'
    })
  }

  // 4. Sanitize URL
  let cleanUrl = body.url.trim()
  if (cleanUrl && !/^https?:\/\//i.test(cleanUrl)) {
    cleanUrl = `https://${cleanUrl}`
  }

  // 5. Build updated description preserving metadata
  const cleanDescription = (body.description || '').replace(/<!--meta:\{.*?\}-->/, '').trim()
  const metaTag = Object.keys(metaObj).length > 0
    ? `<!--meta:${JSON.stringify(metaObj)}-->`
    : (metaMatch ? metaMatch[0] : '')

  const updatedDescription = metaTag
    ? (cleanDescription ? `${cleanDescription} ${metaTag}` : metaTag)
    : cleanDescription

  // 6. Update in Supabase
  const updatePayload: Record<string, any> = {
    name: body.name.trim(),
    description: updatedDescription,
    url: cleanUrl,
    image_url: (body.image_url || '').trim()
  }

  const { data: updated, error: updateError } = await supabase
    .from('ads')
    .update(updatePayload)
    .eq('id', body.id)
    .select()
    .single()

  if (updateError) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Error al actualizar el anuncio: ' + updateError.message
    })
  }

  return {
    ok: true,
    ad: {
      id: updated.id,
      name: updated.name,
      description: cleanDescription,
      url: updated.url,
      image_url: updated.image_url,
      is_active: updated.is_active,
      created_at: updated.created_at,
      position: metaObj.position ?? updated.position,
      price: metaObj.price ?? updated.price,
      email: adEmail,
      is_affiliate: metaObj.is_affiliate ?? updated.is_affiliate
    }
  }
})
