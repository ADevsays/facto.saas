<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  name?: string
  logoUrl?: string
  badgeUrl?: string
  milestone?: number | string
  revenue?: string
  category?: string
  categorySlug?: string
}>()

const cleanMilestone = computed(() => {
  return props.milestone ? String(props.milestone) : '100'
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

const fallbackInitial = computed(() => {
  return props.name?.trim().charAt(0).toUpperCase() || 'S'
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
    <div class="w-full flex flex-row items-center justify-between gap-[32px] my-auto">
      
      <!-- Left Column: Title & Startup Info -->
      <div class="w-[650px] flex flex-col items-start justify-center pl-2">
        <span class="text-[#00D4FF] text-[13px] font-black tracking-[0.25em] uppercase mb-5">
          ¡NUEVO LOGRO DESBLOQUEADO!
        </span>

        <div class="w-full flex flex-row items-center mb-6">
          <div
            class="w-[88px] h-[88px] rounded-[22px] overflow-hidden border border-white/15 bg-[#111622] flex items-center justify-center mr-5 shadow-2xl flex-shrink-0 relative"
          >
            <img v-if="logoUrl" :src="logoUrl" width="88" height="88" class="w-full h-full object-cover" />
            <div
              v-if="!logoUrl"
              style="width: 88px; height: 88px; display: flex; align-items: center; justify-content: center;"
            >
              <span class="font-black text-[#00D4FF]" style="font-size: 42px; line-height: 1;">
                {{ fallbackInitial }}
              </span>
            </div>
          </div>

          <h2 class="w-[520px] text-white font-extrabold text-[50px] tracking-tight leading-none">
            {{ name || 'SaaS' }}
          </h2>
        </div>

        <p class="text-[32px] tracking-tight leading-tight flex flex-row items-center">
          <span class="text-neutral-300 font-normal mr-2">alcanzó las</span>
          <span class="text-white font-black">{{ formattedMilestoneText }} visitas</span>
        </p>
      </div>

      <!-- Right Column: Massive Badge -->
      <div class="w-[360px] flex-shrink-0 flex items-center justify-center">
        <img
          v-if="props.badgeUrl"
          :src="props.badgeUrl"
          width="360"
          height="332"
          class="w-[360px] h-[332px] object-contain"
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
