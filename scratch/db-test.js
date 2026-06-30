import fs from 'fs'
import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'

const env = dotenv.parse(fs.readFileSync('.env'))
const supabase = createClient(env.NUXT_PUBLIC_SUPABASE_URL, env.NUXT_PUBLIC_SUPABASE_KEY)

async function test() {
  const { data, error } = await supabase.from('saas_entries').select('id, name, slug, founder_id, founder_email').eq('id', '91bd4f72-e8f5-4d26-8a74-158e5faa872e')
  console.log(data, error)
}
test()
