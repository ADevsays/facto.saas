import type { ThumbnailOption, YoutubeVideoInfo } from '../types'

/**
 * Extrae el Video ID de YouTube de diversos formatos de URL
 */
export function extractYoutubeVideoId(url: string): string | null {
  if (!url) return null
  
  const cleanUrl = url.trim()
  
  // Regex para soportar youtube.com, youtu.be, shorts, live, embed, etc.
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|shorts\/|watch\?v=|\&v=)([^#\&\?]*).*/
  const match = cleanUrl.match(regExp)

  if (match && match[2].length === 11) {
    return match[2]
  }

  // Si el usuario ingresó directamente el ID de 11 caracteres
  if (/^[a-zA-Z0-9_-]{11}$/.test(cleanUrl)) {
    return cleanUrl
  }

  return null
}

/**
 * Construye la lista de opciones de miniaturas según el Video ID
 */
export function getYoutubeThumbnails(videoId: string, originalUrl: string): YoutubeVideoInfo {
  const baseUrl = `https://img.youtube.com/vi/${videoId}`
  
  const thumbnails: ThumbnailOption[] = [
    {
      quality: 'maxres',
      label: 'Máxima Calidad (MaxRes HD)',
      resolution: '1280 x 720 px',
      url: `${baseUrl}/maxresdefault.jpg`,
      width: 1280,
      height: 720,
    },
    {
      quality: 'sd',
      label: 'Alta Definición (SD)',
      resolution: '640 x 480 px',
      url: `${baseUrl}/sddefault.jpg`,
      width: 640,
      height: 480,
    },
    {
      quality: 'hq',
      label: 'Calidad Alta (HQ)',
      resolution: '480 x 360 px',
      url: `${baseUrl}/hqdefault.jpg`,
      width: 480,
      height: 360,
    },
    {
      quality: 'mq',
      label: 'Calidad Media (MQ)',
      resolution: '320 x 180 px',
      url: `${baseUrl}/mqdefault.jpg`,
      width: 320,
      height: 180,
    },
    {
      quality: 'default',
      label: 'Miniatura Normal (Default)',
      resolution: '120 x 90 px',
      url: `${baseUrl}/default.jpg`,
      width: 120,
      height: 90,
    },
  ]

  return {
    videoId,
    originalUrl,
    embedUrl: `https://www.youtube.com/embed/${videoId}`,
    thumbnails,
  }
}
