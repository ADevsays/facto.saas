import sharp from 'sharp'

const MAX_OG_MEDIA_BYTES = 2 * 1024 * 1024

function isWebp(buffer: Buffer, contentType: string | null): boolean {
  return contentType?.toLowerCase().includes('image/webp') === true
    || (buffer.subarray(0, 4).toString('ascii') === 'RIFF'
      && buffer.subarray(8, 12).toString('ascii') === 'WEBP')
}

export async function fetchWebpAsPngDataUrl(
  sourceUrl: string,
  fetchImage: typeof fetch = fetch,
): Promise<string | null> {
  const response = await fetchImage(sourceUrl, { signal: AbortSignal.timeout(3_000) })
  if (!response.ok) return null

  const contentLength = Number(response.headers.get('content-length') || 0)
  if (contentLength > MAX_OG_MEDIA_BYTES) return null

  const input = Buffer.from(await response.arrayBuffer())
  if (!input.length || input.length > MAX_OG_MEDIA_BYTES || !isWebp(input, response.headers.get('content-type'))) {
    return null
  }

  const png = await sharp(input, { failOn: 'none' }).png().toBuffer()
  return `data:image/png;base64,${png.toString('base64')}`
}
