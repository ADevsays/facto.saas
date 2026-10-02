<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'

// Cache global para recordar imágenes que ya cargaron en esta sesión
const loadedImageCache = new Set<string>()
const failedImageCache = new Set<string>()

const props = defineProps<{
  src: string | null | undefined
  alt: string
  initial: string
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'custom'
  gemColor?: string
  rounded?: 'lg' | 'xl'
  websiteUrl?: string | null
}>()

const loaded = ref(false)
const failed = ref(false)
const isCached = ref(false)
const currentSrc = ref<string | null>(null)
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
  loaded.value = false
  failed.value = false
  isCached.value = false
  attemptIndex = 0

  const candidates = getCandidateUrls()
  if (!candidates.length) {
    failed.value = true
    currentSrc.value = null
    return
  }

  const firstAvailable = candidates.find(url => !failedImageCache.has(url))
  if (!firstAvailable) {
    failed.value = true
    currentSrc.value = null
    return
  }

  attemptIndex = candidates.indexOf(firstAvailable)

  if (loadedImageCache.has(firstAvailable)) {
    isCached.value = true
    loaded.value = true
    currentSrc.value = firstAvailable
    return
  }

  currentSrc.value = firstAvailable
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

function onImageLoad(event: Event) {
  const target = event.target as HTMLImageElement | null

  if (target && currentSrc.value?.includes('icon.horse') && isPlaceholderImage(target)) {
    onImageError()
    return
  }

  if (currentSrc.value) {
    loadedImageCache.add(currentSrc.value)
  }
  loaded.value = true
}

function onImageError() {
  if (currentSrc.value) {
    failedImageCache.add(currentSrc.value)
  }

  const candidates = getCandidateUrls()
  attemptIndex++

  // Probar siguiente candidato en la cascada
  while (attemptIndex < candidates.length) {
    const nextCandidate = candidates[attemptIndex]
    if (!failedImageCache.has(nextCandidate)) {
      currentSrc.value = nextCandidate
      return
    }
    attemptIndex++
  }

  // Si todos los candidatos de la cascada fallaron -> Mostrar letra (última opción)
  failed.value = true
}

onMounted(() => initLoad())
watch(() => [props.src, props.websiteUrl], () => initLoad())

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
    class="logo-wrap relative overflow-hidden shrink-0 flex items-center justify-center"
    :class="[
      sizeMap[size || 'md'],
      rounded === 'xl' ? 'rounded-xl' : 'rounded-lg'
    ]"
    :style="{
      backgroundColor: !loaded || failed
        ? `color-mix(in srgb, ${gemColor || '#22d3ee'} 15%, transparent)`
        : 'transparent',
      border: !loaded || failed
        ? `1px solid color-mix(in srgb, ${gemColor || '#22d3ee'} 25%, transparent)`
        : 'none'
    }"
  >
    <!-- Fallback initial: Facto Gem Style (Última opción cuando la cascada falla) -->
    <span
      v-if="!loaded || failed"
      class="logo-initial font-serif font-bold text-white/80 select-none"
      :class="{
        'text-[11px]': size === 'sm',
        'text-xs': !size || size === 'md',
        'text-lg': size === 'lg',
        'text-lg md:text-xl': size === 'xl'
      }"
      :style="{ color: gemColor || '#22d3ee' }"
    >
      {{ initial }}
    </span>

    <!-- Real image with fade-in -->
    <img
      v-if="currentSrc && !failed"
      :src="currentSrc"
      :alt="alt"
      :crossorigin="currentSrc?.includes('icon.horse') ? 'anonymous' : undefined"
      class="absolute inset-0 w-full h-full object-cover"
      :class="[
        loaded ? 'opacity-100' : 'opacity-0',
        isCached ? '' : 'transition-opacity duration-300'
      ]"
      loading="lazy"
      decoding="async"
      @load="onImageLoad"
      @error="onImageError"
    />
  </div>
</template>
