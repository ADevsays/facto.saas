<script setup lang="ts">
import { formatMrrValue, formatRevenueValue } from '~/utils/format'
import IncognitoIcon from '~/ui/components/IncognitoIcon.vue'
import InfoTooltip from '~/ui/components/InfoTooltip.vue'
import { computed } from 'vue'

const props = defineProps<{
  saas: {
    mrr: number | null
    currency: string
    founderName: string | null
    publishedAt: string
    allTimeRevenue?: string
    country?: string
    countryFlag?: string
    founderSocials?: { twitterUrl?: string; linkedinUrl?: string; instagramUrl?: string } | null
  }
}>()

defineEmits<{ 'claim-founder': [] }>()

const formatCurrency = (val: number | null, curr: string) => {
  if (val === null) return '—'
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: curr, maximumFractionDigits: 0 }).format(val)
}

const formatDate = (dateStr: string) => {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

const hasSocials = computed(() => {
  return props.saas.founderSocials && (props.saas.founderSocials.twitterUrl || props.saas.founderSocials.linkedinUrl || props.saas.founderSocials.instagramUrl)
})
</script>

<template>
  <div class="w-full max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4 z-10">
    
    <div class="col-span-2 md:col-span-1 border border-white/10 bg-white/[0.03] shadow-md rounded-2xl p-5 flex flex-col items-center text-center justify-center transition-all duration-300 hover:bg-white/[0.06] hover:border-white/15">
      <div class="flex items-center justify-center gap-1.5 mb-2 relative">
        <span class="text-[8px] md:text-[9px] font-sans font-extralight tracking-[0.15em] text-neutral-400 uppercase">MRR</span>
        <InfoTooltip text="El dinero fijo que gana la startup al mes por suscriptores. No incluye pagos únicos." />
      </div>
      <div class="w-full flex justify-center">
        <span class="text-xl md:text-2xl font-serif text-white font-semibold">
          <template v-if="saas.mrr !== null">{{ formatCurrency(saas.mrr, saas.currency) }}</template>
          <IncognitoIcon v-else class="w-6 h-6 text-neutral-500" />
        </span>
      </div>
      <span class="text-[9px] font-sans font-extralight tracking-wider text-neutral-500 mt-2">Ingresos mensuales</span>
    </div>

    <div class="col-span-2 md:col-span-1 border border-white/10 bg-white/[0.03] shadow-md rounded-2xl p-5 flex flex-col items-center text-center justify-center transition-all duration-300 hover:bg-white/[0.06] hover:border-white/15">
      <div class="flex items-center justify-center gap-1.5 mb-2 relative">
        <span class="text-[8px] md:text-[9px] font-sans font-extralight tracking-[0.15em] text-neutral-400 uppercase">Ingresos Totales</span>
        <InfoTooltip text="Todo el dinero que ha ganado la startup en total desde el primer día." />
      </div>
      <div class="w-full flex justify-center">
        <span class="text-lg md:text-xl font-serif text-neutral-200 font-semibold">
          <template v-if="saas.allTimeRevenue && saas.allTimeRevenue !== '—'">{{ saas.allTimeRevenue }}</template>
          <IncognitoIcon v-else class="w-5 h-5 text-neutral-500" />
        </span>
      </div>
      <span class="text-[9px] font-sans font-extralight tracking-wider text-neutral-500 mt-2">Ingresos acumulados</span>
    </div>

    <div 
      class="col-span-1 border border-white/10 bg-white/[0.03] shadow-md rounded-2xl p-5 flex flex-col items-center text-center justify-center transition-all duration-300 group relative"
      :class="[!saas.founderName ? 'hover:bg-white/[0.06] hover:border-[#00D4FF]/30 hover:shadow-[0_0_20px_rgba(0,212,255,0.08)] cursor-pointer' : 'hover:bg-white/[0.06] hover:border-white/15']"
      @click="!saas.founderName && $emit('claim-founder')"
    >
      
      <!-- Tooltip Reclama -->
      <div v-if="!saas.founderName" class="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-max bg-[#030305]/95 backdrop-blur-md border border-[#00D4FF]/30 text-[#00D4FF] text-[9px] font-sans font-medium tracking-[0.15em] uppercase px-4 py-2 rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-500 z-20 pointer-events-none shadow-[0_10px_30px_rgba(0,0,0,0.8),_0_0_15px_rgba(0,212,255,0.15)] flex items-center gap-2">
        <span>Reclama esta startup</span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M5 12h14M12 5l7 7-7 7"/>
        </svg>
      </div>

      <!-- Tooltip Socials -->
      <div v-if="saas.founderName && hasSocials" class="absolute bottom-full left-1/2 -translate-x-1/2 pb-3 w-max opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-500 z-20 pointer-events-auto flex items-center justify-center">
        <div class="bg-[#030305]/95 backdrop-blur-md border border-white/10 px-2 py-1.5 rounded-xl shadow-xl flex items-center gap-1">
          <a v-if="saas.founderSocials?.twitterUrl" :href="saas.founderSocials.twitterUrl" target="_blank" class="p-2.5 text-neutral-400 hover:text-white hover:bg-white/10 rounded-lg transition-all">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
          </a>
          <a v-if="saas.founderSocials?.linkedinUrl" :href="saas.founderSocials.linkedinUrl" target="_blank" class="p-2.5 text-neutral-400 hover:text-white hover:bg-white/10 rounded-lg transition-all">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
          </a>
          <a v-if="saas.founderSocials?.instagramUrl" :href="saas.founderSocials.instagramUrl" target="_blank" class="p-2.5 text-neutral-400 hover:text-white hover:bg-white/10 rounded-lg transition-all">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
          </a>
        </div>
      </div>

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
      
      <div v-if="!saas.countryFlag || saas.countryFlag === 'global'" class="text-neutral-400 mb-1">
        <svg class="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/><path d="M2 12h20"/></svg>
      </div>
      <img 
        v-else-if="saas.countryFlag.length === 2" 
        :src="`https://flagcdn.com/w40/${saas.countryFlag.toLowerCase()}.png`" 
        :alt="saas.country || 'Country'"
        class="w-8 rounded-sm shadow-sm mb-1"
      />
      <span v-else class="text-2xl md:text-3xl font-serif text-neutral-200 font-semibold">{{ saas.countryFlag }}</span>

      <span class="text-[9px] font-sans font-extralight tracking-wider text-neutral-500 mt-2">{{ saas.country || 'Sede central' }}</span>
    </div>

  </div>
</template>
