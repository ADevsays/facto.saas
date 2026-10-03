<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import AdCard from '../components/AdCard.vue'
import AdEmptyCard from '../components/AdEmptyCard.vue'
import AdCtaCard from '../components/AdCtaCard.vue'
import { useAdsSlots } from '../composables/useAdsSlots'
import { useAddAdModal } from '~/composables/useAddAdModal'
import type { AdSlot } from '../types'

const route = useRoute()
const isDashboard = computed(() => route.path.includes('/dashboard'))
const { openBuy, openAuctionList } = useAddAdModal()
const { safeSlots, topSlots, freeSlotsCount } = useAdsSlots()

// Desktop track: full 20 slots tripled
const trackDesktop = computed<AdSlot[]>(() => [
  ...safeSlots.value,
  ...safeSlots.value,
  ...safeSlots.value
])

// Mobile track: top 10 slots (#1 to #10) tripled
const trackMobile = computed<AdSlot[]>(() => [
  ...topSlots.value,
  ...topSlots.value,
  ...topSlots.value
])

const sectionRef = ref<HTMLElement | null>(null)
const trackDesktopRef = ref<HTMLElement | null>(null)
const trackMobileRef = ref<HTMLElement | null>(null)
const isHovered = ref(false)

let rafId: number
let desktopPos = 0
let mobilePos = 0
let lastTime = 0

let userScrollTimeout: ReturnType<typeof setTimeout>
let isUserScrolling = false
let autoScrollReady = false
const SPEED = 28
const INITIAL_DELAY = 2500

function wrap(pos: number, limit: number) {
  if (limit <= 0) return pos
  while (pos >= limit) pos -= limit
  while (pos < 0) pos += limit
  return pos
}

function tick(timestamp: number) {
  if (!lastTime) lastTime = timestamp
  const dt = Math.min((timestamp - lastTime) / 1000, 0.1)
  lastTime = timestamp

  if (autoScrollReady && !isHovered.value && !isUserScrolling) {
    if (trackDesktopRef.value) {
      const limit = trackDesktopRef.value.scrollWidth / 3
      if (limit > 0) {
        desktopPos = wrap(desktopPos + SPEED * dt, limit)
        trackDesktopRef.value.style.transform = `translateX(${-desktopPos}px)`
      }
    }
    if (trackMobileRef.value) {
      const limitMobile = trackMobileRef.value.scrollWidth / 3
      if (limitMobile > 0) {
        mobilePos = wrap(mobilePos + SPEED * 0.9 * dt, limitMobile)
        trackMobileRef.value.style.transform = `translateX(${-mobilePos}px)`
      }
    }
  }
  rafId = requestAnimationFrame(tick)
}

function onWheel(e: WheelEvent) {
  e.preventDefault()
  autoScrollReady = true
  if (trackDesktopRef.value) {
    const limit = trackDesktopRef.value.scrollWidth / 3
    desktopPos = wrap(desktopPos + e.deltaX + e.deltaY * 0.3, limit)
  }
  if (trackMobileRef.value) {
    const limitMobile = trackMobileRef.value.scrollWidth / 3
    mobilePos = wrap(mobilePos + e.deltaX + e.deltaY * 0.3, limitMobile)
  }
  isUserScrolling = true
  clearTimeout(userScrollTimeout)
  userScrollTimeout = setTimeout(() => { isUserScrolling = false }, 1200)
}

let isDragging = false
let dragStartX = 0
let dragMoved = false
const DRAG_THRESHOLD = 5

function onPointerDown(e: PointerEvent) {
  isDragging = true
  dragStartX = e.clientX
  dragMoved = false
  autoScrollReady = true
  isUserScrolling = true
  clearTimeout(userScrollTimeout)
}

function onPointerMove(e: PointerEvent) {
  if (!isDragging) return
  const dx = e.clientX - dragStartX
  if (Math.abs(dx) > DRAG_THRESHOLD) dragMoved = true
  if (!dragMoved) return

  dragStartX = e.clientX
  if (trackDesktopRef.value) {
    const limit = trackDesktopRef.value.scrollWidth / 3
    desktopPos = wrap(desktopPos - dx, limit)
    trackDesktopRef.value.style.transform = `translateX(${-desktopPos}px)`
  }
  if (trackMobileRef.value) {
    const limitMobile = trackMobileRef.value.scrollWidth / 3
    mobilePos = wrap(mobilePos - dx, limitMobile)
    trackMobileRef.value.style.transform = `translateX(${-mobilePos}px)`
  }
}

