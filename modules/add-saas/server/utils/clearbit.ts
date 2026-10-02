export async function fetchClearbitLogo(websiteUrl: string): Promise<string | null> {
  try {
    const urlObj = new URL(websiteUrl.startsWith('http') ? websiteUrl : `https://${websiteUrl}`)
    const domain = urlObj.hostname.replace('www.', '')
    
    const faviconUrl = `https://icons.duckduckgo.com/ip3/${domain}.ico`
    
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 3000)
    
    const res = await fetch(faviconUrl, { method: 'HEAD', signal: controller.signal })
    clearTimeout(timeoutId)
    
    if (res.ok) return faviconUrl
  } catch (e) {
    console.error('[Publish] Favicon fetch failed:', e)
  }
  return null
}
