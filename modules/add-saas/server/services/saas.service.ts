import { supabase } from '~/server/lib/supabase'
import type { SaasSubmission, SaasPublicProfile } from '~/modules/add-saas/types'
import { getProvider } from './provider.factory'
import { slugify } from '~/utils/slugify'
import { fetchClearbitLogo } from '../utils/clearbit'
import { fetchWebsiteMetaDescription } from '../utils/scraper'

export interface ProviderData {
  providerId: string | null
  providerKeyEncrypted: string | null
  mrr: number | null
  currency: string
  hasProvider: boolean
}

export async function processProviderInfo(body: SaasSubmission, event: any): Promise<ProviderData> {
  const hasProvider = !!(body.providerSlug && body.providerKey)
  if (!hasProvider) {
    return { providerId: null, providerKeyEncrypted: null, mrr: null, currency: 'USD', hasProvider: false }
  }

  const { data: providerRow } = await supabase
    .from('payment_providers')
    .select('id')
    .eq('slug', body.providerSlug!)
    .single()

  if (!providerRow) {
    return { providerId: null, providerKeyEncrypted: null, mrr: null, currency: 'USD', hasProvider: false }
  }

  let mrr: number | null = null
  let currency = 'USD'

  try {
    if (body.providerSlug === 'mercadopago' && body.providerKey === 'MERCADO_PAGO_OAUTH_TOKEN') {
      const cookieMrr = getCookie(event, 'mp_verified_mrr')
      if (cookieMrr) {
        mrr = parseInt(cookieMrr)
      }
    } else {
      const service = getProvider(body.providerSlug!)
      const result = await service.getMrr(body.providerKey!)
      if (result.valid) {
        mrr = result.mrr
        currency = result.currency
      }
    }
  } catch (e) {
    console.error('[Publish] Failed to verify MRR:', e)
  }

  return {
    providerId: providerRow.id,
    providerKeyEncrypted: encryptProviderKey(body.providerKey!),
    mrr,
    currency,
    hasProvider: true
  }
}