function onPointerUp() {
  if (!isDragging) return
  isDragging = false
  clearTimeout(userScrollTimeout)
  userScrollTimeout = setTimeout(() => { isUserScrolling = false }, 1200)
}

function onClickCapture(e: MouseEvent) {
  if (dragMoved) {
    e.preventDefault()
    e.stopPropagation()
  }
}

function onEmptySlotClick(pos: number) {
  if (dragMoved) return
  const slotData = safeSlots.value.find(s => s.position === pos)
  const price = slotData?.currentPrice ?? (pos === 1 ? 10 : 1)
  openBuy(pos, price)
}

let delayTimeout: ReturnType<typeof setTimeout>

onMounted(() => {
  const el = sectionRef.value
  if (el) {
    el.addEventListener('wheel', onWheel, { passive: false })
    el.addEventListener('pointerdown', onPointerDown)
    el.addEventListener('click', onClickCapture, true)
  }
  document.addEventListener('pointermove', onPointerMove)
  document.addEventListener('pointerup', onPointerUp)
  document.addEventListener('pointercancel', onPointerUp)
  rafId = requestAnimationFrame(tick)
  delayTimeout = setTimeout(() => { autoScrollReady = true }, INITIAL_DELAY)
})

onUnmounted(() => {
  const el = sectionRef.value
  if (el) {
    el.removeEventListener('wheel', onWheel)
    el.removeEventListener('pointerdown', onPointerDown)
    el.removeEventListener('click', onClickCapture, true)
  }
  document.removeEventListener('pointermove', onPointerMove)
  document.removeEventListener('pointerup', onPointerUp)
  document.removeEventListener('pointercancel', onPointerUp)
  cancelAnimationFrame(rafId)
  clearTimeout(userScrollTimeout)
  clearTimeout(delayTimeout)
})
</script>

<template>
  <section
    ref="sectionRef"
    :class="[
      'w-full overflow-hidden py-3 md:py-4 border-y border-white/5 bg-[#030305]/90 backdrop-blur-md',
      isDashboard ? 'relative' : 'sticky top-0 z-20'
    ]"
    @mouseenter="isHovered = true"
    @mouseleave="isHovered = false"
  >
    <!-- Desktop Layout: Full 20 Slots with Sticky CTA -->
    <div class="hidden md:block relative w-full overflow-hidden">
      <div ref="trackDesktopRef" class="ads-track">
        <template v-for="(slot, i) in trackDesktop" :key="`desktop-${slot.position}-${slot.ad?.id || 'empty'}-${slot.ad?.name || ''}-${i}`">
          <AdCard
            v-if="!slot.isAvailable && slot.ad"
            v-bind="slot.ad"
            :position="slot.position"
          />
          <AdEmptyCard
            v-else
            :position="slot.position"
            :price="slot.currentPrice"
            @click="onEmptySlotClick"
          />
        </template>
      </div>

      <!-- Desktop CTA overlay -->
      <div
        class="absolute right-0 top-0 bottom-0 flex items-center pr-4 pl-16 pointer-events-none"
        style="background: linear-gradient(to right, transparent, #030305bb 30%, #030305f0 60%, #030305 100%);"
      >
        <AdCtaCard
          :free-slots="freeSlotsCount"
          @click="openAuctionList"
          class="pointer-events-auto cursor-pointer"
        />
      </div>
    </div>

    <!-- Mobile Layout: Top 10 Slots (#1 to #10) in a single thin row -->
    <div class="block md:hidden overflow-hidden w-full relative">
      <div ref="trackMobileRef" class="ads-track-mobile">
        <template v-for="(slot, i) in trackMobile" :key="`mobile-${slot.position}-${slot.ad?.id || 'empty'}-${slot.ad?.name || ''}-${i}`">
          <AdCard
            v-if="!slot.isAvailable && slot.ad"
            v-bind="slot.ad"
            :position="slot.position"
          />
          <AdEmptyCard
            v-else
            :position="slot.position"
            :price="slot.currentPrice"
            @click="onEmptySlotClick"
          />
        </template>
      </div>
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
  touch-action: none;
  cursor: grab;
}

.ads-track-mobile {
  display: flex;
  gap: 0.5rem;
  padding: 0 0.5rem;
  width: max-content;
  will-change: transform;
  touch-action: none;
  cursor: grab;
}
</style>
