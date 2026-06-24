import { supabase } from '~/server/lib/supabase'
import type { AdPayload } from '../../../../../ads/types'

export default defineEventHandler(async (event) => {
  // El middleware 'adminAuth.ts' ya garantizó que el header 'x-admin-key' es correcto.
  const payload = await readBody<AdPayload>(event)
  
  if (!payload.name || !payload.description || !payload.url || !payload.image_url) {
    throw createError({ statusCode: 400, statusMessage: 'Missing required fields' })
  }

  // Insertamos el Ad directamente como activo (Admin Bypass)
  const { data, error } = await supabase
    .from('ads')
    .insert({
      name: payload.name,
      description: payload.description,
      url: payload.url,
      image_url: payload.image_url,
      is_active: true // Forzado activo por ser admin
    })
    .select()
    .single()

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  return data
})
