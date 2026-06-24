<script setup lang="ts">
import type { Metric, Timeframe } from '../composables/useRevenueChart'

const props = defineProps<{
  activeMetric: Metric
  activeTimeframe: Timeframe
}>()

const emit = defineEmits<{
  'update:activeMetric': [val: Metric]
  'update:activeTimeframe': [val: Timeframe]
}>()

const metrics: { key: Metric; label: string }[] = [
  { key: 'mrr', label: 'MRR' },
  { key: 'revenue', label: 'Revenue' }
]

const timeframes: { key: Timeframe; label: string }[] = [
  { key: '7d', label: '7d' },
  { key: '30d', label: '30d' },
  { key: '60d', label: '60d' },
  { key: 'all', label: 'All' }
]
</script>

<template>
  <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 relative z-10">
    <div>
      <h3 class="text-sm font-sans font-extralight tracking-[0.15em] text-neutral-400 uppercase mb-1">Financial Trajectory</h3>
      <p class="text-2xl font-serif text-white font-semibold">
        {{ activeMetric === 'mrr' ? 'Monthly Recurring Revenue' : 'Gross Revenue' }}
      </p>
    </div>

    <div class="flex flex-wrap items-center gap-3">
      <div class="flex rounded-full bg-white/[0.05] border border-white/10 p-0.5">
        <button 
          v-for="m in metrics"
          :key="m.key"
          @click="emit('update:activeMetric', m.key)"
          :class="[
            'px-4 py-1.5 rounded-full text-[10px] uppercase tracking-wider font-sans transition-all duration-300',
            activeMetric === m.key ? 'bg-white text-black font-semibold' : 'text-neutral-400 hover:text-white'
          ]"
        >
          {{ m.label }}
        </button>
      </div>

      <div class="flex rounded-full bg-white/[0.05] border border-white/10 p-0.5">
        <button 
          v-for="t in timeframes"
          :key="t.key"
          @click="emit('update:activeTimeframe', t.key)"
          :class="[
            'px-3 py-1.5 rounded-full text-[10px] uppercase tracking-wider font-sans transition-all duration-300',
            activeTimeframe === t.key ? 'bg-[#00D4FF]/20 text-[#00D4FF] border border-[#00D4FF]/30' : 'text-neutral-400 hover:text-white border border-transparent'
          ]"
        >
          {{ t.label }}
        </button>
      </div>
    </div>
  </div>
</template>
