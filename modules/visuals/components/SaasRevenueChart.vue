<script setup lang="ts">
import { ref, computed } from 'vue'
import UnverifiedOverlay from './UnverifiedOverlay.vue'
import GlassChart from '~/ui/components/GlassChart.vue'
import RevenueChartControls from './RevenueChartControls.vue'
import VerificationLegend from './VerificationLegend.vue'
import ProbableRankCallout from './ProbableRankCallout.vue'
import { useRevenueChart, type Metric, type Timeframe } from '../composables/useRevenueChart'

import es from '../locales/es.json'
import en from '../locales/en.json'
const { t } = useLanguage({ es, en })

const props = defineProps<{
  mrr: number | null
  currency: string
  history?: {
    subscriptions: { created: number; status: string; canceledAt: number | null; mrr: number }[]
    charges: { amount: number; created: number }[]
  } | null
  provider?: string
  lastSyncedAt?: number | null
  founderName?: string | null
  isVerifiedOwner?: boolean
  views?: number
}>()

const emit = defineEmits<{ 
  claim: [],
  'claim-founder': [] 
}>()

const isLocked = computed(() => props.mrr === null && !props.history)
const baseMrr = computed(() => props.mrr || 15000)
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

const { chartData } = useRevenueChart(historyRef, baseMrr, activeMetric, activeTimeframe)

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

      <div :class="{ 'blur-sm pointer-events-none select-none': isLocked }">
        <GlassChart 
          :data="chartData" 
          :format-value="currencyFormatter"
          color="#00D4FF" 
          :height="300"
        />
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
      />
      <div v-else class="hidden sm:block"></div>
    </div>
  </div>
</template>
