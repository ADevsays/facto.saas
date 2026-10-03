<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import AdCard from '../components/AdCard.vue'
import AdEmptyCard from '../components/AdEmptyCard.vue'
import AdCtaCard from '../components/AdCtaCard.vue'
import { useAdsSlots } from '../composables/useAdsSlots'
import { useAddAdModal } from '~/composables/useAddAdModal'
import type { AdSlot } from '../types'

const { openBuy, openAuctionList } = useAddAdModal()
const { bottomSlots, freeSlotsCount, safeSlots } = useAdsSlots()

const track = computed<AdSlot[]>(() => [
  ...bottomSlots.value,
  ...bottomSlots.value,
  ...bottomSlots.value
])

const sectionRef = ref<HTMLElement | null>(null)
const trackRef = ref<HTMLElement | null>(null)
const isHovered = ref(false)

let rafId: number
let position = 0
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

  if (autoScrollReady && !isHovered.value && !isUserScrolling && trackRef.value) {
    const limit = trackRef.value.scrollWidth / 3
    if (limit > 0) {
      position = wrap(position + SPEED * dt, limit)
      trackRef.value.style.transform = `translateX(${-position}px)`
    }
  }
  rafId = requestAnimationFrame(tick)
}

function onWheel(e: WheelEvent) {
  e.preventDefault()
  autoScrollReady = true
  if (trackRef.value) {
    const limit = trackRef.value.scrollWidth / 3
    position = wrap(position + e.deltaX + e.deltaY * 0.3, limit)
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
  if (trackRef.value) {
    const limit = trackRef.value.scrollWidth / 3
    position = wrap(position - dx, limit)
    trackRef.value.style.transform = `translateX(${-position}px)`
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
    class="w-full overflow-hidden py-3 border-t border-white/10 bg-[#030305]/95 backdrop-blur-md fixed bottom-0 left-0 right-0 z-30 block md:hidden shadow-[0_-8px_30px_rgba(0,0,0,0.85)]"
    @mouseenter="isHovered = true"
    @mouseleave="isHovered = false"
  >
    <div class="overflow-hidden w-full relative">
      <div ref="trackRef" class="ads-track-mobile">
        <template v-for="(slot, i) in track" :key="`bot-${slot.position}-${slot.ad?.id || 'empty'}-${slot.ad?.name || ''}-${i}`">
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

      <!-- Mobile CTA Compact Button at the end of the bottom row -->
      <div
        class="absolute right-0 top-0 bottom-0 flex items-center pr-2 pl-6 pointer-events-none"
        style="background: linear-gradient(to right, transparent, #030305cc 35%, #030305 100%);"
      >
        <AdCtaCard
          :free-slots="freeSlotsCount"
          :compact="true"
          @click="openAuctionList"
          class="pointer-events-auto cursor-pointer"
        />
      </div>
    </div>
  </section>
</template>

<style scoped>
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

