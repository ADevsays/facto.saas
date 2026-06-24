import { supabase } from '~/server/lib/supabase'
import type { Ad } from '../../../types'

export default defineEventHandler(async (event) => {
  const { data, error } = await supabase
    .from('ads')
    .select('id, name, description, url, image_url, is_active, created_at')
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  return data as Ad[]
})
