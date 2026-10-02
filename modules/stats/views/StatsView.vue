<script setup lang="ts">
import GlobalBreadcrumb from '~/ui/components/GlobalBreadcrumb.vue'
import StatsKpis from '../components/StatsKpis.vue'
import StatsBentoGrid from '../components/StatsBentoGrid.vue'
import { useStatsData } from '../composables/useStatsData'

import es from '../locales/es.json'
import en from '../locales/en.json'

const { t } = useLanguage({ es, en })
const { stats, pending, error, refresh } = await useStatsData()
</script>

<template>
  <main class="min-h-screen bg-[#030305] text-white overflow-x-clip relative isolate flex flex-col items-center pt-14 pb-24 px-4 sm:px-6">
    <!-- Background Glow -->
    <div class="absolute inset-0 z-[-1] pointer-events-none flex items-center justify-center">
      <div class="w-[80vw] h-[80vw] max-w-[800px] max-h-[800px] bg-[#00D4FF]/5 rounded-full blur-[120px] opacity-40"></div>
    </div>

    <div class="w-full max-w-6xl mb-6">
      <GlobalBreadcrumb :items="[{ label: t?.breadcrumb || 'Estadísticas' }]" />
    </div>

    <div class="w-full max-w-6xl flex flex-col gap-10">
      <!-- Header Area replicating /saas and Facto Design System -->
      <header class="pt-2 pb-2 flex flex-col gap-3">
        <h1 class="font-serif text-3xl sm:text-4xl lg:text-[42px] font-normal leading-tight tracking-tight text-white min-w-0 flex-1 break-words whitespace-normal">
          {{ t?.title_start }} <span class="facto-effect">{{ t?.title_highlight }}</span>
        </h1>
        <p class="font-sans font-extralight text-sm text-neutral-400 max-w-2xl leading-relaxed">
          {{ t?.description }}
        </p>
      </header>

      <!-- Loading Skeletons -->
      <div v-if="pending" class="flex flex-col gap-8 animate-pulse">
        <div class="grid grid-cols-2 sm:grid-cols-5 gap-4">
          <div v-for="n in 5" :key="'kpi-sk-' + n" class="h-28 rounded-3xl bg-[#131316] border border-white/10"></div>
        </div>
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div class="lg:col-span-2 h-72 rounded-3xl bg-[#131316] border border-white/10"></div>
          <div class="h-72 rounded-3xl bg-[#131316] border border-white/10"></div>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="text-center py-16">
        <p class="text-red-400 font-sans text-sm font-light bg-red-400/10 border border-red-500/20 rounded-xl p-4 inline-block">
          {{ error.message || 'Error cargando las estadísticas' }}
        </p>
        <button @click="() => refresh()" class="block mx-auto mt-4 px-4 py-2 rounded-xl bg-white/10 text-xs hover:bg-white/20 transition-colors">
          Reintentar
        </button>
      </div>

      <!-- Content -->
      <template v-else-if="stats">
        <!-- Daily KPIs Section -->
        <StatsKpis :summary="stats.summary" :timeline="stats.timeline" />

        <!-- Bento Grid Charts & Breakdowns Section -->
        <StatsBentoGrid
          :timeline="stats.timeline"
          :summary="stats.summary"
          :by-category="stats.byCategory"
          :by-country="stats.byCountry"
        />
      </template>
    </div>
  </main>
</template>

<style scoped>
.facto-effect {
  background: linear-gradient(120deg, rgba(255,255,255,0) 30%, rgba(255,255,255,0.8) 50%, rgba(255,255,255,0) 70%);
  background-size: 200% auto;
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: rgba(0, 212, 255, 0.3);
  filter: drop-shadow(0 0 15px rgba(0, 212, 255, 0.4));
  animation: shine 12s ease-in-out infinite;
  display: inline-block;
}

@keyframes shine {
  0%   { background-position: -100% 0; }
  100% { background-position: 100% 0; }
}
</style>
