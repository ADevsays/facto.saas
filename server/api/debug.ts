import { supabase } from '~/server/lib/supabase'
import { decryptProviderKey } from '~/server/utils/encryption'

export default defineEventHandler(async (event) => {
  const { data: dbEntry } = await supabase
    .from('saas_entries')
    .select('provider_key_encrypted')
    .eq('id', '00799298-1b5d-4de3-9892-0cc489ae17ef')
    .single()

  if (!dbEntry || !dbEntry.provider_key_encrypted) return { error: 'No key' }

  const apiKey = decryptProviderKey(dbEntry.provider_key_encrypted)

  const res = await $fetch<any>('https://api.stripe.com/v1/subscriptions?status=all&limit=10', {
    headers: { Authorization: `Bearer ${apiKey}` }
  }).catch(e => ({ error: e.message }))

  return { rawStripe: res }
})
