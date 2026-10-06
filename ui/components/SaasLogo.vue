<script setup lang="ts">
import { ref, onMounted, watch, nextTick } from 'vue'
import { loadedLogoCache } from '~/utils/preloadLogo'

const failedImageCache = new Set<string>()

const props = withDefaults(defineProps<{
  src: string | null | undefined
  alt: string
  initial: string
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'custom'
  gemColor?: string
  rounded?: 'lg' | 'xl'
  websiteUrl?: string | null
  priority?: boolean
}>(), {
  size: 'md',
  rounded: 'lg',
  priority: false
})

const loaded = ref(false)
const failed = ref(false)
const isCached = ref(false)
const currentSrc = ref<string | null>(null)
const imgRef = ref<HTMLImageElement | null>(null)
let attemptIndex = 0

function extractDomain(url: string | null | undefined): string | null {
  if (!url) return null
  try {
    const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`)
    return urlObj.hostname.replace('www.', '')
  } catch {
    return null
  }
}

function extractDomainFromGoogleFavicon(url: string | null | undefined): string | null {
  if (!url) return null
  try {
    const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`)
    return urlObj.searchParams.get('domain') || null
  } catch {
    return null
  }
}

function isGoogleFaviconUrl(url: string | null | undefined): boolean {
  if (!url) return false
  return url.includes('googleusercontent.com/s2/favicons') || 
         url.includes('google.com/s2/favicons') || 
         url.includes('gstatic.com/faviconV2')
}

function getCandidateUrls(): string[] {
  const list: string[] = []

  if (props.src && !isGoogleFaviconUrl(props.src)) {
    list.push(props.src)
  }

  let domain = extractDomain(props.websiteUrl)
  if (!domain && isGoogleFaviconUrl(props.src)) {
    domain = extractDomainFromGoogleFavicon(props.src)
  }

  if (domain) {
    const apiFavicon = `/api/favicon/${domain}`
    if (!list.includes(apiFavicon)) list.push(apiFavicon)
  }

  if (props.src && !list.includes(props.src)) {
    list.push(props.src)
  }

  if (domain) {
    const googleFallback = `https://s2.googleusercontent.com/s2/favicons?domain=${domain}&sz=128`
    if (!list.includes(googleFallback)) list.push(googleFallback)
  }

  return list
}

function initLoad() {
  failed.value = false
  attemptIndex = 0

  const candidates = getCandidateUrls()
  if (!candidates.length) {
    failed.value = true
    currentSrc.value = null
    loaded.value = false
    isCached.value = false
    return
  }

  const firstAvailable = candidates.find(url => !failedImageCache.has(url))
  if (!firstAvailable) {
    failed.value = true
    currentSrc.value = null
    loaded.value = false
    isCached.value = false
    return
  }

  attemptIndex = candidates.indexOf(firstAvailable)
  currentSrc.value = firstAvailable

  if (loadedLogoCache.has(firstAvailable)) {
    isCached.value = true
    loaded.value = true
  } else {
    isCached.value = false
    loaded.value = false
  }
}

function isPlaceholderImage(img: HTMLImageElement): boolean {
  try {
    const canvas = document.createElement('canvas')
    canvas.width = 16
    canvas.height = 16
    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    if (!ctx) return false
    
    ctx.drawImage(img, 0, 0, 16, 16)
    const imgData = ctx.getImageData(0, 0, 16, 16).data
    
    let grayCount = 0
    let fallbackColorCount = 0
    const totalPixels = 16 * 16

    for (let i = 0; i < imgData.length; i += 4) {
      const r = imgData[i]
      const g = imgData[i + 1]
      const b = imgData[i + 2]
      const a = imgData[i + 3]

      if (a < 10) continue

      if (Math.abs(r - g) <= 4 && Math.abs(g - b) <= 4) {
        grayCount++
        if (r >= 210 && r <= 242) {
          fallbackColorCount++
        }
      }
    }

    return (fallbackColorCount / totalPixels) > 0.4 && (grayCount / totalPixels) > 0.85
  } catch {
    return false
  }
}

