<script setup lang="ts">
import { computed } from 'vue'
import { slugify } from '~/utils/slugify'
import type { SaasListItem } from '~/modules/ranking/types'
import IncognitoIcon from '~/ui/components/IncognitoIcon.vue'
import SaasLogo from '~/ui/components/SaasLogo.vue'
import { getGemClass, getGemColor } from '~/ui/const/gems'

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
  if (props.saas.mrr === null) return '—'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: props.saas.currency || 'USD',
    maximumFractionDigits: 0
  }).format(props.saas.mrr * 12)
})

const displayName = computed(() => {
  return props.saas.isIncognito ? '— Anónimo —' : (props.saas.name || 'Sin nombre')
})

const initials = computed(() => {
  if (props.saas.isIncognito || !props.saas.name) return '?'
  return props.saas.name.charAt(0).toUpperCase()
})
</script>

<template>
  <NuxtLink 
    :to="saas.isIncognito ? undefined : `/saas/${slugify(saas.name || '')}`"
    class="gem-card block relative overflow-hidden rounded-2xl border bg-white/[0.05] backdrop-blur-md p-6 transition-all duration-500"
    :class="[gemClass, saas.isIncognito ? 'pointer-events-none' : 'cursor-pointer', { 'has-glow': hasGlow }]"
    :style="cardStyle"
  >
    <div class="relative z-10 flex flex-col gap-4">
      <div class="flex items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-xl flex items-center justify-center font-serif text-lg font-bold shrink-0 transition-transform duration-500 logo-box">
            <SaasLogo
              :src="!saas.isIncognito ? saas.logoUrl : null"
              :alt="displayName"
              :initial="initials"
              size="lg"
              rounded="xl"
              :gem-color="gemColor"
              class="w-full h-full"
            />
          </div>
          <div>
            <h3 class="font-sans text-base font-semibold text-white leading-tight tracking-wide">{{ displayName }}</h3>
            <span class="text-[10px] font-sans font-light tracking-[0.08em] uppercase text-neutral-400 mt-1 block">{{ saas.category || 'Categoría' }}</span>
          </div>
        </div>

        <div v-if="saas.views !== undefined" class="text-right">
          <span class="text-[9px] font-sans font-extralight tracking-widest text-neutral-500 uppercase block">Vistas</span>
          <span class="text-xs font-mono text-neutral-300 font-light">{{ saas.views }}</span>
        </div>
      </div>

      <div class="mt-4 pt-4 border-t border-white/10 flex justify-between items-center gap-2">
        <div class="flex flex-col">
          <span class="text-[9px] font-sans font-extralight tracking-[0.08em] text-neutral-500 uppercase">MRR</span>
          <span class="text-sm font-mono text-white mt-1">
            <template v-if="saas.mrr !== null">{{ formattedMrr }}</template>
            <IncognitoIcon v-else class="w-4 h-4 text-neutral-600 inline" />
          </span>
        </div>
        <div class="flex flex-col items-end">
          <span class="text-[9px] font-sans font-extralight tracking-[0.08em] text-neutral-500 uppercase">ARR (Est.)</span>
          <span class="text-sm font-mono text-neutral-300 mt-1">
            <template v-if="saas.mrr !== null">{{ annualRevenue }}</template>
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
