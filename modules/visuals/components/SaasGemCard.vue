<script setup lang="ts">
import { computed } from 'vue'
import { slugify } from '~/utils/slugify'
import type { SaasListItem } from '~/modules/ranking/types'
import IncognitoIcon from '~/ui/components/IncognitoIcon.vue'
import SaasLogo from '~/ui/components/SaasLogo.vue'
import { getGemClass, getGemColor } from '~/ui/const/gems'
import { preloadLogo } from '~/utils/preloadLogo'

import es from '../locales/es.json'
import en from '../locales/en.json'

const { t } = useLanguage({ es, en })
const localePath = useLocalePath()

const props = defineProps<{
  saas: SaasListItem
  index?: number
}>()

const gemClass = computed(() => {
  return getGemClass(props.saas.categorySlug)
})

const gemColor = computed(() => getGemColor(props.saas.categorySlug))
const hasGlow = computed(() => props.index !== undefined && [2, 7].includes(props.index % 10))
const cardStyle = computed(() => ({
  '--glow': gemColor.value
}))

const formattedMrr = computed(() => {
  if (props.saas.mrr === null) return '—'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: props.saas.currency || 'USD',
    maximumFractionDigits: 0
  }).format(props.saas.mrr)
})

const annualRevenue = computed(() => {
  if (props.saas.isIncognito) return '—'
  if (props.saas.revenue && props.saas.revenue !== '—' && props.saas.revenue !== '‐' && props.saas.revenue !== '-') {
    return props.saas.revenue
  }
  if (props.saas.mrr === null) return '—'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: props.saas.currency || 'USD',
    maximumFractionDigits: 0
  }).format(props.saas.mrr * 12)
})

const displayName = computed(() => {
  return props.saas.isIncognito ? t.value.gem_card.incognito : (props.saas.name || t.value.gem_card.no_name)
})

const initials = computed(() => {
  if (props.saas.isIncognito || !props.saas.name) return '?'
  return props.saas.name.charAt(0).toUpperCase()
})

const descriptionText = computed(() => {
  if (props.saas.isIncognito) return null
  return props.saas.description || null
})

const COUNTRY_ISO_MAP: Record<string, string> = {
  argentina: 'ar',
  bolivia: 'bo',
  chile: 'cl',
  colombia: 'co',
  'costa-rica': 'cr',
  cuba: 'cu',
  ecuador: 'ec',
  'el-salvador': 'sv',
  espana: 'es',
  'estados-unidos': 'us',
  guatemala: 'gt',
  honduras: 'hn',
  mexico: 'mx',
  nicaragua: 'ni',
  panama: 'pa',
  paraguay: 'py',
  peru: 'pe',
  'puerto-rico': 'pr',
  'republica-dominicana': 'do',
  uruguay: 'uy',
  venezuela: 've',
}

const isGlobal = computed(() => {
  return !props.saas.country || props.saas.country.slug === 'global' || props.saas.country.iso_code === 'un'
})

const countryFlagSrc = computed(() => {
  if (props.saas.isIncognito || isGlobal.value) return null
  
  const country = props.saas.country
  if (!country) return null

  const iso = country.iso_code || (country.slug ? COUNTRY_ISO_MAP[country.slug] : null)
  if (iso) {
    return `https://flagcdn.com/w40/${iso.toLowerCase()}.png`
  }
  
  return null
})
</script>

<template>
  <NuxtLink 
    :to="saas.isIncognito ? undefined : localePath(`/saas/${saas.slug || slugify(saas.name || '')}`)"
    @mouseenter="!saas.isIncognito && preloadLogo(saas.logoUrl)"
    class="gem-card group block relative overflow-hidden rounded-2xl border bg-white/[0.05] backdrop-blur-md p-6 transition-all duration-500"
    :class="[gemClass, saas.isIncognito ? 'pointer-events-none' : 'cursor-pointer', { 'has-glow': hasGlow }]"
    :style="cardStyle"
  >
    <!-- Quarter Circle Corner Flag / Global Icon -->
    <div 
      v-if="!saas.isIncognito"
      class="absolute top-0 left-0 z-10 w-[26px] h-[26px] bg-black/40 border-r border-b border-white/10 opacity-30 group-hover:opacity-60 transition-opacity rounded-br-[100%] overflow-hidden"
    >
      <img 
        v-if="countryFlagSrc"
        :src="countryFlagSrc" 
        :alt="saas.country?.name || 'Bandera'" 
        class="absolute top-0 left-0 w-full h-full object-cover"
      />
      <div v-else class="absolute top-0 left-0 w-full h-full text-neutral-400">
        <svg class="absolute -top-[10px] -left-[10px] w-[32px] h-[32px] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/><path d="M2 12h20"/></svg>
      </div>
    </div>

    <div class="relative z-10 flex flex-col justify-between h-full gap-4">
      <div>
        <div class="flex items-center justify-between gap-4">
          <div class="flex items-center gap-3 min-w-0">
            <div class="w-12 h-12 rounded-xl flex items-center justify-center font-serif text-lg font-bold shrink-0 transition-transform duration-500 logo-box">
              <SaasLogo
                :src="!saas.isIncognito ? saas.logoUrl : null"
                :alt="displayName"
                :initial="initials"
                size="lg"
                rounded="xl"
                :gem-color="gemColor"
                class="w-full h-full"
                :websiteUrl="saas.websiteUrl"
              />
            </div>
            <div class="min-w-0">
              <h3 class="font-sans text-base font-semibold text-white leading-tight tracking-wide truncate">{{ displayName }}</h3>
              <div class="mt-1 flex items-center">
                <span 
                  class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-sans font-light tracking-[0.06em] uppercase border truncate transition-colors"
                  :style="{
                    borderColor: `color-mix(in srgb, ${gemColor} 40%, transparent)`,
                    backgroundColor: `color-mix(in srgb, ${gemColor} 10%, transparent)`,
                    color: `color-mix(in srgb, ${gemColor} 85%, white)`
                  }"
                >
                  {{ saas.category || t.gem_card.category_fallback }}
                </span>
              </div>
            </div>
          </div>

          <div v-if="saas.views !== undefined" class="text-right shrink-0">
            <span class="text-[9px] font-sans font-extralight tracking-widest text-neutral-500 uppercase block">{{ t.gem_card.views }}</span>
            <span class="text-xs font-mono text-neutral-300 font-light">{{ saas.views }}</span>
          </div>
        </div>

        <p 
          v-if="descriptionText" 
          class="font-sans font-extralight text-[13px] text-neutral-400 leading-relaxed mt-3 line-clamp-2"
        >
          {{ descriptionText }}
        </p>
      </div>

      <div class="mt-4 pt-4 border-t border-white/10 flex justify-between items-center gap-2">
        <div class="flex flex-col">
          <span class="text-[9px] font-sans font-extralight tracking-[0.08em] text-neutral-500 uppercase">{{ t.gem_card.mrr }}</span>
          <span class="text-sm font-mono text-white mt-1">
            <template v-if="!saas.isIncognito && saas.mrr !== null">{{ formattedMrr }}</template>
            <IncognitoIcon v-else class="w-4 h-4 text-neutral-600 inline" />
          </span>
        </div>
        <div class="flex flex-col items-end">
          <span class="text-[9px] font-sans font-extralight tracking-[0.08em] text-neutral-500 uppercase">{{ saas.revenue ? 'Revenue' : t.gem_card.arr_est }}</span>
          <span class="text-sm font-mono text-neutral-300 mt-1">
            <template v-if="!saas.isIncognito && annualRevenue !== '—'">{{ annualRevenue }}</template>
            <IncognitoIcon v-else class="w-4 h-4 text-[#00D4FF]/60 inline" />
          </span>
        </div>
      </div>
    </div>
  </NuxtLink>
