import { supabase } from '~/server/lib/supabase'

export default defineEventHandler(async () => {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name', { ascending: true })

  if (error) throw createError({ statusCode: 500, message: error.message })

  return data ?? []
})
