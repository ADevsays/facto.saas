<script setup lang="ts">
import { computed } from 'vue'
import IncognitoIcon from '~/ui/components/IncognitoIcon.vue'
import InfoTooltip from '~/ui/components/InfoTooltip.vue'
import es from '../locales/es.json'
import en from '../locales/en.json'
 
const { t } = useLanguage({ es, en })
const localePath = useLocalePath()

const props = defineProps<{
  saas: {
    slug?: string
    isIncognito?: boolean
    mrr: number | null
    currency: string
    founderName: string | null
    publishedAt: string
    allTimeRevenue?: string
    country?: string
    countrySlug?: string
    countryFlag?: string
    founderSocials?: { twitterUrl?: string; linkedinUrl?: string; instagramUrl?: string } | null
  }
}>()

const emit = defineEmits<{ 'claim-founder': [] }>()
const route = useRoute()

import { getFounderSlug } from '~/utils/founder'

function formatCurrency(val: number | null, curr: string) {
  if (val === null) return '—'
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: curr, maximumFractionDigits: 0 }).format(val)
}

function formatDate(dateStr: string) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' })
}

const hasAllTimeRevenue = computed(() => {
  if (props.saas.isIncognito) return false
  const rev = props.saas.allTimeRevenue
  if (!rev) return false
  const str = String(rev).trim()
  return !['', '—', '‐', '-', '–', 'null', 'undefined'].includes(str)
})

const founderLink = computed(() => {
  const slug = getFounderSlug(props.saas.founderName)
  if (!slug) return ''
  const currentSaasSlug = props.saas.slug || (route.params.slug as string)
  const base = localePath(`/founder/${slug}`)
  return currentSaasSlug ? `${base}?from=${encodeURIComponent(currentSaasSlug)}` : base
})
</script>

