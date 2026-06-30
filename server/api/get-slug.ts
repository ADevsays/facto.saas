import { supabase } from '~/server/lib/supabase'

export default defineEventHandler(async (event) => {
  const { data } = await supabase.from('saas_entries').select('*').eq('id', '91bd4f72-e8f5-4d26-8a74-158e5faa872e').single()
  return data
})
