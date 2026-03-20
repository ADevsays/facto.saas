<script setup lang="ts">
import AdCard from '../components/AdCard.vue'
import AdCtaCard from '../components/AdCtaCard.vue'

const palette = ['#6366f1', '#ec4899', '#14b8a6', '#f59e0b', '#8b5cf6', '#06b6d4', '#10b981', '#f97316']

function randomColor() {
  return palette[Math.floor(Math.random() * palette.length)]
}

const ads = [
  { name: 'Acme Corp',    tagline: 'Scale your SaaS faster',  emoji: '🚀', color: randomColor() },
  { name: 'DevFlow',      tagline: 'Ship code, not bugs',      emoji: '⚡', color: randomColor() },
  { name: 'CloudBase',    tagline: 'Infra for modern teams',   emoji: '☁️', color: randomColor() },
  { name: 'Growthly',     tagline: 'Analytics that convert',   emoji: '📈', color: randomColor() },
  { name: 'Fundify',      tagline: 'VC for indie hackers',     emoji: '💰', color: randomColor() },
  { name: 'LaunchKit',    tagline: 'From idea to revenue',     emoji: '🎯', color: randomColor() },
  { name: 'Shipfast',     tagline: 'Build SaaS in days',       emoji: '⚓', color: randomColor() },
  { name: 'Lemonsqueezy', tagline: 'Payments made simple',     emoji: '🍋', color: randomColor() },
]

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
    @mouseenter="isHovered = true"
    @mouseleave="isHovered = false"
  >
    <div ref="trackRef" class="ads-track">
      <AdCard
        v-for="(ad, i) in [...ads, ...ads, ...ads]"
        :key="i"
        v-bind="ad"
      />
    </div>

    <!-- CTA estático anclado a la derecha, siempre visible -->
    <div
      class="absolute right-0 top-0 bottom-0 flex items-center pr-4 pl-20 pointer-events-none"
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
