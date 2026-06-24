<script setup lang="ts">
import { formatMrrValue, formatRevenueValue } from '~/utils/format'
import IncognitoIcon from '~/ui/components/IncognitoIcon.vue'

defineProps<{
  saas: {
    mrr: number | null
    currency: string
    founderName: string | null
    publishedAt: string
    allTimeRevenue?: string
    country?: string
  }
}>()

const formatCurrency = (val: number | null, curr: string) => {
  if (val === null) return '—'
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: curr, maximumFractionDigits: 0 }).format(val)
}

const formatDate = (dateStr: string) => {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}
</script>

<template>
  <div class="w-full max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4 z-10">
    
    <div class="col-span-2 md:col-span-1 border border-white/10 bg-white/[0.03] shadow-md rounded-2xl p-5 flex flex-col items-center text-center justify-center transition-all duration-300 hover:bg-white/[0.06] hover:border-white/15">
      <span class="text-[8px] md:text-[9px] font-sans font-extralight tracking-[0.15em] text-neutral-400 uppercase mb-2">MRR</span>
      <div class="w-full flex justify-center">
        <span class="text-xl md:text-2xl font-serif text-white font-semibold">
          <template v-if="saas.mrr !== null">{{ formatCurrency(saas.mrr, saas.currency) }}</template>
          <IncognitoIcon v-else class="w-6 h-6 text-neutral-500" />
        </span>
      </div>
      <span class="text-[9px] font-sans font-extralight tracking-wider text-neutral-500 mt-2">Ingresos mensuales</span>
    </div>

    <div class="col-span-2 md:col-span-1 border border-white/10 bg-white/[0.03] shadow-md rounded-2xl p-5 flex flex-col items-center text-center justify-center transition-all duration-300 hover:bg-white/[0.06] hover:border-white/15">
      <span class="text-[8px] md:text-[9px] font-sans font-extralight tracking-[0.15em] text-neutral-400 uppercase mb-2">Ingresos Totales</span>
      <div class="w-full flex justify-center">
        <span class="text-lg md:text-xl font-serif text-neutral-200 font-semibold">
          <template v-if="saas.allTimeRevenue && saas.allTimeRevenue !== '—'">{{ saas.allTimeRevenue }}</template>
          <IncognitoIcon v-else class="w-5 h-5 text-neutral-500" />
        </span>
      </div>
      <span class="text-[9px] font-sans font-extralight tracking-wider text-neutral-500 mt-2">Ingresos acumulados</span>
    </div>

    <div class="col-span-1 border border-white/10 bg-white/[0.03] shadow-md rounded-2xl p-5 flex flex-col items-center text-center justify-center transition-all duration-300 hover:bg-white/[0.06] hover:border-white/15">
      <span class="text-[8px] md:text-[9px] font-sans font-extralight tracking-[0.15em] text-neutral-400 uppercase mb-2">Fundador</span>
      <div class="w-full flex justify-center">
        <span v-if="saas.founderName" class="text-sm md:text-base font-serif text-neutral-200 truncate w-full font-semibold">
          {{ saas.founderName }}
        </span>
        <IncognitoIcon v-else class="w-5 h-5 text-neutral-500" />
      </div>
      <span class="text-[9px] font-sans font-extralight tracking-wider text-neutral-500 mt-2">Propietario / CEO</span>
    </div>

    <div class="col-span-1 border border-white/10 bg-white/[0.03] shadow-md rounded-2xl p-5 flex flex-col items-center text-center justify-center transition-all duration-300 hover:bg-white/[0.06] hover:border-white/15">
      <span class="text-[8px] md:text-[9px] font-sans font-extralight tracking-[0.15em] text-neutral-400 uppercase mb-2">Fundación</span>
      <span class="text-sm md:text-base font-serif text-neutral-200 font-semibold">{{ formatDate(saas.publishedAt) }}</span>
      <span class="text-[9px] font-sans font-extralight tracking-wider text-neutral-500 mt-2">Fecha de pub.</span>
    </div>

    <div class="col-span-2 md:col-span-1 border border-white/10 bg-white/[0.03] shadow-md rounded-2xl p-5 flex flex-col items-center text-center justify-center transition-all duration-300 hover:bg-white/[0.06] hover:border-white/15">
      <span class="text-[8px] md:text-[9px] font-sans font-extralight tracking-[0.15em] text-neutral-400 uppercase mb-2">País</span>
      <span class="text-sm md:text-base font-serif text-neutral-200 font-semibold">{{ saas.country || 'Global' }}</span>
      <span class="text-[9px] font-sans font-extralight tracking-wider text-neutral-500 mt-2">Sede central</span>
    </div>

  </div>
</template>
