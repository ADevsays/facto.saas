export async function fetchClearbitLogo(websiteUrl: string): Promise<string | null> {
  try {
    const urlObj = new URL(websiteUrl.startsWith('http') ? websiteUrl : `https://${websiteUrl}`)
    const domain = urlObj.hostname.replace('www.', '')
    
    // Usar Google Favicon en lugar de Clearbit (logo.clearbit.com está fallando)
    const faviconUrl = `https://s2.googleusercontent.com/s2/favicons?domain=${domain}&sz=128`
    
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