function checkImageStatus() {
  const img = imgRef.value
  if (!img) return

  if (img.complete) {
    if (img.naturalWidth > 0) {
      if (currentSrc.value?.includes('icon.horse') && isPlaceholderImage(img)) {
        onImageError()
        return
      }
      if (currentSrc.value) {
        loadedLogoCache.add(currentSrc.value)
      }
      loaded.value = true
      isCached.value = true
    } else if (img.naturalWidth === 0 && currentSrc.value) {
      onImageError()
    }
  }
}

function onImageLoad(event?: Event) {
  const target = (event?.target as HTMLImageElement | null) || imgRef.value

  if (target && currentSrc.value?.includes('icon.horse') && isPlaceholderImage(target)) {
    onImageError()
    return
  }

  if (currentSrc.value) {
    loadedLogoCache.add(currentSrc.value)
  }
  loaded.value = true
}

function onImageError() {
  if (currentSrc.value) {
    failedImageCache.add(currentSrc.value)
  }

  const candidates = getCandidateUrls()
  attemptIndex++

  while (attemptIndex < candidates.length) {
    const nextCandidate = candidates[attemptIndex]
    if (!failedImageCache.has(nextCandidate)) {
      currentSrc.value = nextCandidate
      if (loadedLogoCache.has(nextCandidate)) {
        isCached.value = true
        loaded.value = true
      } else {
        loaded.value = false
        isCached.value = false
      }
      nextTick(() => {
        checkImageStatus()
      })
      return
    }
    attemptIndex++
  }

  failed.value = true
}

initLoad()

onMounted(() => {
  checkImageStatus()
  nextTick(() => {
    checkImageStatus()
  })
})

watch(() => [props.src, props.websiteUrl], () => {
  initLoad()
  nextTick(() => {
    checkImageStatus()
  })
})

const sizeMap = {
  sm: 'w-7 h-7',
  md: 'w-8 h-8',
  lg: 'w-12 h-12',
  xl: 'w-10 h-10 md:w-14 md:h-14',
  custom: '',
}
</script>

<template>
  <div
    class="logo-wrap relative overflow-hidden shrink-0 flex items-center justify-center transition-colors duration-300"
    :class="[
      sizeMap[size || 'md'],
      rounded === 'xl' ? 'rounded-xl' : 'rounded-lg'
    ]"
    :style="{
      backgroundColor: !loaded || failed
        ? `color-mix(in srgb, ${gemColor || '#22d3ee'} 12%, transparent)`
        : 'transparent',
      borderColor: !loaded || failed
        ? `color-mix(in srgb, ${gemColor || '#22d3ee'} 20%, transparent)`
        : 'transparent',
      borderWidth: '1px',
      borderStyle: 'solid'
    }"
  >
    <!-- Fallback initial: Facto Gem Style (smooth fade out when image arrives) -->
    <span
      v-if="!loaded || failed"
      class="logo-initial font-serif font-bold text-white/80 select-none transition-opacity duration-300 pointer-events-none"
      :class="[
        loaded ? 'opacity-0' : 'opacity-100',
        {
          'text-[11px]': size === 'sm',
          'text-xs': !size || size === 'md',
          'text-lg': size === 'lg',
          'text-lg md:text-xl': size === 'xl'
        }
      ]"
      :style="{ color: gemColor || '#22d3ee' }"
    >
      {{ initial }}
    </span>

    <!-- Real image with smooth fade-in (instant if cached) -->
    <img
      v-if="currentSrc && !failed"
      ref="imgRef"
      :src="currentSrc"
      :alt="alt"
      :crossorigin="currentSrc?.includes('icon.horse') ? 'anonymous' : undefined"
      class="absolute inset-0 w-full h-full object-cover"
      :class="[
        loaded ? 'opacity-100' : 'opacity-0',
        isCached ? '' : 'transition-opacity duration-300 ease-out'
      ]"
      :loading="priority || size === 'xl' ? 'eager' : 'lazy'"
      :fetchpriority="priority || size === 'xl' ? 'high' : 'auto'"
      decoding="async"
      @load="onImageLoad"
      @error="onImageError"
    />
  </div>
</template>
