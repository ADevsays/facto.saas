import { supabase } from '~/server/lib/supabase'
import { processProviderInfo } from '~/modules/add-saas/server/services/saas.service'

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
    saasId: string
    name?: string
    logoUrl?: string
    logoFileBase64?: string
    websiteUrl?: string
    startupType?: string
    status?: string
    isIncognito?: boolean
    valueProposition?: string
    problemSolved?: string
    techStack?: string[]
    acquisitionChannels?: string[]
    factoMessage?: string
    faq?: { question: string; answer: string }[]
    githubRepo?: string
    countrySlug?: string
    categorySlug?: string
    categorySlugs?: string[]
    hideMrr?: boolean
    providerSlug?: string
    providerKey?: string
  }>(event)

  if (!body.saasId) {
    throw createError({ statusCode: 400, message: 'saasId is required' })
  }

  const email = session.founder_email.trim().toLowerCase()

  // Validar propiedad de la startup
  const { data: startup, error: startupError } = await supabase
    .from('saas_entries')
    .select('id, founder_email, founder_id')
    .eq('id', body.saasId)
    .single()

  if (startupError || !startup) {
    throw createError({ statusCode: 404, message: 'Startup not found' })
  }

  if (startup.founder_email && startup.founder_email.trim().toLowerCase() !== email) {
    throw createError({ statusCode: 403, message: 'You do not have permission to edit this startup' })
  }

  // Preparar payload de actualización
  const updatePayload: any = {}
  if (body.name !== undefined) updatePayload.name = body.name.trim()
  if (body.logoFileBase64) {
    updatePayload.logo_url = body.logoFileBase64
  } else if (body.logoUrl !== undefined) {
    updatePayload.logo_url = body.logoUrl.trim() || null
  }
  if (body.websiteUrl !== undefined) updatePayload.website_url = body.websiteUrl.trim() || null
  if (body.startupType !== undefined) updatePayload.startup_type = body.startupType.trim() || null
  if (body.status !== undefined) updatePayload.status = body.status.trim()
  if (body.isIncognito !== undefined) updatePayload.is_incognito = body.isIncognito
  if (body.valueProposition !== undefined) updatePayload.value_proposition = body.valueProposition.trim() || null
  if (body.problemSolved !== undefined) updatePayload.problem_solved = body.problemSolved.trim() || null
  if (body.techStack !== undefined) updatePayload.tech_stack = body.techStack
  if (body.acquisitionChannels !== undefined) updatePayload.acquisition_channels = body.acquisitionChannels
  if (body.factoMessage !== undefined) updatePayload.facto_message = body.factoMessage.trim() || null
  if (body.faq !== undefined) updatePayload.faq = body.faq
  if (body.githubRepo !== undefined) updatePayload.github_repo = body.githubRepo.trim() || null

  // Manejo de MRR (ocultar o conectar nuevo proveedor)
  if (body.hideMrr === true) {
    updatePayload.mrr = null
  }

  if (body.providerSlug && body.providerKey) {
    const pData = await processProviderInfo({
      providerSlug: body.providerSlug,
      providerKey: body.providerKey
    } as any, event)

    if (!pData.hasProvider || !pData.providerId) {
      throw createError({ statusCode: 400, message: 'Invalid provider key or could not verify MRR' })
    }

    updatePayload.provider_id = pData.providerId
    updatePayload.provider_key_encrypted = pData.providerKeyEncrypted
    if (pData.mrr !== null) updatePayload.mrr = pData.mrr
    if (pData.currency) updatePayload.currency = pData.currency

    // Sync metrics history in background
    ;(async () => {
      try {
        const { getProvider } = await import('~/modules/add-saas/server/services/provider.factory')
        const service = getProvider(body.providerSlug as any)
        if (service && service.getHistory) {
          const history = await service.getHistory(body.providerKey!)
          if (history) {
            await supabase
              .from('saas_metrics_cache')
              .upsert({
                saas_id: body.saasId,
                history_cache: history,
                history_synced_at: new Date().toISOString()
              })
          }
        }
      } catch (e) {
        console.error('[update-startup] Background history sync error:', e)
      }
    })()
  }

  // Actualizar tabla saas_entries
  const { error: updateError } = await supabase
    .from('saas_entries')
    .update(updatePayload)
    .eq('id', body.saasId)

  if (updateError) {
    console.error('[update-startup] Error updating saas_entries:', updateError)
    throw createError({ statusCode: 500, message: 'Failed to update startup details' })
  }

  // Actualizar país si se envió
  if (body.countrySlug) {
    const { data: country } = await supabase
      .from('countries')
      .select('id')
      .eq('slug', body.countrySlug.trim())
      .single()

    if (country) {
      await supabase.from('saas_countries').delete().eq('saas_id', body.saasId)
      await supabase.from('saas_countries').insert({ saas_id: body.saasId, country_id: country.id })
    }
  }

  // Actualizar categorías si se enviaron
  if (body.categorySlugs !== undefined || body.categorySlug !== undefined) {
    let slugs: string[] = []
    if (Array.isArray(body.categorySlugs)) {
      slugs = body.categorySlugs.map(s => String(s).trim()).filter(Boolean)
    } else if (body.categorySlug && String(body.categorySlug).trim()) {
      slugs = [String(body.categorySlug).trim()]
    }

    await supabase.from('saas_categories').delete().eq('saas_id', body.saasId)

    if (slugs.length > 0) {
      const { data: cats } = await supabase
        .from('categories')
        .select('id, slug')
        .in('slug', slugs)

      if (cats && cats.length > 0) {
        const rows = cats.map(c => ({ saas_id: body.saasId, category_id: c.id }))
        await supabase.from('saas_categories').insert(rows)
      }
    }
  }

  return { success: true }
})