export async function upsertSaasEntry(
  body: SaasSubmission, 
  websiteUrl: string | null,
  pData: ProviderData, 
  matchedCategories: { id: number, name: string, slug: string }[],
  matchedCountry: { id: number, name: string, slug: string, flag: string } | null
): Promise<SaasPublicProfile & { status: string }> {
  const isIncognito = !!body.isIncognito
  const slugVal = isIncognito ? null : slugify(body.name.trim())
  
  const getMappedValue = <T>(val: T | undefined | null) => (isIncognito ? null : (val ?? null))
  
  let logoUrl = getMappedValue(body.logoUrl)
  if (!isIncognito && websiteUrl && !logoUrl && !body.id) {
    logoUrl = await fetchClearbitLogo(websiteUrl)
  }

  let startupType = getMappedValue(body.startupType)
  if (!isIncognito && websiteUrl && !startupType && !body.id) {
    startupType = await fetchWebsiteMetaDescription(websiteUrl)
  }

  const payload = {
    name: getMappedValue(body.name.trim()),
    slug: slugVal,
    logo_url: logoUrl,
    website_url: getMappedValue(websiteUrl),
    founder_name: getMappedValue(body.founderName),
    founder_email: body.founderEmail?.trim().toLowerCase() || null,
    startup_type: startupType,
    is_incognito: isIncognito,
    ...(pData.mrr !== null && { mrr: pData.mrr }),
    ...(pData.currency && { currency: pData.currency }),
    ...(pData.providerId && { provider_id: pData.providerId }),
    ...(pData.providerKeyEncrypted && { provider_key_encrypted: pData.providerKeyEncrypted })
  }

  let entryId = body.id
  let existingEntry: any = null

  if (entryId) {
    const { data: existing } = await supabase.from('saas_entries').select('*').eq('id', entryId).maybeSingle()
    existingEntry = existing
  } else if (!isIncognito) {
    // 1. Check by slug
    if (slugVal) {
      const { data: bySlug } = await supabase
        .from('saas_entries')
        .select('*')
        .eq('slug', slugVal)
        .order('published_at', { ascending: false })
        .limit(1)
        .maybeSingle()
      if (bySlug) existingEntry = bySlug
    }

    // 2. Check by website_url if not found by slug
    if (!existingEntry && websiteUrl) {
      const normalizedUrl = websiteUrl.replace(/^https?:\/\//, '').replace(/\/$/, '')
      const { data: byUrl } = await supabase
        .from('saas_entries')
        .select('*')
        .or(`website_url.ilike.%${normalizedUrl}%,website_url.eq.${websiteUrl}`)
        .order('published_at', { ascending: false })
        .limit(1)
        .maybeSingle()
      if (byUrl) existingEntry = byUrl
    }

    // 3. Check by founder_email and name
    if (!existingEntry && body.founderEmail && body.name) {
      const { data: byEmailName } = await supabase
        .from('saas_entries')
        .select('*')
        .eq('founder_email', body.founderEmail.trim().toLowerCase())
        .ilike('name', body.name.trim())
        .order('published_at', { ascending: false })
        .limit(1)
        .maybeSingle()
      if (byEmailName) existingEntry = byEmailName
    }

    if (existingEntry) {
      entryId = existingEntry.id
    }
  }

  let entry: any
  let error: any
  let status = pData.hasProvider ? 'published' : 'pending_review'

  if (entryId && existingEntry) {
    status = pData.hasProvider ? 'published' : (existingEntry.status || status)
    const shouldSetPublishedAt = status === 'published' && existingEntry.status !== 'published'
    
    const res = await supabase.from('saas_entries').update({
      ...payload,
      status,
      ...(shouldSetPublishedAt ? { published_at: new Date().toISOString() } : {})
    }).eq('id', entryId).select().single()
    entry = res.data
    error = res.error
    
    if (entry && !error) {
      await supabase.from('saas_categories').delete().eq('saas_id', entry.id)
      await supabase.from('saas_countries').delete().eq('saas_id', entry.id)
    }
  } else {
    // If inserting a new entry, verify slug uniqueness
    let finalSlug = slugVal
    if (!isIncognito && finalSlug) {
      const { data: slugCheck } = await supabase.from('saas_entries').select('id').eq('slug', finalSlug).maybeSingle()
      if (slugCheck) {
        finalSlug = `${finalSlug}-${Date.now().toString(36).slice(-4)}`
        payload.slug = finalSlug
      }
    }

    const res = await supabase.from('saas_entries').insert({
      ...payload,
      status,
      views: 0,
      ...(status === 'published' ? { published_at: new Date().toISOString() } : {})
    }).select().single()
    entry = res.data
    error = res.error
  }

  if (error || !entry) throw createError({ statusCode: 500, message: error?.message || 'Failed to save entry' })

  await supabase.from('saas_categories').insert(
    matchedCategories.map(cat => ({ saas_id: entry.id, category_id: cat.id }))
  )

  if (matchedCountry) {
    await supabase.from('saas_countries').insert({ saas_id: entry.id, country_id: matchedCountry.id })
  }

  const { data: finalEntry } = await supabase
    .from('saas_entries')
    .select(`id, name, slug, logo_url, website_url, founder_name, startup_type, is_incognito, mrr, currency, published_at,
      categories!saas_categories ( name, slug ),
      countries!saas_countries ( name, slug, flag ),
      payment_providers ( slug )`)
    .eq('id', entry.id)
    .single()

  if (!finalEntry) throw createError({ statusCode: 500, message: 'Failed to fetch entry after creation' })

  return {
    id: finalEntry.id,
    name: finalEntry.name,
    slug: finalEntry.slug,
    logoUrl: finalEntry.logo_url,
    websiteUrl: finalEntry.website_url,
    founderName: finalEntry.founder_name,
    startupType: (finalEntry as any).startup_type,
    category: (finalEntry.categories as any[])[0]?.name ?? '',
    categories: (finalEntry.categories as any[]) || [],
    country: (finalEntry.countries as any[])?.[0] || null,
    provider: (finalEntry.payment_providers as any)?.slug ?? null,
    isIncognito: finalEntry.is_incognito,
    mrr: finalEntry.mrr,
    currency: finalEntry.currency,
    publishedAt: finalEntry.published_at,
    status
  } as SaasPublicProfile & { status: string }
}
