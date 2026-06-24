import { supabase } from '~/server/lib/supabase'
import type { AdPayload } from '../../../types'

export default defineEventHandler(async (event) => {
  const payload = await readBody<AdPayload>(event)
  
  if (!payload.name || !payload.description || !payload.url || !payload.image_url) {
    throw createError({ statusCode: 400, statusMessage: 'Missing required fields' })
  }

  const { data, error } = await supabase
    .from('ads')
    .insert({
      name: payload.name,
      description: payload.description,
      url: payload.url,
      image_url: payload.image_url,
      is_active: true
    })
    .select()
    .single()

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  return data
})