<template>
  <div class="w-full max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4 z-10">
    
    <!-- MRR -->
    <div class="col-span-2 md:col-span-1 border border-white/10 bg-surface-elevated shadow-md rounded-2xl p-5 flex flex-col items-center text-center justify-center transition-all duration-300 hover:bg-surface-elevated-hover hover:border-white/20">
      <div class="flex items-center justify-center gap-1.5 mb-2 relative">
        <span class="text-[8px] md:text-[9px] font-sans font-extralight tracking-[0.15em] text-neutral-400 uppercase">{{ t.profile.metrics.mrr_label }}</span>
        <InfoTooltip :text="t.profile.metrics.mrr_tooltip" />
      </div>
      <div class="w-full flex justify-center">
        <span class="text-xl md:text-2xl font-serif text-white font-semibold">
          <template v-if="!saas.isIncognito && saas.mrr !== null">{{ formatCurrency(saas.mrr, saas.currency) }}</template>
          <IncognitoIcon v-else class="w-6 h-6 text-neutral-500" />
        </span>
      </div>
      <span class="text-[9px] font-sans font-extralight tracking-wider text-neutral-400 mt-2">{{ t.profile.metrics.mrr_desc }}</span>
    </div>

    <!-- Revenue -->
    <div class="col-span-2 md:col-span-1 border border-white/10 bg-surface-elevated shadow-md rounded-2xl p-5 flex flex-col items-center text-center justify-center transition-all duration-300 hover:bg-surface-elevated-hover hover:border-white/20">
      <div class="flex items-center justify-center gap-1.5 mb-2 relative">
        <span class="text-[8px] md:text-[9px] font-sans font-extralight tracking-[0.15em] text-neutral-400 uppercase">{{ t.profile.metrics.revenue_label }}</span>
        <InfoTooltip :text="t.profile.metrics.revenue_tooltip" />
      </div>
      <div class="w-full flex justify-center">
        <span class="text-lg md:text-xl font-serif text-neutral-100 font-semibold">
          <template v-if="hasAllTimeRevenue">{{ saas.allTimeRevenue }}</template>
          <IncognitoIcon v-else class="w-5 h-5 text-neutral-500" />
        </span>
      </div>
      <span class="text-[9px] font-sans font-extralight tracking-wider text-neutral-400 mt-2">{{ t.profile.metrics.revenue_desc }}</span>
    </div>

    <!-- Founder (With link to founder profile) -->
    <NuxtLink
      v-if="saas.founderName"
      :to="founderLink"
      class="col-span-1 border border-white/10 bg-surface-elevated shadow-md rounded-2xl p-5 flex flex-col items-center text-center justify-center transition-all duration-300 group relative hover:bg-surface-elevated-hover hover:border-white/20 cursor-pointer hover:scale-[1.02]"
    >
      <span class="text-[8px] md:text-[9px] font-sans font-extralight tracking-[0.15em] text-neutral-400 uppercase mb-2">{{ t.profile.metrics.founder_label }}</span>
      <div class="w-full flex justify-center">
        <span class="text-sm md:text-base font-serif text-neutral-100 truncate w-full font-semibold group-hover:text-[#00D4FF] transition-colors">
          {{ saas.founderName }}
        </span>
      </div>
      <span class="text-[9px] font-sans font-extralight tracking-wider text-neutral-400 mt-2">{{ t.profile.metrics.founder_desc }}</span>
    </NuxtLink>

    <!-- Claim Founder (When no founder registered) -->
    <div
      v-else
      @click="emit('claim-founder')"
      class="col-span-1 border border-white/10 bg-surface-elevated shadow-md rounded-2xl p-5 flex flex-col items-center text-center justify-center transition-all duration-300 group relative hover:bg-white/[0.06] hover:border-[#00D4FF]/30 cursor-pointer"
    >
      <!-- Tooltip Reclama -->
      <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-max bg-[#030305]/95 backdrop-blur-md border border-[#00D4FF]/30 text-[#00D4FF] text-[9px] font-sans font-medium tracking-[0.15em] uppercase px-4 py-2 rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-500 z-20 pointer-events-none shadow-[0_10px_30px_rgba(0,0,0,0.8),_0_0_15px_rgba(0,212,255,0.15)] flex items-center gap-2">
        <span>{{ t.profile.metrics.claim_tooltip }}</span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M5 12h14M12 5l7 7-7 7"/>
        </svg>
      </div>

      <span class="text-[8px] md:text-[9px] font-sans font-extralight tracking-[0.15em] text-neutral-400 uppercase mb-2">{{ t.profile.metrics.founder_label }}</span>
      <div class="w-full flex justify-center">
        <IncognitoIcon class="w-5 h-5 text-neutral-500" />
      </div>
      <span class="text-[9px] font-sans font-extralight tracking-wider text-neutral-400 mt-2">{{ t.profile.metrics.founder_desc }}</span>
    </div>

    <!-- Founded Date -->
    <div class="col-span-1 border border-white/10 bg-surface-elevated shadow-md rounded-2xl p-5 flex flex-col items-center text-center justify-center transition-all duration-300 hover:bg-surface-elevated-hover hover:border-white/20">
      <span class="text-[8px] md:text-[9px] font-sans font-extralight tracking-[0.15em] text-neutral-400 uppercase mb-2">{{ t.profile.metrics.founded_label }}</span>
      <span class="text-sm md:text-base font-serif text-neutral-100 font-semibold">{{ formatDate(saas.publishedAt) }}</span>
      <span class="text-[9px] font-sans font-extralight tracking-wider text-neutral-400 mt-2">{{ t.profile.metrics.founded_desc }}</span>
    </div>

    <!-- Country -->
    <NuxtLink 
      :to="localePath((saas.countrySlug && saas.countrySlug !== 'global') ? `/saas/pais/${saas.countrySlug}` : '/saas/pais')"
      class="col-span-2 md:col-span-1 border border-white/10 bg-surface-elevated shadow-md rounded-2xl p-5 flex flex-col items-center text-center justify-center transition-all duration-300 hover:bg-surface-elevated-hover hover:border-white/20 cursor-pointer hover:shadow-[0_0_15px_rgba(0,212,255,0.05)] group"
    >
      <span class="text-[8px] md:text-[9px] font-sans font-extralight tracking-[0.15em] text-neutral-400 uppercase mb-2">{{ t.profile.metrics.country_label }}</span>
      
      <div v-if="!saas.countryFlag || saas.countryFlag === 'global' || saas.countrySlug === 'global' || saas.countryFlag.toLowerCase() === 'un'" class="text-neutral-400 mb-1 group-hover:text-neutral-300 transition-colors duration-300">
        <svg class="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/><path d="M2 12h20"/></svg>
      </div>
      <img 
        v-else-if="saas.countryFlag.length === 2" 
        :src="`https://flagcdn.com/w40/${saas.countryFlag.toLowerCase()}.png`" 
        :alt="saas.country || 'Country'"
        class="w-8 rounded-sm shadow-sm mb-1"
      />
      <span v-else class="text-2xl md:text-3xl font-serif text-neutral-200 font-semibold">{{ saas.countryFlag }}</span>

      <span class="text-[9px] font-sans font-extralight tracking-wider text-neutral-400 mt-2 group-hover:text-[#00D4FF]transition-colors">{{ saas.country || t.profile.metrics.hq_default }}</span>
    </NuxtLink>

  </div>
</template>
