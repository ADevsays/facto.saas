import { supabase } from './server/lib/supabase.ts'

async function check() {
  const { data, error } = await supabase.from('categories').select('*')
  if (error) console.error('Error querying categories:', error)
  else console.log('Categories:', data)
}

check()
