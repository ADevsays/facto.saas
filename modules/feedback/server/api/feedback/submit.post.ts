import { supabase } from '~/server/lib/supabase'

export default defineEventHandler(async (event) => {
  const formData = await readMultipartFormData(event)
  
  if (!formData || formData.length === 0) {
    throw createError({ statusCode: 400, message: 'No data provided' })
  }

  let details = ''
  let fileData = null
  let fileExt = ''
  let fileType = ''

  for (const field of formData) {
    if (field.name === 'details') {
      details = field.data.toString('utf-8')
    } else if (field.name === 'image' && field.data.length > 0) {
      fileData = field.data
      fileType = field.type || 'image/png'
      fileExt = field.filename ? field.filename.split('.').pop()! : 'png'
    }
  }

  if (!details) {
    throw createError({ statusCode: 400, message: 'Details are required' })
  }

  let imageUrl = null

  if (fileData) {
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
    const { error: uploadError } = await supabase.storage
      .from('feedback_images')
      .upload(fileName, fileData, {
        contentType: fileType
      })

    if (uploadError) {
      throw createError({ statusCode: 500, message: `Failed to upload image: ${uploadError.message}` })
    }

    const { data: publicUrlData } = supabase.storage
      .from('feedback_images')
      .getPublicUrl(fileName)

    imageUrl = publicUrlData.publicUrl
  }

  const { data, error } = await supabase
    .from('feedback_reports')
    .insert({ details, image_url: imageUrl })
    .select()
    .single()

  if (error) {
    throw createError({ statusCode: 500, message: `Failed to save report: ${error.message}` })
  }

  return { success: true, report: data }
})
