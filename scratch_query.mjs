import { createClient } from '@supabase/supabase-js'
import 'dotenv/config'

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)

async function run() {
  const { data: saas, error } = await supabase
    .from('saas_entries')
    .select('id, name, slug, founder_email')
    .ilike('name', 'xin%')

  console.log('SaaS Entries for Xin:', saas)
  console.log('Error:', error)
}

run();
