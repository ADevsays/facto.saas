<script setup lang="ts">
import AdCard from '../components/AdCard.vue'
import AdCtaCard from '../components/AdCtaCard.vue'

const palette = ['#6366f1', '#ec4899', '#14b8a6', '#f59e0b', '#8b5cf6', '#06b6d4', '#10b981', '#f97316']

function randomColor() {
  return palette[Math.floor(Math.random() * palette.length)]
}

type AdItem = { name: string; tagline: string; emoji: string; color: string }
type CtaItem = { isCta: true }
type TrackItem = AdItem | CtaItem

const ads: AdItem[] = [
  { name: 'Acme Corp',    tagline: 'Scale your SaaS faster',  emoji: '🚀', color: randomColor() },
  { name: 'DevFlow',      tagline: 'Ship code, not bugs',      emoji: '⚡', color: randomColor() },
  { name: 'CloudBase',    tagline: 'Infra for modern teams',   emoji: '☁️', color: randomColor() },
  { name: 'Growthly',     tagline: 'Analytics that convert',   emoji: '📈', color: randomColor() },
  { name: 'Fundify',      tagline: 'VC for indie hackers',     emoji: '💰', color: randomColor() },
  { name: 'LaunchKit',    tagline: 'From idea to revenue',     emoji: '🎯', color: randomColor() },
  { name: 'Shipfast',     tagline: 'Build SaaS in days',       emoji: '⚓', color: randomColor() },
  { name: 'Lemonsqueezy', tagline: 'Payments made simple',     emoji: '🍋', color: randomColor() },
]

const set: TrackItem[] = [...ads, { isCta: true }]
const track = computed<TrackItem[]>(() => [...set, ...set, ...set])

const sectionRef = ref<HTMLElement | null>(null)
const trackRef  = ref<HTMLElement | null>(null)
const isHovered = ref(false)

let rafId: number
let position = 0
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
  if (!isHovered.value && !isUserScrolling) {
    position = wrap(position + SPEED, getOneThird())
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
        <NuxtLink
          v-if="'isCta' in item"
          to="/anunciarse"
          class="sm:hidden ad-card shrink-0 flex items-center gap-4 rounded-xl px-6 py-4 cursor-pointer transition-all duration-500 select-none border border-white/[0.08] bg-white/[0.03]"
        >
          <span class="text-2xl leading-none opacity-60">✦</span>
          <div class="flex flex-col gap-0.5">
            <p class="text-white/70 text-sm font-sans font-medium whitespace-nowrap">Anúnciate aquí</p>
            <p class="text-neutral-500 text-xs font-sans font-extralight tracking-[0.08em] whitespace-nowrap">2/20 cupos libres</p>
          </div>
        </NuxtLink>
        <AdCard v-else v-bind="(item as AdItem)" />
      </template>
    </div>

    <!-- CTA overlay: solo desktop -->
    <div
      class="hidden sm:flex absolute right-0 top-0 bottom-0 items-center pr-4 pl-20 pointer-events-none"
      style="background: linear-gradient(to right, transparent, #030305bb 25%, #030305f0 55%, #030305 100%);"
    >
      <AdCtaCard class="pointer-events-auto" />
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
