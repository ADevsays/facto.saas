<script setup lang="ts">
import { computed } from 'vue'
import type { StatsOverviewResponse } from '~/server/api/stats/index.get'

import es from '../locales/es.json'
import en from '../locales/en.json'

const { t } = useLanguage({ es, en })

const props = defineProps<{
  summary: StatsOverviewResponse['summary']
  timeline: StatsOverviewResponse['timeline']
}>()

const todayStartups = computed(() => {
  return props.summary.today?.startupsAdded ?? 0
})

const todayRevenue = computed(() => {
  return props.summary.today?.revenueAdded ?? 0
})

const todayViews = computed(() => {
  return props.summary.today?.viewsAdded ?? 0
})
</script>

<template>
  <section class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4 w-full">
    <!-- 1. Startups Hoy -->
    <div class="p-4 sm:p-5 rounded-3xl border border-white/10 bg-surface-elevated hover:bg-surface-elevated-hover hover:border-white/20 transition-all duration-300 flex flex-col justify-between group">
      <div class="flex items-center justify-between">
        <span class="text-[10px] font-sans font-extralight tracking-widest text-neutral-400 uppercase truncate">
          {{ t?.kpis?.today_startups }}
        </span>
        <span class="flex items-center gap-1.5 shrink-0">
          <span class="w-1.5 h-1.5 rounded-full bg-[#00D4FF] animate-pulse"></span>
        </span>
      </div>
      <div class="my-2">
        <div class="flex items-baseline gap-1.5">
          <span
            class="text-2xl sm:text-3xl font-serif text-white font-bold lining-nums tabular-nums leading-none transition-opacity"
            :class="todayStartups === 0 ? 'opacity-40' : 'opacity-100'"
            style="font-variant-numeric: lining-nums tabular-nums; font-feature-settings: 'lnum' 1, 'tnum' 1; line-height: 1;"
          >
            <span class="text-[0.6em] opacity-70 font-normal mr-0.5 inline-block align-top">+</span>{{ todayStartups.toLocaleString('en-US') }}
          </span>
          <span class="text-[0.8rem] font-sans font-normal text-neutral-400 leading-none">hoy</span>
        </div>
        <p class="text-[11px] font-sans text-neutral-400 font-extralight mt-1 truncate">
          {{ summary.totalStartups.toLocaleString('en-US') }} {{ t?.kpis?.today_startups_sub }}
        </p>
      </div>
    </div>

    <!-- 2. Revenue Hoy -->
    <div class="p-4 sm:p-5 rounded-3xl border border-white/10 bg-surface-elevated hover:bg-surface-elevated-hover hover:border-white/20 transition-all duration-300 flex flex-col justify-between group">
      <div class="flex items-center justify-between">
        <span class="text-[10px] font-sans font-extralight tracking-widest text-neutral-400 uppercase truncate">
          {{ t?.kpis?.today_revenue }}
        </span>
        <svg class="w-3.5 h-3.5 text-cyan-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
        </svg>
      </div>
      <div class="my-2">
        <div class="flex items-baseline gap-1.5">
          <span
            class="text-2xl sm:text-3xl font-serif text-cyan-400 font-bold lining-nums tabular-nums leading-none transition-opacity"
            :class="todayRevenue === 0 ? 'opacity-40' : 'opacity-100'"
            style="font-variant-numeric: lining-nums tabular-nums; font-feature-settings: 'lnum' 1, 'tnum' 1; line-height: 1;"
          >
            <span class="text-[0.6em] opacity-70 font-normal mr-0.5 inline-block align-top">+$</span>{{ todayRevenue.toLocaleString('en-US') }}
          </span>
          <span class="text-[0.8rem] font-sans font-normal text-neutral-400 leading-none">hoy</span>
        </div>
        <p class="text-[11px] font-sans text-neutral-400 font-extralight mt-1 truncate">
          ${{ summary.totalRevenue.toLocaleString('en-US') }} {{ t?.kpis?.today_revenue_sub }}
        </p>
      </div>
    </div>

    <!-- 3. Visitas Hoy -->
    <div class="p-4 sm:p-5 rounded-3xl border border-white/10 bg-surface-elevated hover:bg-surface-elevated-hover hover:border-white/20 transition-all duration-300 flex flex-col justify-between group">
      <div class="flex items-center justify-between">
        <span class="text-[10px] font-sans font-extralight tracking-widest text-neutral-400 uppercase truncate">
          {{ t?.kpis?.today_views }}
        </span>
        <svg class="w-3.5 h-3.5 text-purple-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
          <circle cx="12" cy="12" r="3"/>
        </svg>
      </div>
      <div class="my-2">
        <div class="flex items-baseline gap-1.5">
          <span
            class="text-2xl sm:text-3xl font-serif text-purple-400 font-bold lining-nums tabular-nums leading-none transition-opacity"
            :class="todayViews === 0 ? 'opacity-40' : 'opacity-100'"
            style="font-variant-numeric: lining-nums tabular-nums; font-feature-settings: 'lnum' 1, 'tnum' 1; line-height: 1;"
          >
            <span class="text-[0.6em] opacity-70 font-normal mr-0.5 inline-block align-top">+</span>{{ todayViews.toLocaleString('en-US') }}
          </span>
          <span class="text-[0.8rem] font-sans font-normal text-neutral-400 leading-none">hoy</span>
        </div>
        <p class="text-[11px] font-sans text-neutral-400 font-extralight mt-1 truncate">
          {{ (summary.totalViews >= 1000 ? (summary.totalViews / 1000).toFixed(1) + 'K' : summary.totalViews.toLocaleString('en-US')) }} {{ t?.kpis?.today_views_sub }}
        </p>
      </div>
    </div>

    <!-- 4. MRR Total Verificado -->
    <div class="p-4 sm:p-5 rounded-3xl border border-white/10 bg-surface-elevated hover:bg-surface-elevated-hover hover:border-white/20 transition-all duration-300 flex flex-col justify-between group">
      <div class="flex items-center justify-between">
        <span class="text-[10px] font-sans font-extralight tracking-widest text-neutral-400 uppercase truncate">
          {{ t?.kpis?.total_mrr }}
        </span>
        <span class="text-[9px] font-mono text-emerald-400 px-1.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 shrink-0">
          Stripe
        </span>
      </div>
      <div class="my-2">
        <div class="flex items-baseline gap-1.5">
          <span
            class="text-2xl sm:text-3xl font-serif text-emerald-400 font-bold lining-nums tabular-nums leading-none transition-opacity"
            :class="summary.totalMrr === 0 ? 'opacity-40' : 'opacity-100'"
            style="font-variant-numeric: lining-nums tabular-nums; font-feature-settings: 'lnum' 1, 'tnum' 1; line-height: 1;"
          >
            <span class="text-[0.6em] opacity-70 font-normal mr-0.5 inline-block align-top">$</span>{{ summary.totalMrr.toLocaleString('en-US') }}
          </span>
          <span class="text-[0.8rem] font-sans font-normal text-neutral-400 leading-none">/ mes</span>
        </div>
        <p class="text-[11px] font-sans text-neutral-400 font-extralight mt-1 truncate">
          Avg. ${{ summary.avgMrr.toLocaleString('en-US') }} {{ t?.kpis?.total_mrr_sub }}
        </p>
      </div>
    </div>

    <!-- 5. Países Activos -->
    <div class="p-4 sm:p-5 rounded-3xl border border-white/10 bg-surface-elevated hover:bg-surface-elevated-hover hover:border-white/20 transition-all duration-300 flex flex-col justify-between group col-span-2 sm:col-span-1">
      <div class="flex items-center justify-between">
        <span class="text-[10px] font-sans font-extralight tracking-widest text-neutral-400 uppercase truncate">
          {{ t?.kpis?.countries_count }}
        </span>
        <svg class="w-3.5 h-3.5 text-neutral-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
          <path d="M2 12h20"/>
        </svg>
      </div>
      <div class="my-2">
        <div class="flex items-baseline gap-1.5">
          <span
            class="text-2xl sm:text-3xl font-serif text-white font-bold lining-nums tabular-nums leading-none transition-opacity"
            :class="summary.countriesCount === 0 ? 'opacity-40' : 'opacity-100'"
            style="font-variant-numeric: lining-nums tabular-nums; font-feature-settings: 'lnum' 1, 'tnum' 1; line-height: 1;"
          >
            {{ summary.countriesCount.toLocaleString('en-US') }}
          </span>
          <span class="text-[0.8rem] font-sans font-normal text-neutral-400 leading-none">países</span>
        </div>
        <p class="text-[11px] font-sans text-neutral-400 font-extralight mt-1 truncate">
          {{ t?.kpis?.countries_sub }}
        </p>
      </div>
    </div>
  </section>
</template>
