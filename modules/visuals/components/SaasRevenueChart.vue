<script setup lang="ts">
import { ref, computed } from 'vue'
import UnverifiedOverlay from './UnverifiedOverlay.vue'
import GlassChart from '~/ui/components/GlassChart.vue'
import RevenueChartControls from './RevenueChartControls.vue'
import VerificationLegend from './VerificationLegend.vue'
import { useRevenueChart, type Metric, type Timeframe } from '../composables/useRevenueChart'

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
}>()

const emit = defineEmits<{ 
  claim: [],
  'claim-founder': [] 
}>()

const isLocked = computed(() => props.mrr === null && !props.history)
const baseMrr = computed(() => props.mrr || 15000)
const historyRef = computed(() => props.history)

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
    <div class="w-full mt-12 bg-white/[0.02] border border-white/10 rounded-3xl p-6 md:p-8 backdrop-blur-md relative overflow-hidden">
      <div class="absolute inset-0 bg-gradient-to-b from-[#00D4FF]/[0.02] to-transparent pointer-events-none"></div>

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

    <div class="mt-3 flex flex-col sm:flex-row justify-between items-center sm:items-start px-2 gap-3 sm:gap-0">
      <button 
        v-if="!founderName"
        class="text-[10px] font-sans font-light text-neutral-500 hover:text-[#00D4FF] transition-colors duration-300 flex items-center gap-1.5 group"
        @click="emit('claim-founder')"
      >
        <span class="opacity-70">¿Eres el dueño?</span>
        <span class="underline decoration-white/20 underline-offset-4 group-hover:decoration-[#00D4FF]/40 transition-colors">Reclama esta startup</span>
      </button>
      <div v-else></div>

      <VerificationLegend 
        v-if="provider && lastSyncedAt && !isLocked"
        :provider="provider"
        :last-synced-at="lastSyncedAt"
      />
      <div v-else class="hidden sm:block"></div>
    </div>
  </div>
</template>