</template>

<style scoped>
.gem-card {
  border-color: rgba(255, 255, 255, 0.1);
}

.gem-card::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -150%;
  width: 50%;
  height: 200%;
  background: linear-gradient(
    to right,
    rgba(255, 255, 255, 0) 0%,
    rgba(255, 255, 255, 0.05) 30%,
    rgba(255, 255, 255, 0.25) 50%,
    rgba(255, 255, 255, 0.05) 70%,
    rgba(255, 255, 255, 0) 100%
  );
  transform: rotate(30deg);
  transition: all 1.2s ease;
  opacity: 0;
  pointer-events: none;
  z-index: 2;
}

.gem-card.has-glow::after {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at -10% 50%, color-mix(in srgb, var(--glow) 15%, transparent) 0%, transparent 80%);
  z-index: 0;
  pointer-events: none;
}

.gem-card:hover::before {
  left: 150%;
  opacity: 1;
  transition: all 1.2s ease;
}

.gem-card:hover {
  background-color: rgba(255, 255, 255, 0.04);
  transform: translateY(-2px);
}

/* Amethyst (Purple) */
.gem-amethyst {
  border-color: rgba(139, 92, 246, 0.15);
}
.gem-amethyst .logo-box {
  background-color: rgba(139, 92, 246, 0.1);
  color: #a78bfa;
}
.gem-amethyst:hover {
  border-color: rgba(139, 92, 246, 0.5);
  box-shadow: 0 0 35px rgba(139, 92, 246, 0.15), inset 0 0 15px rgba(139, 92, 246, 0.05);
}

/* Emerald (Green) */
.gem-emerald {
  border-color: rgba(16, 185, 129, 0.15);
}
.gem-emerald .logo-box {
  background-color: rgba(16, 185, 129, 0.1);
  color: #34d399;
}
.gem-emerald:hover {
  border-color: rgba(16, 185, 129, 0.5);
  box-shadow: 0 0 35px rgba(16, 185, 129, 0.15), inset 0 0 15px rgba(16, 185, 129, 0.05);
}

/* Sapphire (Blue/Cyan) */
.gem-sapphire {
  border-color: rgba(6, 182, 212, 0.15);
}
.gem-sapphire .logo-box {
  background-color: rgba(6, 182, 212, 0.1);
  color: #22d3ee;
}
.gem-sapphire:hover {
  border-color: rgba(6, 182, 212, 0.5);
  box-shadow: 0 0 35px rgba(6, 182, 212, 0.15), inset 0 0 15px rgba(6, 182, 212, 0.05);
}

/* Ruby (Red/Rose) */
.gem-ruby {
  border-color: rgba(244, 63, 94, 0.15);
}
.gem-ruby .logo-box {
  background-color: rgba(244, 63, 94, 0.1);
  color: #fb7185;
}
.gem-ruby:hover {
  border-color: rgba(244, 63, 94, 0.5);
  box-shadow: 0 0 35px rgba(244, 63, 94, 0.15), inset 0 0 15px rgba(244, 63, 94, 0.05);
}

/* Quartz (Amber/Gold) */
.gem-quartz {
  border-color: rgba(245, 158, 11, 0.15);
}
.gem-quartz .logo-box {
  background-color: rgba(245, 158, 11, 0.1);
  color: #fbbf24;
}
.gem-quartz:hover {
  border-color: rgba(245, 158, 11, 0.5);
  box-shadow: 0 0 35px rgba(245, 158, 11, 0.15), inset 0 0 15px rgba(245, 158, 11, 0.05);
}
</style>
