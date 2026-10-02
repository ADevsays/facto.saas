import { ref, computed, watch, onMounted } from 'vue'
import type { YoutubeVideoInfo } from '../types'
import { extractYoutubeVideoId, getYoutubeThumbnails } from '../utils/youtube'

const RECENT_SEARCHES_KEY = 'facto_yt_recent_thumbnails'

export function useYoutubeThumbnail() {
  const inputUrl = ref('')
  const errorMsg = ref<string | null>(null)
  const currentVideo = ref<YoutubeVideoInfo | null>(null)
  const recentSearches = ref<{ videoId: string; titleUrl: string }[]>([])
  const isDownloading = ref(false)
  const copiedStatus = ref<string | null>(null)

  const hasResult = computed(() => !!currentVideo.value)

  const loadRecentSearches = () => {
    if (import.meta.client) {
      try {
        const stored = localStorage.getItem(RECENT_SEARCHES_KEY)
        if (stored) {
          recentSearches.value = JSON.parse(stored)
        }
      } catch (e) {
        console.error('Error loading recent searches:', e)
      }
    }
  }

  const saveRecentSearch = (videoId: string, titleUrl: string) => {
    if (!import.meta.client) return
    try {
      const filtered = recentSearches.value.filter(s => s.videoId !== videoId)
      const updated = [{ videoId, titleUrl }, ...filtered].slice(0, 5)
      recentSearches.value = updated
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated))
    } catch (e) {
      console.error('Error saving recent search:', e)
    }
  }

  const processUrl = (urlToProcess?: string) => {
    const target = urlToProcess !== undefined ? urlToProcess : inputUrl.value
    errorMsg.value = null

    if (!target || !target.trim()) {
      currentVideo.value = null
      return false
    }

    const videoId = extractYoutubeVideoId(target)

    if (!videoId) {
      errorMsg.value = 'No pudimos reconocer la URL o ID del video de YouTube.'
      currentVideo.value = null
      return false
    }

    currentVideo.value = getYoutubeThumbnails(videoId, target)
    saveRecentSearch(videoId, target)
    return true
  }

  // Reactividad en tiempo real: Apenas cambie inputUrl, procesar automáticamente
  watch(inputUrl, (newVal) => {
    if (!newVal || !newVal.trim()) {
      currentVideo.value = null
      errorMsg.value = null
    } else {
      processUrl(newVal)
    }
  })

  const copyToClipboard = async (text: string, label: string = 'URL') => {
    try {
      await navigator.clipboard.writeText(text)
      copiedStatus.value = label
      setTimeout(() => {
        if (copiedStatus.value === label) {
          copiedStatus.value = null
        }
      }, 2500)
    } catch (e) {
      console.error('Error al copiar:', e)
    }
  }

  const downloadImage = async (imgUrl: string, fileName: string) => {
    isDownloading.value = true
    try {
      const response = await fetch(imgUrl)
      const blob = await response.blob()
      const blobUrl = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = blobUrl
      a.download = fileName
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(blobUrl)
    } catch (e) {
      window.open(imgUrl, '_blank')
    } finally {
      isDownloading.value = false
    }
  }

  const reset = () => {
    inputUrl.value = ''
    errorMsg.value = null
    currentVideo.value = null
  }

  onMounted(() => {
    loadRecentSearches()
  })

  return {
    inputUrl,
    errorMsg,
    currentVideo,
    recentSearches,
    hasResult,
    isDownloading,
    copiedStatus,
    processUrl,
    copyToClipboard,
    downloadImage,
    reset,
  }
}
