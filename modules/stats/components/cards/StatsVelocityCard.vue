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
}>()

const range = ref<TimeRange>('all')

const chartData = computed(() => {
  let list = props.daily
  if (range.value === '30d') list = list.slice(-30)
  else if (range.value === '90d') list = list.slice(-90)

  return list.map(p => ({
    label: new Date(p.date).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' }),
    value: p.startupsAdded
  }))
})

const peakVelocity = computed(() => {
  const points = chartData.value
  if (!points.length) return 0
  return Math.max(...points.map(p => p.value))
})

const formatNumber = (val: number) => {
  if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(1)}M`
  if (val >= 1_000) return `${(val / 1_000).toFixed(1)}K`
  return Math.round(val).toLocaleString('en-US')
}
</script>

<template>
  <div class="p-6 sm:p-7 rounded-3xl border border-white/10 bg-surface-elevated hover:bg-surface-elevated-hover hover:border-white/20 transition-all duration-300 flex flex-col justify-between gap-6 group">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
      <div>
        <div class="flex items-center gap-2">
          <svg class="w-4 h-4 text-amber-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
          </svg>
          <span class="text-[10px] font-sans font-extralight tracking-widest text-neutral-400 uppercase">
            {{ t?.bento?.daily_additions_title }}
          </span>
        </div>
        <div class="mt-2 flex items-baseline gap-1.5">
          <span
            class="text-3xl font-serif text-amber-400 font-bold lining-nums tabular-nums leading-none transition-opacity"
            :class="peakVelocity === 0 ? 'opacity-40' : 'opacity-100'"
            style="font-variant-numeric: lining-nums tabular-nums; font-feature-settings: 'lnum' 1, 'tnum' 1; line-height: 1;"
          >
            <span class="text-[0.6em] opacity-70 font-normal mr-0.5 inline-block align-top">+</span>{{ peakVelocity.toLocaleString('en-US') }}
          </span>
          <span class="text-[0.8rem] font-sans font-normal text-neutral-400 leading-none">pico diario</span>
        </div>
      </div>

      <StatsRangePills v-model="range" />
    </div>

    <div class="w-full">
      <GlassChart
        :data="chartData"
        color="#F59E0B"
        :height="240"
        :format-value="formatNumber"
      />
    </div>
  </div>
</template>
