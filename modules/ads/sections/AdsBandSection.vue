<script setup lang="ts">
import AdCard from '../components/AdCard.vue'
import AdCtaCard from '../components/AdCtaCard.vue'
import { useAddAdModal } from '~/composables/useAddAdModal'
import type { Ad } from '../types'

const { open: openAdModal } = useAddAdModal()

type TrackItem = Ad | { isCta: true }

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

const { data: activeAds } = await useFetch<Ad[]>('/api/ads/active')

const ads = ref<Ad[]>([])
const set = computed<TrackItem[]>(() => [...ads.value, { isCta: true }])
const track = computed<TrackItem[]>(() => [...set.value, ...set.value, ...set.value])

const sectionRef = ref<HTMLElement | null>(null)
const trackRef  = ref<HTMLElement | null>(null)
const isHovered = ref(false)

let rafId: number
let position = 0
let positionInitialized = false
let userScrollTimeout: ReturnType<typeof setTimeout>
let isUserScrolling = false
const SPEED = 0.1

function getOneThird() {
  return trackRef.value ? trackRef.value.scrollWidth / 3 : 0
}

function wrap(pos: number, limit: number) {
  if (limit === 0) return pos
  while (pos >= limit) pos -= limit
  while (pos < 0)    pos += limit
  return pos
}

function tick() {
  const limit = getOneThird()
  if (!positionInitialized && limit > 0) {
    position = Math.random() * limit
    positionInitialized = true
  }
  if (!isHovered.value && !isUserScrolling) {
    position = wrap(position + SPEED, limit)
  }
  if (trackRef.value) {
    trackRef.value.style.transform = `translateX(${-position}px)`
  }
  rafId = requestAnimationFrame(tick)
}

function onWheel(e: WheelEvent) {
  e.preventDefault()
  position = wrap(position + e.deltaX + e.deltaY * 0.3, getOneThird())
  isUserScrolling = true
  clearTimeout(userScrollTimeout)
  userScrollTimeout = setTimeout(() => { isUserScrolling = false }, 1200)
}

onMounted(() => {
  ads.value = shuffle(activeAds.value || [])
  sectionRef.value?.addEventListener('wheel', onWheel, { passive: false })
  rafId = requestAnimationFrame(tick)
})

onUnmounted(() => {
  sectionRef.value?.removeEventListener('wheel', onWheel)
  cancelAnimationFrame(rafId)
  clearTimeout(userScrollTimeout)
})
</script>

<template>
  <section
    ref="sectionRef"
    class="w-full overflow-hidden py-6 border-y border-white/5 sticky top-0 z-10 bg-[#030305]/85 backdrop-blur-sm"
  >
    <div
      ref="trackRef"
      class="ads-track"
      @mouseenter="isHovered = true"
      @mouseleave="isHovered = false"
    >
      <template v-for="(item, i) in track" :key="i">
        <div
          v-if="'isCta' in item"
          @click="openAdModal"
          class="sm:hidden ad-card shrink-0 flex items-center gap-4 rounded-xl px-6 py-4 cursor-pointer transition-all duration-500 select-none border border-white/[0.08] bg-white/[0.03]"
        >
          <span class="text-2xl leading-none opacity-60">✦</span>
          <div class="flex flex-col gap-0.5">
            <p class="text-white/70 text-sm font-sans font-medium whitespace-nowrap">Anúnciate aquí</p>
            <p class="text-neutral-500 text-xs font-sans font-extralight tracking-[0.08em] whitespace-nowrap">2/20 cupos libres</p>
          </div>
        </div>
        <AdCard v-else v-bind="(item as Ad)" />
      </template>
    </div>

    <!-- CTA overlay: solo desktop -->
    <div
      class="hidden sm:flex absolute right-0 top-0 bottom-0 items-center pr-4 pl-20 pointer-events-none"
      style="background: linear-gradient(to right, transparent, #030305bb 25%, #030305f0 55%, #030305 100%);"
    >
      <AdCtaCard @click="openAdModal" class="pointer-events-auto cursor-pointer" />
    </div>
  </section>
</template>

<style scoped>
.ads-track {
  display: flex;
  gap: 1rem;
  padding: 0 1rem;
  width: max-content;
  will-change: transform;
}

</style>
