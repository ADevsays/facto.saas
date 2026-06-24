import { supabase } from '~/server/lib/supabase'

export default defineEventHandler(async (event) => {
  const formData = await readMultipartFormData(event)
  
  if (!formData || formData.length === 0) {
    throw createError({ statusCode: 400, message: 'No file uploaded' })
  }
  
  const file = formData[0]
  if (!file.filename || !file.data) {
    throw createError({ statusCode: 400, message: 'Invalid file format' })
  }

  const fileExt = file.filename.split('.').pop()
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`

  const { error } = await supabase.storage
    .from('ads_images')
    .upload(fileName, file.data, {
      contentType: file.type
    })

  if (error) {
    throw createError({ statusCode: 500, message: error.message })
  }

  const { data: publicUrlData } = supabase.storage
    .from('ads_images')
    .getPublicUrl(fileName)

  return { imageUrl: publicUrlData.publicUrl }
})
