<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useKeycapSound } from '~/composables/useKeycapSound'

const props = defineProps<{
  name: string
  description: string
  url: string
  image_url: string
  position?: number
}>()

const { playNextKeySound } = useKeycapSound()
const imageError = ref(false)

watch(
  () => props.image_url,
  () => {
    imageError.value = false
  }
)

const targetUrl = computed(() => {
  const raw = (props.url || '').trim()
  if (!raw) return '#'
  if (/^https?:\/\//i.test(raw)) return raw
  return `https://${raw}`
})

const isPositionOne = computed(() => props.position === 1)

const AD_PALETTE = [
  '#00D4FF', // Cyan
  '#a855f7', // Purple
  '#ec4899', // Pink
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#6366f1', // Indigo
  '#06b6d4', // Teal
  '#f97316', // Orange
  '#3b82f6', // Blue
  '#14b8a6', // Mint
  '#d946ef', // Fuchsia
  '#e11d48'  // Rose
]

const cardColor = computed(() => {
  if (isPositionOne.value) return '#FFD700'
  const pos = props.position ? props.position : 2
  return AD_PALETTE[(pos - 2) % AD_PALETTE.length]
})
</script>

<template>
  <a
    :href="targetUrl"
    target="_blank"
    rel="noopener noreferrer"
    @click="playNextKeySound"
    :class="[
      'ad-card group shrink-0 flex items-center gap-3 md:gap-3.5 rounded-xl px-4 py-2.5 md:px-5 md:py-3 cursor-pointer transition-all duration-500 select-none border w-[290px] sm:w-[320px] md:w-[340px] max-w-[340px] relative overflow-hidden',
      isPositionOne
        ? 'gold-glow-border bg-[#FFD700]/[0.05] hover:bg-[#FFD700]/[0.1] hover:scale-[1.01]'
        : ''
    ]"
    :style="!isPositionOne ? {
      borderColor: `${cardColor}44`,
      backgroundColor: `${cardColor}0d`,
      boxShadow: `0 0 16px ${cardColor}15`,
      '--card-color': cardColor
    } : {}"
  >
    <!-- Slot 1 Top Highlight Sheen -->
    <div
      v-if="isPositionOne"
      class="absolute inset-0 pointer-events-none gold-sheen opacity-40 group-hover:opacity-70 transition-opacity"
    ></div>

    <!-- Logo or Fallback Initial -->
    <img
      v-if="image_url && !imageError"
      :src="image_url"
      :alt="name"
      @error="imageError = true"
      class="w-9 h-9 md:w-10 md:h-10 object-contain rounded-xl shrink-0 p-1 bg-black/40 border"
      :style="{ borderColor: isPositionOne ? 'rgba(255,215,0,0.4)' : `${cardColor}40` }"
    />
    <div
      v-else
      class="w-9 h-9 md:w-10 md:h-10 rounded-xl shrink-0 flex items-center justify-center font-serif font-bold text-base md:text-lg border select-none"
      :style="isPositionOne ? {
        backgroundColor: 'rgba(255,215,0,0.15)',
        borderColor: 'rgba(255,215,0,0.5)',
        color: '#FFD700'
      } : {
        backgroundColor: `${cardColor}18`,
        borderColor: `${cardColor}40`,
        color: cardColor
      }"
    >
      {{ (name || 'A').charAt(0).toUpperCase() }}
    </div>

    <!-- Content (takes remaining width) -->
    <div class="flex-1 min-w-0 flex flex-col justify-center gap-0.5 relative z-10">
      <div class="flex items-center gap-1.5">
        <p class="text-white text-[13px] md:text-sm font-sans font-medium whitespace-nowrap truncate">
          {{ name }}
        </p>
        <span
          class="text-[9px] font-sans font-bold uppercase tracking-wider px-1.5 py-0.2 rounded border shrink-0"
          :style="isPositionOne ? {
            color: '#FFD700',
            backgroundColor: 'rgba(255,215,0,0.15)',
            borderColor: 'rgba(255,215,0,0.5)'
          } : {
            color: cardColor,
            backgroundColor: `${cardColor}18`,
            borderColor: `${cardColor}40`
          }"
        >
          {{ isPositionOne ? '👑 #1 Ad' : 'Ad' }}
        </span>
      </div>
      <p class="text-neutral-400 text-[11px] md:text-xs font-sans font-extralight tracking-[0.02em] leading-snug line-clamp-2">
        {{ description }}
      </p>
    </div>

    <!-- External Link Arrow with dynamic accent -->
    <div
      class="ml-auto pl-1 shrink-0 transition-colors relative z-10"
      :style="{ color: isPositionOne ? 'rgba(255,215,0,0.7)' : `${cardColor}80` }"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="group-hover:translate-x-0.5 transition-transform">
        <path d="M7 17L17 7M17 7H7M17 7V17"/>
      </svg>
    </div>
  </a>
</template>

<style scoped>
.ad-card {
  position: relative;
}

.ad-card:not(.gold-glow-border):hover {
  border-color: var(--card-color) !important;
  background-color: color-mix(in srgb, var(--card-color) 14%, transparent) !important;
  box-shadow: 0 0 24px color-mix(in srgb, var(--card-color) 35%, transparent) !important;
}

.gold-glow-border {
  border-color: rgba(255, 215, 0, 0.7);
  box-shadow: 0 0 16px rgba(255, 215, 0, 0.28), inset 0 0 12px rgba(255, 215, 0, 0.08);
  animation: gold-pulse 3s ease-in-out infinite;
}

.gold-sheen {
  background: linear-gradient(
    115deg,
    transparent 20%,
    rgba(255, 215, 0, 0.12) 45%,
    rgba(255, 255, 255, 0.2) 50%,
    rgba(255, 215, 0, 0.12) 55%,
    transparent 80%
  );
  background-size: 200% 100%;
  animation: sheen-move 4s linear infinite;
}

@keyframes gold-pulse {
  0%, 100% {
    border-color: rgba(255, 215, 0, 0.6);
    box-shadow: 0 0 14px rgba(255, 215, 0, 0.25), inset 0 0 8px rgba(255, 215, 0, 0.05);
  }
  50% {
    border-color: rgba(255, 215, 0, 0.95);
    box-shadow: 0 0 24px rgba(255, 215, 0, 0.45), inset 0 0 14px rgba(255, 215, 0, 0.12);
  }
}

@keyframes sheen-move {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
</style>
