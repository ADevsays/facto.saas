import { supabase } from '~/server/lib/supabase'
import type { PaymentProvider } from '~/modules/add-saas/types'
import { getProvider } from '../../services/provider.factory'

function decrypt(encoded: string): string {
  return Buffer.from(encoded, 'base64').toString('utf-8')
}

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  const { data: entry, error } = await supabase
    .from('saas_entries')
    .select('id, mrr, currency, provider_key_encrypted, payment_providers ( slug )')
    .eq('id', id)
    .single()

  if (error || !entry) throw createError({ statusCode: 404, message: 'SaaS not found' })

  const providerSlug = (entry.payment_providers as unknown as { slug: string } | null)?.slug as PaymentProvider | undefined

  if (!providerSlug || !entry.provider_key_encrypted) {
    return { id: entry.id, mrr: entry.mrr, currency: entry.currency, status: 'no_provider' }
  }

  const apiKey = decrypt(entry.provider_key_encrypted)
  const service = getProvider(providerSlug)
  const result = await service.getMrr(apiKey)

  if (!result.valid) {
    await supabase.from('saas_entries').update({ mrr: null }).eq('id', id)
    return { id, mrr: null, currency: entry.currency, status: 'key_expired' }
  }

  await supabase
    .from('saas_entries')
    .update({ mrr: result.mrr, currency: result.currency })
    .eq('id', id)

  return { id, mrr: result.mrr, currency: result.currency, status: 'ok' }
})
