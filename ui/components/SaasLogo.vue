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
}>()

const loaded = ref(false)
const failed = ref(false)
const isCached = ref(false)

function preload(url: string | null | undefined) {
  loaded.value = false
  failed.value = false
  isCached.value = false
  
  if (!url) {
    failed.value = true
    return
  }

  // Fast path: Si ya cargó antes en esta sesión, mostramos instantáneo sin animación
  if (loadedImageCache.has(url)) {
    isCached.value = true
    loaded.value = true
    return
  }
  if (failedImageCache.has(url)) {
    failed.value = true
    return
  }

  const img = new Image()
  img.onload = () => { 
    loaded.value = true 
    loadedImageCache.add(url)
  }
  img.onerror = () => { 
    failed.value = true 
    failedImageCache.add(url)
  }
  img.src = url
}

onMounted(() => preload(props.src))
watch(() => props.src, (val) => preload(val))

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
    <!-- Fallback initial -->
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
      v-if="src && !failed"
      :src="src"
      :alt="alt"
      class="absolute inset-0 w-full h-full object-cover"
      :class="[
        loaded ? 'opacity-100' : 'opacity-0',
        isCached ? '' : 'transition-opacity duration-300'
      ]"
      loading="lazy"
      decoding="async"
      @load="loaded = true"
      @error="failed = true"
    />
  </div>
</template>
