<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  totalRevenue?: number | string
  totalMrr?: number | string
  totalStartups?: number | string
  totalViews?: number | string
  countriesCount?: number | string
  categoriesCount?: number | string
  verifiedCount?: number | string
}>()

const formatCompactCurrency = (value: number | string | undefined) => {
  const num = Number(value || 0)
  if (isNaN(num) || num === 0) return '$0'
  if (num >= 1_000_000) {
    return `$${(num / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`
  }
  if (num >= 1_000) {
    return `$${(num / 1_000).toFixed(1).replace(/\.0$/, '')}K`
  }
  return `$${Math.round(num).toLocaleString('en-US')}`
}

const formattedRevenue = computed(() => {
  if (typeof props.totalRevenue === 'string' && props.totalRevenue.startsWith('$')) {
    return props.totalRevenue
  }
  return formatCompactCurrency(props.totalRevenue || props.totalMrr)
})

const formattedStartups = computed(() => {
  const val = Number(props.totalStartups || 0)
  return val.toLocaleString()
})

const formattedViews = computed(() => {
  const val = Number(props.totalViews || 0)
  if (val >= 1_000_000) {
    return `${(val / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`
  }
  if (val >= 1_000) {
    return `${(val / 1_000).toFixed(1).replace(/\.0$/, '')}K`
  }
  return val.toLocaleString()
})

const formattedCountries = computed(() => {
  return String(props.countriesCount || '15+')
})
</script>

<template>
  <div class="w-full h-full flex flex-col justify-between items-center bg-[#030305] text-white p-[48px] relative font-sans">
    
    <!-- Top Bar: Facto Brand & Live Status -->
    <div class="w-full flex flex-row items-center justify-between">
      <!-- Left: Facto Brand Watermark -->
      <div class="flex flex-row items-center">
        <div class="w-10 h-10 rounded-xl bg-white flex items-center justify-center mr-3 shadow-lg">
          <span class="text-black font-black text-2xl leading-none">f</span>
        </div>
        <div class="flex flex-col">
          <span class="text-white tracking-[0.2em] font-bold text-base leading-none">FACTOSAAS.COM</span>
          <span class="text-neutral-400 text-[10px] tracking-wider uppercase mt-1">Transparencia Radical</span>
        </div>
      </div>

      <!-- Right: Live Metrics Badge -->
      <div class="flex flex-row items-center gap-3">
        <div class="bg-white/[0.06] border border-white/10 rounded-full px-4 py-1.5 flex items-center">
          <span class="text-white text-xs font-bold tracking-widest uppercase">
            {{ formattedCountries }} Países
          </span>
        </div>
        <div class="bg-[#00D4FF]/10 border border-[#00D4FF]/30 rounded-full px-4 py-1.5 flex flex-row items-center">
          <div class="w-2.5 h-2.5 rounded-full bg-[#00D4FF] mr-2"></div>
          <span class="text-[#00D4FF] text-xs font-bold tracking-wider uppercase">
            Métricas en Vivo
          </span>
        </div>
      </div>
    </div>

    <!-- Center Section: Title & Headline -->
    <div class="flex flex-col items-center justify-center text-center my-auto">
      <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-[#00D4FF] text-xs uppercase tracking-widest font-semibold mb-3">
        Estadísticas del Ecosistema
      </div>
      <h1 class="text-white font-extrabold text-5xl tracking-tight leading-tight mb-2">
        Facturación Real & Tráfico de Startups
      </h1>
      <p class="text-neutral-400 text-lg font-light max-w-2xl">
        Métricas consolidadas y verificadas directamente vía Stripe, MercadoPago y Whop
      </p>
    </div>

    <!-- Bottom KPIs: 4 Horizontal Cards -->
    <div class="w-full flex flex-row items-center justify-between gap-5">
      <!-- Total Revenue Card -->
      <div class="flex-1 h-32 bg-[#131316] border border-white/10 rounded-2xl flex flex-col items-center justify-center p-4">
        <span class="text-[#00D4FF] text-4xl font-black tracking-tight leading-none">
          {{ formattedRevenue }}
        </span>
        <span class="text-neutral-400 text-[11px] font-semibold tracking-widest uppercase mt-2 text-center">
          Facturación Verificada
        </span>
      </div>

      <!-- Total Startups Card -->
      <div class="flex-1 h-32 bg-[#131316] border border-white/10 rounded-2xl flex flex-col items-center justify-center p-4">
        <span class="text-white text-4xl font-black tracking-tight leading-none">
          {{ formattedStartups }}
        </span>
        <span class="text-neutral-400 text-[11px] font-semibold tracking-widest uppercase mt-2 text-center">
          Startups Listadas
        </span>
      </div>

      <!-- Total Views Card -->
      <div class="flex-1 h-32 bg-[#131316] border border-white/10 rounded-2xl flex flex-col items-center justify-center p-4">
        <span class="text-white text-4xl font-black tracking-tight leading-none">
          {{ formattedViews }}
        </span>
        <span class="text-neutral-400 text-[11px] font-semibold tracking-widest uppercase mt-2 text-center">
          Visitas Totales
        </span>
      </div>

      <!-- Verification Proof Card -->
      <div class="flex-1 h-32 bg-[#00D4FF]/[0.05] border border-[#00D4FF]/25 rounded-2xl flex flex-col items-center justify-center p-4">
        <span class="text-[#00D4FF] text-2xl font-black tracking-wider leading-none">
          100% REAL
        </span>
        <span class="text-neutral-300 text-[11px] font-medium mt-2 text-center">
          Auditado por APIs
        </span>
      </div>
    </div>

  </div>
</template>
