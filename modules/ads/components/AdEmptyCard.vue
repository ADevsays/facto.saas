<script setup lang="ts">
import { computed } from 'vue'
import { useKeycapSound } from '~/composables/useKeycapSound'
import { useLanguage } from '~/composables/useLanguage'
import es from '../locales/es.json'
import en from '../locales/en.json'

const props = defineProps<{
  position: number
  price?: number
}>()

const emit = defineEmits<{
  (e: 'click', position: number): void
}>()

const { t } = useLanguage({ es, en })
const { playNextKeySound } = useKeycapSound()

const displayPrice = computed(() => props.price ?? (props.position === 1 ? 10 : 1))

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

const slotColor = computed(() => {
  if (props.position === 1) return '#FFD700'
  return AD_PALETTE[(props.position - 2) % AD_PALETTE.length]
})

function handleClick() {
  playNextKeySound()
  emit('click', props.position)
}
</script>

<template>
  <div
    role="button"
    tabindex="0"
    @click="handleClick"
    :class="[
      'empty-ad-card group shrink-0 flex items-center gap-3 md:gap-3.5 rounded-xl px-4 py-2 md:px-5 md:py-2.5 cursor-pointer transition-all duration-500 select-none border border-dashed w-[290px] sm:w-[320px] md:w-[340px] max-w-[340px] h-[66px] md:h-[72px]',
      position === 1
        ? 'border-[#FFD700]/70 bg-[#FFD700]/[0.05] hover:border-[#FFD700] hover:bg-[#FFD700]/[0.09] shadow-[0_0_15px_rgba(255,215,0,0.2)] hover:shadow-[0_0_25px_rgba(255,215,0,0.4)]'
        : 'border-white/15 bg-white/[0.02]'
    ]"
    :style="position !== 1 ? {
      '--slot-color': slotColor
    } : {}"
  >
    <div
      class="w-9 h-9 md:w-10 md:h-10 rounded-xl border flex items-center justify-center text-base md:text-xl font-serif font-bold tracking-tight leading-none transition-all duration-300 shrink-0 select-none"
      :style="position === 1 ? {
        backgroundColor: 'rgba(255,215,0,0.15)',
        borderColor: 'rgba(255,215,0,0.4)',
        color: '#FFD700',
        boxShadow: '0 0 10px rgba(255,215,0,0.25)'
      } : {
        backgroundColor: `${slotColor}12`,
        borderColor: `${slotColor}35`,
        color: slotColor
      }"
    >
      {{ position }}
    </div>

    <div class="flex-1 min-w-0 flex flex-col justify-center gap-0.5">
      <p class="text-white text-[13px] md:text-sm font-sans font-medium whitespace-nowrap truncate group-hover:text-white transition-colors">
        {{ t.empty.title }}
      </p>
      <div class="flex items-center gap-1.5 text-neutral-400 text-[11px] md:text-xs font-sans font-extralight tracking-[0.05em] whitespace-nowrap group-hover:text-neutral-300 transition-colors">
        <svg 
          class="w-3.5 h-3.5 transition-colors shrink-0" 
          :style="{ color: position === 1 ? '#FFD700' : `${slotColor}99` }"
          viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"
        >
          <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
        <span>{{ t.empty.views }}</span>
      </div>
    </div>

    <div 
      :class="[
        'ml-auto shrink-0 inline-flex items-center justify-center gap-1.5 h-8 md:h-9 px-3 md:px-3.5 rounded-full text-[11px] md:text-xs font-sans font-medium border transition-all duration-500 whitespace-nowrap',
        position === 1
          ? 'border-[#FFD700]/40 bg-[#FFD700]/10 text-white group-hover:bg-[#FFD700] group-hover:text-black group-hover:border-[#FFD700] group-hover:shadow-[0_0_20px_rgba(255,215,0,0.5)]'
          : 'border-white/20 bg-white/[0.05] text-white/90 group-hover:bg-white group-hover:text-black group-hover:border-white group-hover:shadow-[0_0_15px_rgba(255,255,255,0.4)]'
      ]"
    >
      <span>{{ t.empty.bid_from }} <strong :style="{ color: position === 1 ? '#FFD700' : slotColor }" class="group-hover:!text-black font-bold font-mono transition-colors">${{ displayPrice }}</strong></span>
    </div>
  </div>
</template>

<style scoped>
.empty-ad-card:not(:first-child):hover {
  border-color: var(--slot-color) !important;
  background-color: color-mix(in srgb, var(--slot-color) 6%, transparent) !important;
  box-shadow: 0 0 20px color-mix(in srgb, var(--slot-color) 20%, transparent);
}
</style>
