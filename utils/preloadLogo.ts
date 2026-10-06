export const loadedLogoCache = new Set<string>()

export function preloadLogo(url: string | null | undefined) {
  if (!url || typeof window === 'undefined') return
  if (loadedLogoCache.has(url)) return

  try {
    const img = new Image()
    img.src = url
    img.onload = () => {
      loadedLogoCache.add(url)
    }
  } catch {}
}
