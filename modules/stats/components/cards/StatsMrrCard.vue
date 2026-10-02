<script setup lang="ts">
import { ref, computed } from 'vue'
import GlassChart from '~/ui/components/GlassChart.vue'
import StatsRangePills from '../common/StatsRangePills.vue'
import type { StatDayPoint, TimeRange } from '../../types'
import es from '../../locales/es.json'
import en from '../../locales/en.json'

const { t } = useLanguage({ es, en })

const props = defineProps<{
  daily: StatDayPoint[]
  totalMrr: number
}>()

const range = ref<TimeRange>('all')

const chartData = computed(() => {
  let list = props.daily
  if (range.value === '30d') list = list.slice(-30)
  else if (range.value === '90d') list = list.slice(-90)

  return list.map(p => ({
    label: new Date(p.date).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' }),
    value: p.mrr
  }))
})

const formatCurrency = (val: number) => {
  if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(1)}M`
  if (val >= 1_000) return `$${(val / 1_000).toFixed(0)}K`
  return `$${Math.round(val)}`
}
</script>

<template>
  <div class="p-6 sm:p-7 rounded-3xl border border-white/10 bg-surface-elevated hover:bg-surface-elevated-hover hover:border-white/20 transition-all duration-300 flex flex-col justify-between gap-6 group">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
      <div>
        <div class="flex items-center gap-2">
          <svg class="w-4 h-4 text-emerald-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="1" x2="12" y2="23"/>
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
          </svg>
          <span class="text-[10px] font-sans font-extralight tracking-widest text-neutral-400 uppercase">
            {{ t?.bento?.mrr_title }}
          </span>
        </div>
        <div class="mt-2 flex items-baseline gap-1.5">
          <span
            class="text-3xl font-serif text-emerald-400 font-bold lining-nums tabular-nums leading-none transition-opacity"
            :class="totalMrr === 0 ? 'opacity-40' : 'opacity-100'"
            style="font-variant-numeric: lining-nums tabular-nums; font-feature-settings: 'lnum' 1, 'tnum' 1; line-height: 1;"
          >
            <span class="text-[0.6em] opacity-70 font-normal mr-0.5 inline-block align-top">$</span>{{ totalMrr.toLocaleString('en-US') }}
          </span>
          <span class="text-[0.8rem] font-sans font-normal text-neutral-400 leading-none">/ mes</span>
        </div>
      </div>

      <StatsRangePills v-model="range" />
    </div>

    <div class="w-full">
      <GlassChart
        :data="chartData"
        color="#10B981"
        :height="240"
        :format-value="formatCurrency"
      />
    </div>
  </div>
</template>
