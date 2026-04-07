import { supabase } from '~/server/lib/supabase'
import type { PaymentProvider, SaasSubmission, SaasPublicProfile } from '~/modules/add-saas/types'
import { getProvider } from '../services/provider.factory'

function encrypt(key: string): string {
  return Buffer.from(key).toString('base64')
}

export default defineEventHandler(async (event) => {
  const body = await readBody<SaasSubmission>(event)

  if (!body.name?.trim()) throw createError({ statusCode: 400, message: 'name is required' })
  if (!body.categorySlug) throw createError({ statusCode: 400, message: 'categorySlug is required' })

  const { data: category } = await supabase
    .from('categories')
    .select('id, name')
    .eq('slug', body.categorySlug)
    .single()

  if (!category) throw createError({ statusCode: 422, message: `Category not found: ${body.categorySlug}` })

  let providerId: string | null = null
  let mrr: number | null = null
  let currency = 'USD'
  let providerKeyEncrypted: string | null = null

  if (body.providerSlug && body.providerKey) {
    const { data: providerRow } = await supabase
      .from('payment_providers')
      .select('id')
      .eq('slug', body.providerSlug)
      .single()

    if (providerRow) {
      providerId = providerRow.id
      providerKeyEncrypted = encrypt(body.providerKey)

      try {
        // Special case: OAuth result via secure cookie
        if (body.providerSlug === 'mercadopago' && body.providerKey === 'MERCADO_PAGO_OAUTH_TOKEN') {
          const cookieMrr = getCookie(event, 'mp_verified_mrr')
          if (cookieMrr) {
            mrr = parseInt(cookieMrr)
            currency = 'USD' // Opcional: podrías guardar la moneda en otra cookie
          }
        } else {
          // Standard case: API Key validation
          const service = getProvider(body.providerSlug)
          const result = await service.getMrr(body.providerKey)
          if (result.valid) {
            mrr = result.mrr
            currency = result.currency
          }
        }
      } catch {}
    }
  }

  const { data: entry, error } = await supabase
    .from('saas_entries')
    .insert({
      name: body.isIncognito ? null : body.name.trim(),
      logo_url: body.isIncognito ? null : (body.logoUrl ?? null),
      website_url: body.isIncognito ? null : (body.websiteUrl ?? null),
      founder_name: body.isIncognito ? null : (body.founderName ?? null),
      startup_type: body.startupType ?? null,
      is_incognito: body.isIncognito,
      mrr,
      currency,
      category_id: category.id,
      provider_id: providerId,
      provider_key_encrypted: providerKeyEncrypted,
      views: 0,
    })
    .select(`id, name, logo_url, website_url, founder_name, startup_type, is_incognito, mrr, currency, published_at,
      categories ( name ),
      payment_providers ( slug )`)
    .single()

  if (error) throw createError({ statusCode: 500, message: error.message })

  const profile: SaasPublicProfile = {
    id: entry.id,
    name: entry.name,
    logoUrl: entry.logo_url,
    websiteUrl: entry.website_url,
    founderName: entry.founder_name,
    startupType: (entry as unknown as { startup_type: string | null }).startup_type,
    category: (entry.categories as unknown as { name: string } | null)?.name ?? '',
    provider: ((entry.payment_providers as unknown as { slug: string } | null)?.slug as PaymentProvider) ?? null,
    isIncognito: entry.is_incognito,
    mrr: entry.mrr,
    currency: entry.currency,
    publishedAt: entry.published_at,
  }

  return profile
})
