import { supabase } from '~/server/lib/supabase'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { id, status } = body

  if (!id || !status) {
    throw createError({ statusCode: 400, message: 'ID and status are required' })
  }

  const { data, error } = await supabase
    .from('feedback_reports')
    .update({ status })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw createError({ statusCode: 500, message: error.message })
  }

  return { success: true, report: data }
})
