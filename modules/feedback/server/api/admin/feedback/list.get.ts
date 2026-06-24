import { supabase } from '~/server/lib/supabase'

export default defineEventHandler(async (event) => {
  // This route is protected by the /server/middleware/adminAuth.ts
  // because it starts with /api/admin/
  
  const { data, error } = await supabase
    .from('feedback_reports')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    throw createError({ statusCode: 500, message: error.message })
  }

  return data
})
