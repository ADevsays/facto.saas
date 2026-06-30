import { supabase } from '~/server/lib/supabase'
import { processProviderInfo } from '~/modules/add-saas/server/services/saas.service'

export default defineEventHandler(async (event) => {
  const body = await readBody<{
    saasId: string
    email: string
    name?: string
    countrySlug?: string
    twitterUrl?: string
    linkedinUrl?: string
    instagramUrl?: string
    intent: 'founder' | 'mrr'
    providerSlug?: string
    providerKey?: string
  }>(event)

  if (!body.saasId || !body.email || !body.intent) {
    throw createError({ statusCode: 400, message: 'saasId, email, and intent are required' })
  }

  if (body.intent === 'founder' && !body.name) {
    throw createError({ statusCode: 400, message: 'name is required for founder claim' })
  }
  
  if (body.intent === 'mrr' && (!body.providerSlug || !body.providerKey)) {
    throw createError({ statusCode: 400, message: 'provider and key are required for MRR verification' })
  }

  const email = body.email.trim().toLowerCase()

  const { data: entry, error: entryError } = await supabase
    .from('saas_entries')
    .select('id, founder_email')
    .eq('id', body.saasId)
    .single()

  if (entryError || !entry) {
    throw createError({ statusCode: 404, message: 'Startup not found' })
  }

  if (!entry.founder_email || entry.founder_email.trim().toLowerCase() !== email) {
    throw createError({ statusCode: 403, message: 'Email does not match the registered founder email' })
  }

  if (body.intent === 'mrr') {
    const fakeBody = {
      providerSlug: body.providerSlug,
      providerKey: body.providerKey
    } as any

    const pData = await processProviderInfo(fakeBody, event)

    if (!pData.hasProvider || !pData.providerId) {
      throw createError({ statusCode: 400, message: 'Invalid provider details or MRR could not be verified' })
    }

    const { error: updateError } = await supabase
      .from('saas_entries')
      .update({
        provider_id: pData.providerId,
        provider_key_encrypted: pData.providerKeyEncrypted,
        ...(pData.mrr !== null && { mrr: pData.mrr }),
        ...(pData.currency && { currency: pData.currency }),
        status: 'published'
      })
      .eq('id', body.saasId)

    if (updateError) {
      throw createError({ statusCode: 500, message: 'Failed to update MRR info' })
    }

    // Async Background Sync
    ;(async () => {
      try {
        const { getProvider } = await import('~/modules/add-saas/server/services/provider.factory')
        const service = getProvider(body.providerSlug as any)
        if (service.getHistory) {
          const history = await service.getHistory(body.providerKey!)
          if (history) {
            let realAllTimeRevenue = 0
            let mrrVal = pData.mrr ?? 0

            if (history.charges?.length) {
              realAllTimeRevenue = history.charges.reduce((sum: number, c: any) => sum + c.amount, 0)
            }
            if (history.subscriptions?.length) {
              const nowSec = Math.floor(Date.now() / 1000)
              let currentMrr = 0
              for (const s of history.subscriptions) {
                if (s.created <= nowSec && (s.canceledAt === null || s.canceledAt > nowSec)) {
                  currentMrr += s.mrr
                }
              }
              mrrVal = Math.round(currentMrr)
            }

            let allTimeRev = '$0'
            if (realAllTimeRevenue > 0) {
              if (realAllTimeRevenue >= 1000000) allTimeRev = `$${(realAllTimeRevenue / 1000000).toFixed(1)}M`.replace('.0', '')
              else if (realAllTimeRevenue >= 1000) allTimeRev = `$${(realAllTimeRevenue / 1000).toFixed(0)}K`
              else allTimeRev = `$${Math.round(realAllTimeRevenue)}`
            } else if (mrrVal > 0) {
              const annual = mrrVal * 12
              if (annual >= 1000000) allTimeRev = `$${(annual / 1000000).toFixed(1)}M`.replace('.0', '')
              else if (annual >= 1000) allTimeRev = `$${(annual / 1000).toFixed(0)}K`
              else allTimeRev = `$${annual}`
            }

            const storage = useStorage('cache')
            const cacheKey = `history:${body.providerSlug}:${body.saasId}`
            await storage.setItem(cacheKey, { history, timestamp: Date.now() })
            await storage.setItem(`metrics:${body.saasId}`, { mrr: mrrVal, revenue: allTimeRev })

            if (mrrVal !== pData.mrr) {
              await supabase.from('saas_entries').update({ mrr: mrrVal }).eq('id', body.saasId)
            }
          }
        }
      } catch (e) {
        console.error('[Claim MRR Sync Error]:', e)
      }
    })()

    return { success: true, mrr: pData.mrr }
  }

  const { data: founder, error: founderError } = await supabase
    .from('founders')
    .upsert(
      {
        email,
        name: body.name!.trim(),
        twitter_url: body.twitterUrl?.trim() || null,
        linkedin_url: body.linkedinUrl?.trim() || null,
        instagram_url: body.instagramUrl?.trim() || null,
        country_slug: body.countrySlug?.trim() || null,
      },
      { onConflict: 'email' }
    )
    .select('id, email, name, twitter_url, linkedin_url, instagram_url, country_slug, created_at')
    .single()

  if (founderError || !founder) {
    throw createError({ statusCode: 500, message: 'Failed to create or update founder profile' })
  }

  const { error: updateError } = await supabase
    .from('saas_entries')
    .update({ founder_id: founder.id, founder_name: body.name!.trim() })
    .eq('id', body.saasId)

  if (updateError) {
    throw createError({ statusCode: 500, message: 'Failed to link founder to startup' })
  }

  if (body.countrySlug) {
    const { data: country } = await supabase
      .from('countries')
      .select('id')
      .eq('slug', body.countrySlug.trim())
      .single()

    if (country) {
      await supabase
        .from('saas_countries')
        .delete()
        .eq('saas_id', body.saasId)

      await supabase
        .from('saas_countries')
        .insert({ saas_id: body.saasId, country_id: country.id })
    }
  }

  return { founder }
})
