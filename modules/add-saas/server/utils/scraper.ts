import * as cheerio from 'cheerio'

export async function fetchWebsiteMetaDescription(url: string): Promise<string | null> {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 8000)

    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'es,en;q=0.9',
        'Cache-Control': 'no-cache',
      },
      redirect: 'follow',
    })
    clearTimeout(timeoutId)

    if (!res.ok) return null

    const contentType = res.headers.get('content-type') || ''
    if (!contentType.includes('text/html') && !contentType.includes('application/xhtml')) return null

    const html = await res.text()
    const $ = cheerio.load(html)

    // Using case-insensitive attribute selectors 'i' which cheerio supports
    const description = $('meta[name="description" i]').attr('content')?.trim()
      || $('meta[property="og:description" i]').attr('content')?.trim()
      || $('meta[name="twitter:description" i]').attr('content')?.trim()
      || $('meta[itemprop="description" i]').attr('content')?.trim()

    if (description && description.length > 5) {
      return description.substring(0, 500)
    }
  } catch (e) {
    console.error('[Publish] Meta description fetch failed:', e)
  }
  return null
}
