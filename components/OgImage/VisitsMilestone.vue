<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  name?: string
  logoUrl?: string
  milestone?: number | string
  revenue?: string
  category?: string
  categorySlug?: string
}>()

const cleanMilestone = computed(() => {
  return props.milestone ? String(props.milestone) : '100'
})

const badgeUrl = computed(() => {
  return `https://qsjnouwunclflruotduc.supabase.co/storage/v1/object/public/achievements/v2/badge-${cleanMilestone.value}.png`
})

const formattedMilestoneText = computed(() => {
  const v = Number(cleanMilestone.value)
  return v.toLocaleString('es-ES')
})

function parseRevenueAmount(val: string | number | undefined | null): number {
  if (!val) return 0
  const clean = String(val).replace(/[^0-9.]/g, '')
  return Number(clean) || 0
}

const showRevenue = computed(() => {
  return parseRevenueAmount(props.revenue) > 10
})

const hasValidLogo = computed(() => {
  if (!props.logoUrl) return false
  const clean = props.logoUrl.toLowerCase().split('?')[0]
  return !clean.endsWith('.webp') && !clean.endsWith('.ico')
})
</script>

<template>
  <div class="w-full h-full flex flex-col justify-between bg-[#06070a] text-white p-[54px] px-[64px] relative font-sans">
    
    <!-- Top Bar -->
    <div class="w-full flex flex-row items-center justify-between">
      <div class="flex flex-row items-center">
        <div class="w-8 h-8 rounded-lg bg-white flex items-center justify-center mr-3 shadow-md">
          <span class="text-black font-black text-xl leading-none">f</span>
        </div>
        <span class="text-white tracking-[0.2em] font-bold text-[14px]">FACTOSAAS.COM</span>
      </div>

      <div class="flex flex-row items-center gap-3">
        <div
          v-if="showRevenue"
          class="bg-white/[0.06] border border-white/15 rounded-full px-4 py-1.5 flex flex-row items-center gap-2 mr-2"
        >
          <span class="text-neutral-400 text-xs font-semibold tracking-wider uppercase">Facturado:</span>
          <span class="text-[#00D4FF] text-xs font-black tracking-tight">{{ revenue }}</span>
        </div>

        <div class="bg-[#00D4FF]/10 border border-[#00D4FF]/30 rounded-full px-5 py-1.5 flex flex-row items-center">
          <div class="w-2 h-2 rounded-full bg-[#00D4FF] mr-2.5"></div>
          <span class="text-[#00D4FF] text-xs font-bold tracking-widest uppercase">
            Hito de Visitas
          </span>
        </div>
      </div>
    </div>

    <!-- Main Content: Left Column + Right Badge -->
    <div class="w-full flex flex-row items-center justify-between my-auto">
      
      <!-- Left Column: Title & Startup Info -->
      <div class="flex flex-col items-start justify-center max-w-[620px] pl-2">
        <span class="text-[#00D4FF] text-[13px] font-black tracking-[0.25em] uppercase mb-5">
          ¡NUEVO LOGRO DESBLOQUEADO!
        </span>

        <div class="flex flex-row items-center mb-6">
          <div
            v-if="hasValidLogo"
            class="w-[88px] h-[88px] rounded-[22px] overflow-hidden border border-white/15 bg-[#111622] flex items-center justify-center mr-5 shadow-2xl flex-shrink-0"
          >
            <img :src="logoUrl" width="88" height="88" class="w-full h-full object-cover" />
          </div>
          <div
            v-else
            class="w-[88px] h-[88px] rounded-[22px] border border-white/15 bg-[#111622] flex items-center justify-center mr-5 shadow-2xl flex-shrink-0"
          >
            <span class="text-4xl font-black text-[#00D4FF]">
              {{ name ? name.charAt(0).toUpperCase() : 'S' }}
            </span>
          </div>

          <h2 class="text-white font-extrabold text-[64px] tracking-tight leading-none">
            {{ name || 'SaaS' }}
          </h2>
        </div>

        <p class="text-[32px] tracking-tight leading-tight flex flex-row items-center">
          <span class="text-neutral-300 font-normal mr-2">alcanzó las</span>
          <span class="text-white font-black">{{ formattedMilestoneText }} visitas</span>
        </p>
      </div>

      <!-- Right Column: Massive Badge -->
      <div class="flex items-center justify-center">
        <img
          :src="badgeUrl"
          width="440"
          height="406"
          class="w-[440px] h-[406px]"
        />
      </div>

    </div>

    <!-- Footer Bar -->
    <div class="w-full flex flex-row items-center justify-between text-neutral-400 text-xs pt-4 border-t border-white/[0.06]">
      <div class="flex flex-row items-center gap-2">
        <span class="text-[#00D4FF] font-bold text-sm leading-none mr-1.5">✓</span>
        <span>Hito de visitas verificado</span>
      </div>
      <span class="tracking-wider">factosaas.com</span>
    </div>

  </div>
</template>
