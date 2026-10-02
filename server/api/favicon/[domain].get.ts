import crypto from 'node:crypto'

const FALLBACK_MD5S = new Set([
  'ab1fb25b83d4b333ea661a84bd298b2e', // DuckDuckGo fallback globe
  'b8a0bf372c762e966cc99ede8682bc71', // Google S2 fallback globe (128px)
  '9020ff694c3ceb36ba95da5b81cf738b', // Google S2 fallback globe (16px)
  'fe06af3bda5ebf359d0f251fa1ee492e', // IconHorse placeholder
  '0e6d6eb1006509f6b4cc19280d0d8435', // IconHorse old placeholder
])

const FALLBACK_SIZES = new Set([1478, 726, 2302, 1027, 353])

const memoryCache = new Map<string, { buffer: Buffer; contentType: string } | null>()

async function fetchFavicon(url: string, timeoutMs = 2000): Promise<{ buffer: Buffer; contentType: string } | null> {
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), timeoutMs)

    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      signal: controller.signal
    })
    clearTimeout(timeout)

    if (!res.ok) return null

    const arrayBuffer = await res.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    if (buffer.length === 0 || FALLBACK_SIZES.has(buffer.length)) {
      return null
    }

    const hash = crypto.createHash('md5').update(buffer).digest('hex')
    if (FALLBACK_MD5S.has(hash)) {
      return null
    }

    const contentType = res.headers.get('content-type') || 'image/png'
    return { buffer, contentType }
  } catch {
    return null
  }
}

export default defineEventHandler(async (event) => {
  const rawDomain = getRouterParam(event, 'domain')
  if (!rawDomain) {
    throw createError({ statusCode: 404, statusMessage: 'Domain required' })
  }

  const domain = rawDomain.replace(/^https?:\/\//i, '').replace(/^www\./i, '').split('/')[0].trim().toLowerCase()
  if (!domain || !domain.includes('.')) {
    throw createError({ statusCode: 404, statusMessage: 'Invalid domain' })
  }

  if (memoryCache.has(domain)) {
    const cached = memoryCache.get(domain)
    if (!cached) {
      throw createError({ statusCode: 404, statusMessage: 'Favicon not found' })
    }
    setHeader(event, 'Content-Type', cached.contentType)
    setHeader(event, 'Cache-Control', 'public, max-age=604800, s-maxage=86400, stale-while-revalidate=86400')
    return cached.buffer
  }

  // 1. DuckDuckGo
  let result = await fetchFavicon(`https://icons.duckduckgo.com/ip3/${domain}.ico`, 1800)

  // 2. Google S2 Favicons (filtered by fallback hash / size)
  if (!result) {
    result = await fetchFavicon(`https://t0.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=http://${domain}&size=128`, 1800)
  }

  // 3. Icon Horse (filtered by fallback hash / size)
  if (!result) {
    result = await fetchFavicon(`https://icon.horse/icon/${domain}`, 1800)
  }

  memoryCache.set(domain, result)

  if (result) {
    setHeader(event, 'Content-Type', result.contentType)
    setHeader(event, 'Cache-Control', 'public, max-age=604800, s-maxage=86400, stale-while-revalidate=86400')
    return result.buffer
  }

  throw createError({ statusCode: 404, statusMessage: 'Favicon not found' })
})
