import sharp from 'sharp'
import { supabase } from '~/server/lib/supabase'

export default defineEventHandler(async (event) => {
  const formData = await readMultipartFormData(event)
  
  if (!formData || formData.length === 0) {
    throw createError({ statusCode: 400, message: 'No se envió ningún archivo.' })
  }
  
  const file = formData[0]
  if (!file.filename || !file.data) {
    throw createError({ statusCode: 400, message: 'El archivo de imagen no es válido.' })
  }

  // 1. Validate file extension
  const fileExt = (file.filename.split('.').pop() || '').toLowerCase()
  const allowedExts = ['png', 'jpg', 'jpeg', 'webp', 'svg', 'gif', 'ico']

  if (!allowedExts.includes(fileExt)) {
    throw createError({
      statusCode: 400,
      message: `El formato ".${fileExt || 'desconocido'}" no es compatible. Por favor sube una imagen en formato PNG, JPG, WEBP o SVG.`
    })
  }

  // 2. Validate MIME type
  const mimeType = (file.type || '').toLowerCase()
  if (mimeType && !mimeType.startsWith('image/')) {
    throw createError({
      statusCode: 400,
      message: 'El archivo seleccionado no es una imagen válida.'
    })
  }

  // 3. Validate file size (max 5 MB)
  const MAX_SIZE = 5 * 1024 * 1024
  if (file.data.length > MAX_SIZE) {
    throw createError({
      statusCode: 400,
      message: 'El archivo supera el tamaño máximo permitido de 5 MB.'
    })
  }

  // 4. Optimize raster images with Sharp (convert to WebP, resize max 256x256, compress)
  let uploadBuffer: Buffer = file.data
  let finalExt = fileExt
  let targetMime = mimeType || `image/${fileExt}`

  const isVectorOrAnimated = ['svg', 'gif', 'ico'].includes(fileExt)
  if (!isVectorOrAnimated) {
    try {
      uploadBuffer = await sharp(file.data)
        .resize(256, 256, { fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 85, effort: 4 })
        .toBuffer()
      finalExt = 'webp'
      targetMime = 'image/webp'
    } catch (optErr) {
      console.warn('[Ads Upload] Image optimization warning, using original buffer:', optErr)
    }
  }

  // 5. Upload to Supabase Storage (saas_logos bucket to prevent client adblockers)
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${finalExt}`

  let bucket = 'saas_logos'
  let uploadRes = await supabase.storage.from(bucket).upload(fileName, uploadBuffer, {
    contentType: targetMime,
    upsert: true
  })

  // Fallback to ads_images if saas_logos has any issue
  if (uploadRes.error && uploadRes.error.message?.toLowerCase().includes('bucket not found')) {
    bucket = 'ads_images'
    uploadRes = await supabase.storage.from(bucket).upload(fileName, file.data, {
      contentType: targetMime,
      upsert: true
    })
  }

  if (uploadRes.error) {
    console.error('[Ads Upload] Supabase storage upload error:', uploadRes.error)
    throw createError({
      statusCode: 500,
      message: 'No fue posible guardar la imagen en el servidor. Por favor intenta con otra imagen o introduce una URL directa.'
    })
  }

  const { data: publicUrlData } = supabase.storage
    .from(bucket)
    .getPublicUrl(fileName)

  return { imageUrl: publicUrlData.publicUrl }
})
