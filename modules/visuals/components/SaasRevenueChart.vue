<script setup lang="ts">
import { ref, computed } from 'vue'
import UnverifiedOverlay from './UnverifiedOverlay.vue'
import GlassChart from '~/ui/components/GlassChart.vue'
import RevenueChartControls from './RevenueChartControls.vue'
import VerificationLegend from './VerificationLegend.vue'
import ProbableRankCallout from './ProbableRankCallout.vue'
import { useRevenueChart, type HistoryData, type Metric, type Timeframe } from '../composables/useRevenueChart'

import es from '../locales/es.json'
import en from '../locales/en.json'
const { t } = useLanguage({ es, en })

const props = defineProps<{
  mrr: number | null
  currency: string
  history?: HistoryData | null
  provider?: string
  lastSyncedAt?: number | null
  keyStatus?: 'ok' | 'invalid' | 'permissions' | 'missing'
  founderName?: string | null
  isVerifiedOwner?: boolean
  views?: number
  loading?: boolean
}>()

const emit = defineEmits<{ 
  claim: [],
  'claim-founder': [] 
}>()

const isLocked = computed(() => props.mrr === null && !props.history)
const historyRef = computed(() => props.history)

const probableRank = computed(() => {
  const v = props.views ?? 0
  if (v >= 500) return 2
  if (v >= 150) return 3
  if (v >= 50) return 4
  return 5
})

const activeMetric = ref<Metric>('mrr')
const activeTimeframe = ref<Timeframe>('30d')

const { chartData } = useRevenueChart(historyRef, activeMetric, activeTimeframe)
const renderedChartData = computed(() => {
  if (chartData.value.length > 0) return chartData.value

  const count = activeTimeframe.value === '7d'
    ? 7
    : activeTimeframe.value === '60d'
      ? 60
      : activeTimeframe.value === 'all'
        ? 12
        : 30

  return Array.from({ length: count }, (_, index) => ({
    label: `${index + 1}`,
    value: 0,
  }))
})

const currencyFormatter = (val: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: props.currency,
    maximumFractionDigits: 0,
    notation: val >= 1_000_000 ? 'compact' : 'standard'
  }).format(val)
}
</script>

<template>
  <div class="w-full max-w-5xl mx-auto flex flex-col">
    <div class="w-full mt-12 bg-surface-elevated border border-white/10 rounded-3xl p-6 md:p-8 relative overflow-hidden">
      <UnverifiedOverlay v-if="isLocked" @claim="emit('claim')" />

      <RevenueChartControls 
        v-model:activeMetric="activeMetric"
        v-model:activeTimeframe="activeTimeframe"
        :class="{ 'blur-sm pointer-events-none select-none': isLocked }"
      />

      <div class="relative" :class="{ 'blur-sm pointer-events-none select-none': isLocked }">
        <GlassChart
          :data="renderedChartData" 
          :format-value="currencyFormatter"
          color="#00D4FF" 
          :height="300"
          :class="['transition-opacity duration-500', { 'opacity-0': loading }]"
        />
        <Transition name="chart-loader">
          <svg v-if="loading" aria-hidden="true" class="absolute inset-0 w-full h-[300px]" viewBox="0 0 800 300" preserveAspectRatio="none">
            <line v-for="i in 4" :key="i" x1="40" :y1="25 + (i - 1) * 80" x2="770" :y2="25 + (i - 1) * 80" stroke="white" stroke-width="1" stroke-dasharray="3 4" opacity="0.08" />
            <path class="chart-loader-line" d="M 40 224 L 98 207 L 147 232 L 221 169 L 279 194 L 337 128 L 421 157 L 468 109 L 536 149 L 603 81 L 659 123 L 714 102 L 770 134" pathLength="1" fill="none" stroke="#00D4FF" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </Transition>
      </div>
    </div> 

    <!-- Probable Rank Callout (visible when MRR is not connected / locked) -->
    <ProbableRankCallout
      v-if="isLocked"
      :probable-rank="probableRank"
      :views="views"
      @claim="emit('claim')"
    />

    <div class="mt-3 flex flex-col sm:flex-row justify-between items-center sm:items-start px-2 gap-3 sm:gap-0">
      <button 
        class="text-[10px] font-sans font-light text-neutral-500 hover:text-[#00D4FF] transition-colors duration-300 flex items-center gap-1.5 group"
        @click="emit('claim-founder')"
      >
        <template v-if="isVerifiedOwner">
          <span class="opacity-70">{{ t.profile.chart.owner_question }}</span>
          <span class="underline decoration-white/20 underline-offset-4 group-hover:decoration-[#00D4FF]/40 transition-colors">{{ t.profile.chart.edit_startup }}</span>
        </template>
        <template v-else-if="!founderName">
          <span class="opacity-70">{{ t.profile.chart.owner_question }}</span>
          <span class="underline decoration-white/20 underline-offset-4 group-hover:decoration-[#00D4FF]/40 transition-colors">{{ t.profile.chart.claim_startup }}</span>
        </template>
        <template v-else>
          <span class="opacity-70">{{ t.profile.chart.owner_question }}</span>
          <span class="underline decoration-white/20 underline-offset-4 group-hover:decoration-[#00D4FF]/40 transition-colors">{{ t.profile.chart.edit_startup }}</span>
        </template>
      </button>

      <VerificationLegend 
        v-if="provider && lastSyncedAt && !isLocked"
        :provider="provider"
        :last-synced-at="lastSyncedAt"
        :key-status="keyStatus"
      />
      <div v-else class="hidden sm:block"></div>
    </div>
  </div>
</template>

<style scoped>
.chart-loader-enter-active, .chart-loader-leave-active { transition: opacity 0.35s ease; }
.chart-loader-enter-from, .chart-loader-leave-to { opacity: 0; }
.chart-loader-line {
  stroke-dasharray: 1;
  stroke-dashoffset: 1;
  filter: drop-shadow(0 2px 5px rgba(0, 212, 255, 0.45));
  animation: chart-loader-draw 1.8s cubic-bezier(0.4, 0, 0.2, 1) infinite;
}
@keyframes chart-loader-draw {
  0% { stroke-dashoffset: 1; opacity: 0.2; }
  65% { stroke-dashoffset: 0; opacity: 1; }
  100% { stroke-dashoffset: 0; opacity: 0; }
}
@media (prefers-reduced-motion: reduce) {
  .chart-loader-line { animation: none; stroke-dashoffset: 0; opacity: 0.65; }
}
</style>
