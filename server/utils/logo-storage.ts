import sharp from 'sharp'
import { supabase } from '~/server/lib/supabase'

const LOGO_BUCKET = 'saas_logos'
const MAX_INPUT_BYTES = 10 * 1024 * 1024
const MAX_OUTPUT_BYTES = 128 * 1024

function parseDataUrl(dataUrl: string): Buffer {
  const match = dataUrl.match(/^data:(image\/[a-z0-9.+-]+);base64,([\s\S]+)$/i)
  if (!match) throw new Error('El logo debe ser una imagen codificada en base64')

  const buffer = Buffer.from(match[2], 'base64')
  if (!buffer.length || buffer.length > MAX_INPUT_BYTES) {
    throw new Error('El logo supera el tamaño máximo permitido de 10 MB')
  }
  return buffer
}

export async function optimizeLogoDataUrl(dataUrl: string): Promise<Buffer> {
  const input = parseDataUrl(dataUrl)
  const pipeline = sharp(input, { failOn: 'none' })
    .rotate()
    .resize(256, 256, { fit: 'inside', withoutEnlargement: true })

  let output = await pipeline.clone().webp({ quality: 82, effort: 6 }).toBuffer()
  if (output.length > MAX_OUTPUT_BYTES) {
    output = await pipeline.clone().webp({ quality: 72, effort: 6 }).toBuffer()
  }
  if (output.length > MAX_OUTPUT_BYTES) {
    output = await sharp(input, { failOn: 'none' })
      .rotate()
      .resize(192, 192, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 62, effort: 6 })
      .toBuffer()
  }

  return output
}

export async function uploadOptimizedLogo(dataUrl: string, path = `logos/${crypto.randomUUID()}.webp`): Promise<string> {
  const buffer = await optimizeLogoDataUrl(dataUrl)
  const { data, error } = await supabase.storage.from(LOGO_BUCKET).upload(path, buffer, {
    contentType: 'image/webp',
    cacheControl: '31536000',
    upsert: true,
  })

  if (error || !data?.path) {
    throw new Error(error?.message || 'No fue posible guardar el logo optimizado')
  }

  const { data: publicUrlData } = supabase.storage.from(LOGO_BUCKET).getPublicUrl(data.path)
  if (!publicUrlData.publicUrl) throw new Error('Supabase no devolvió la URL pública del logo')
  return publicUrlData.publicUrl
}
