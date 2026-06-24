import { supabase } from '~/server/lib/supabase'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({ statusCode: 400, message: 'ID is required' })
  }

  const { data, error } = await supabase
    .from('feedback_reports')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    throw createError({ statusCode: 500, message: error.message })
  }

  return data
})
