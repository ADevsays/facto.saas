import sharp from 'sharp'

const LOGO_PREFIX = '/storage/v1/object/public/saas_logos/'

function getStoredLogoUrl(path: string, supabaseUrl: string): string | null {
  const cleanPath = path.replace(/^\/+/, '')
  if (!cleanPath || cleanPath.includes('..')) return null

  return `${supabaseUrl.replace(/\/$/, '')}${LOGO_PREFIX}${cleanPath}`
}

export default defineEventHandler(async (event) => {
  const path = getQuery(event).path
  const config = useRuntimeConfig(event)
  const sourceUrl = typeof path === 'string' && config.supabaseUrl
    ? getStoredLogoUrl(path, String(config.supabaseUrl))
    : null

  if (!sourceUrl) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid stored logo path' })
  }

  const response = await fetch(sourceUrl, { signal: AbortSignal.timeout(3_000) })
  if (!response.ok) {
    throw createError({ statusCode: 404, statusMessage: 'Stored logo not found' })
  }

  const png = await sharp(Buffer.from(await response.arrayBuffer()), { failOn: 'none' })
    .resize(128, 128, { fit: 'inside', withoutEnlargement: true })
    .png()
    .toBuffer()

  setHeader(event, 'Content-Type', 'image/png')
  setHeader(event, 'Cache-Control', 'public, max-age=31536000, immutable, s-maxage=31536000')
  setHeader(event, 'Vercel-CDN-Cache-Control', 's-maxage=31536000, stale-while-revalidate=86400')
  return png
})
