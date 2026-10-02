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
  totalStartups: number
}>()

const range = ref<TimeRange>('all')

const chartData = computed(() => {
  let list = props.daily
  if (range.value === '30d') list = list.slice(-30)
  else if (range.value === '90d') list = list.slice(-90)

  return list.map(p => ({
    label: new Date(p.date).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' }),
    value: p.cumulativeStartups
  }))
})

const formatNumber = (val: number) => {
  if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(1)}M`
  if (val >= 1_000) return `${(val / 1_000).toFixed(1)}K`
  return Math.round(val).toLocaleString('en-US')
}
</script>

<template>
  <div class="lg:col-span-2 p-6 sm:p-7 rounded-3xl border border-white/10 bg-surface-elevated hover:bg-surface-elevated-hover hover:border-white/20 transition-all duration-300 flex flex-col justify-between gap-6 group">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
      <div>
        <div class="flex items-center gap-2">
          <svg class="w-4 h-4 text-[#00D4FF] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/>
            <polyline points="16 7 22 7 22 13"/>
          </svg>
          <span class="text-[10px] font-sans font-extralight tracking-widest text-neutral-400 uppercase">
            {{ t?.bento?.startups_title }}
          </span>
          <span class="text-[9px] font-sans text-cyan-400 px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20">
            {{ t?.bento?.startups_badge }}
          </span>
        </div>
        <div class="mt-2 flex items-baseline gap-1.5">
          <span
            class="text-3xl font-serif text-white font-bold lining-nums tabular-nums leading-none transition-opacity"
            :class="totalStartups === 0 ? 'opacity-40' : 'opacity-100'"
            style="font-variant-numeric: lining-nums tabular-nums; font-feature-settings: 'lnum' 1, 'tnum' 1; line-height: 1;"
          >
            {{ totalStartups.toLocaleString('en-US') }}
          </span>
          <span class="text-[0.8rem] font-sans font-normal text-neutral-400 leading-none">
            {{ t?.bento?.startups_sub }}
          </span>
        </div>
      </div>

      <StatsRangePills v-model="range" />
    </div>

    <div class="w-full">
      <GlassChart
        :data="chartData"
        color="#00D4FF"
        :height="240"
        :format-value="formatNumber"
      />
    </div>
  </div>
</template>
