<script setup lang="ts">
import { computed } from 'vue'
import es from '../locales/es.json'
import en from '../locales/en.json'

const { t } = useLanguage({ es, en })

const props = defineProps<{
  probableRank: string | number
  views?: number
}>()

const emit = defineEmits<{
  (e: 'claim'): void
}>()

const currentViews = computed(() => {
  if (typeof props.views === 'number' && props.views > 0) {
    return props.views
  }
  return 130
})

const projectedViews = computed(() => {
  if (typeof props.views === 'number' && props.views > 0) {
    return Math.max(700, Math.round(props.views * 5.4))
  }
  return 700
})

const formattedCurrentViews = computed(() => currentViews.value.toLocaleString('en-US'))
const formattedProjectedViews = computed(() => projectedViews.value.toLocaleString('en-US'))
</script>

<template>
  <div
    class="mt-3 w-full bg-surface-elevated border border-white/10 rounded-2xl p-4 sm:px-5 sm:py-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 transition-all duration-300 hover:border-white/20 group cursor-pointer"
    @click="emit('claim')"
  >
    <div class="flex items-center gap-3.5 min-w-0">
      <div class="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-center shrink-0 text-[#00D4FF]/75 transition-all duration-300">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path>
          <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path>
          <path d="M4 22h16"></path>
          <path d="M10 14.66V17c0 .55-.45 1-1 1H7c-.55 0-1-.45-1-1v-2.34"></path>
          <path d="M14 14.66V17c0 .55.45 1 1 1h2c.55 0 1-.45 1-1v-2.34"></path>
          <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path>
        </svg>
      </div>

      <div class="text-left min-w-0 flex-1">
        <h4 class="text-xs sm:text-sm font-sans font-medium text-white tracking-tight flex items-center gap-1.5 flex-wrap">
          <span class="text-neutral-300">{{ t.profile.chart.probable_rank_title }}</span>
          <span class="text-[#00D4FF]/80 font-medium num-stat">Top #{{ probableRank }}</span>
        </h4>
        <p class="text-[11px] sm:text-xs font-sans font-light text-neutral-400 mt-0.5 leading-normal flex items-center flex-wrap gap-x-1">
          <span class="hidden sm:inline">{{ t.profile.chart.probable_rank_sub_desktop_prefix }}</span>
          <span class="text-emerald-400/75 font-medium">{{ t.profile.chart.probable_rank_multiplier }}</span>
          <ClientOnly>
            <span class="text-neutral-500">(~{{ formattedProjectedViews }} vs {{ formattedCurrentViews }})</span>
          </ClientOnly>
        </p>
      </div>
    </div>

    <div class="w-full sm:w-auto shrink-0 flex items-center justify-center">
      <div
        class="w-full sm:w-auto px-4 py-1.5 rounded-xl bg-white/[0.04] border border-white/10 text-neutral-300 group-hover:text-white group-hover:bg-white/[0.08] group-hover:border-white/20 font-sans font-medium text-xs sm:text-xs tracking-tight transition-all duration-300 flex items-center justify-center text-center"
      >
        <span>{{ t.profile.chart.verify_mrr_cta }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.num-stat {
  font-variant-numeric: lining-nums tabular-nums;
  font-feature-settings: "lnum" 1, "tnum" 1;
}
</style>
