<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  name?: string
  logoUrl?: string
  mrr?: number | string | null
  revenue?: string
  views?: number | string
  category?: string
  categorySlug?: string
}>()

const formattedRevenue = computed(() => {
  if (props.revenue && props.revenue !== '—') return props.revenue
  if (props.mrr !== null && props.mrr !== undefined && !isNaN(Number(props.mrr))) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(Number(props.mrr))
  }
  return '$0'
})

const formattedViews = computed(() => {
  if (props.views !== null && props.views !== undefined && props.views !== '') {
    return Number(props.views).toLocaleString()
  }
  return '0'
})

const gemColor = computed(() => {
  const map: Record<string, string> = {
    'marketing': '#FF3366',
    'finanzas': '#00D4FF',
    'productividad': '#A855F7',
    'ecommerce': '#F59E0B',
  }
  return (props.categorySlug && map[props.categorySlug]) || '#00D4FF'
})
</script>

<template>
  <div class="w-full h-full flex flex-col justify-between items-center bg-[#030305] text-white p-[50px] relative font-sans">
    
    <!-- Top Bar: Facto Brand & Verification Status -->
    <div class="w-full flex flex-row items-center justify-between">
      <!-- Left: Facto Brand Watermark -->
      <div class="flex flex-row items-center">
        <div class="w-9 h-9 rounded-xl bg-white flex items-center justify-center mr-3">
          <span class="text-black font-black text-xl leading-none">f</span>
        </div>
        <span class="text-white tracking-[0.2em] font-bold text-base">FACTOSAAS.COM</span>
      </div>

      <!-- Right: Category & Badge -->
      <div class="flex flex-row items-center">
        <div class="bg-white/[0.06] border border-white/10 rounded-full px-4 py-1.5 mr-3 flex items-center">
          <span :style="{ color: gemColor }" class="text-xs font-bold tracking-widest uppercase">
            {{ category || 'SaaS' }}
          </span>
        </div>
        <div class="bg-[#00D4FF]/10 border border-[#00D4FF]/30 rounded-full px-4 py-1.5 flex flex-row items-center">
          <div class="w-2 h-2 rounded-full bg-[#00D4FF] mr-2"></div>
          <span class="text-[#00D4FF] text-xs font-bold tracking-wider uppercase">
            Métricas Públicas
          </span>
        </div>
      </div>
    </div>

    <!-- Center Section: Logo, Title & Subtitle -->
    <div class="flex flex-col items-center justify-center text-center my-auto">
      <!-- Startup Logo -->
      <div v-if="logoUrl" class="w-24 h-24 rounded-3xl overflow-hidden border border-white/15 bg-[#131316] flex items-center justify-center mb-4">
        <img :src="logoUrl" class="w-24 h-24 object-cover" />
      </div>
      <div v-else class="w-24 h-24 rounded-3xl border border-white/15 bg-[#131316] flex items-center justify-center mb-4">
        <span class="text-4xl text-white font-bold">{{ name ? name.charAt(0).toUpperCase() : 'S' }}</span>
      </div>

      <!-- Title -->
      <h1 class="text-white font-extrabold text-5xl tracking-tight leading-none mb-2">
        {{ name || 'SaaS' }}
      </h1>
      <p class="text-neutral-400 text-lg font-light">
        Validación pública y métricas verificadas en Facto
      </p>
    </div>

    <!-- Bottom Proof Section: 3 Horizontal Cards -->
    <div class="w-full flex flex-row items-center justify-between gap-6">
      <!-- Facturado Metric Card -->
      <div class="flex-1 h-28 bg-[#131316] border border-white/10 rounded-2xl flex flex-col items-center justify-center">
        <span class="text-[#00D4FF] text-4xl font-extrabold tracking-tight leading-none">
          {{ formattedRevenue }}
        </span>
        <span class="text-neutral-400 text-[11px] font-semibold tracking-widest uppercase mt-2">
          Facturado Verificado
        </span>
      </div>

      <!-- Real Visits Metric Card -->
      <div class="flex-1 h-28 bg-[#131316] border border-white/10 rounded-2xl flex flex-col items-center justify-center">
        <span class="text-white text-4xl font-extrabold tracking-tight leading-none">
          {{ formattedViews }}
        </span>
        <span class="text-neutral-400 text-[11px] font-semibold tracking-widest uppercase mt-2">
          Visitas Reales
        </span>
      </div>

      <!-- Top Founders Badge Card -->
      <div class="flex-1 h-28 bg-[#00D4FF]/[0.04] border border-[#00D4FF]/25 rounded-2xl flex flex-col items-center justify-center">
        <span class="text-[#00D4FF] text-xl font-bold tracking-wider leading-none">
          TOP FOUNDERS
        </span>
        <span class="text-neutral-300 text-xs font-medium mt-2">
          Ranking público en tiempo real
        </span>
      </div>
    </div>

  </div>
</template>
