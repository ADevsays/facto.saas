export type ThumbnailQuality = 'maxres' | 'sd' | 'hq' | 'mq' | 'default'

export interface ThumbnailOption {
  quality: ThumbnailQuality
  label: string
  resolution: string
  url: string
  width: number
  height: number
}

export interface YoutubeVideoInfo {
  videoId: string
  originalUrl: string
  embedUrl: string
  thumbnails: ThumbnailOption[]
}
