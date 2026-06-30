import { supabase } from '~/server/lib/supabase'

export default defineEventHandler(async () => {
  const { data, error } = await supabase
    .from('countries')
    .select('id, name, slug, flag, iso_code')
    .order('name')

  if (error) {
    throw createError({ statusCode: 500, message: error.message })
  }

  const list = data || []
  list.sort((a, b) => {
    if (a.slug === 'global') return -1
    if (b.slug === 'global') return 1
    return 0
  })

  return list
})
