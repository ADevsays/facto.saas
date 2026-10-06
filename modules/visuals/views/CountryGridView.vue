<script setup lang="ts">
import SaasBreadcrumb from '../components/SaasBreadcrumb.vue'
import InputMrrView from '../../input-mrr/views/InputMrrView.vue'
import SaasLogo from '~/ui/components/SaasLogo.vue'
import IncognitoIcon from '~/ui/components/IncognitoIcon.vue'
import { preloadLogo } from '~/utils/preloadLogo'

import es from '../locales/es.json'
import en from '../locales/en.json'

const { t } = useLanguage({ es, en })
const localePath = useLocalePath()
const { data: leaderboard, pending } = await useLazyFetch<any[]>('/api/countries/leaderboard')

useAppSeo({
  title: () => t.value?.country_leaderboard?.seo_title || 'Ranking Mundialista de SaaS | Facto',
  description: () => t.value?.country_leaderboard?.seo_description || 'Descubre el ranking mundialista de facturación e ingresos por país en Facto.'
})

function formatCurrency(val: number | null, curr: string = 'USD') {
  if (val === null || val === undefined) return '—'
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: curr, maximumFractionDigits: 0 }).format(val)
}
</script>

<template>
  <main class="min-h-screen bg-[#030305] text-white relative isolate pt-14 pb-20 px-6 flex flex-col items-center">
    <!-- Background glow -->
    <div class="absolute inset-0 z-[-1] pointer-events-none flex justify-center items-start pt-20 overflow-hidden">
      <div class="w-[80vw] h-[40vw] max-w-[800px] max-h-[400px] bg-[#00D4FF]/5 rounded-full blur-[120px] opacity-40"></div>
    </div>

    <div class="w-full max-w-5xl flex flex-col">
      <SaasBreadcrumb is-country />

      <div class="mt-10 mb-12 flex flex-col items-start border-b border-white/5 pb-8">
        <h1 class="font-serif text-4xl md:text-5xl font-normal leading-tight tracking-tight text-white">
          {{ t.country_leaderboard.title_start }} <span class="text-transparent bg-clip-text bg-gradient-to-r from-white to-[#00D4FF]/70 drop-shadow-[0_0_15px_rgba(0,212,255,0.4)]">{{ t.country_leaderboard.title_highlight }}</span>
        </h1>
        <p class="mt-4 font-sans font-extralight text-sm text-neutral-400">
          {{ t.country_leaderboard.description }}
        </p>

        <!-- Input Add MRR below subtitle -->
        <div class="mt-8 w-full">
          <InputMrrView full-width />
        </div>
      </div>

      <!-- High-fidelity skeleton loader -->
      <div v-if="pending" class="flex flex-col gap-6 relative z-10 w-full">
        <div 
          v-for="i in 3" 
          :key="i" 
          class="rounded-3xl border border-white/10 bg-surface-elevated p-6 md:p-8 relative overflow-hidden shadow-lg animate-pulse"
        >
          <!-- Top Country Header Skeleton -->
          <div class="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/5">
            <div class="flex items-center gap-4 md:gap-5 min-w-0">
              <!-- Rank Number Circle -->
              <div class="w-8 h-8 md:w-9 md:h-9 rounded-full bg-white/10 shrink-0"></div>
              
              <!-- Flag Box -->
              <div class="w-20 h-16 md:w-24 md:h-20 rounded-2xl bg-white/10 shrink-0 border border-white/10"></div>

              <!-- Country Title & Count -->
              <div class="min-w-0 space-y-2">
                <div class="h-6 md:h-7 w-32 md:w-48 rounded-lg bg-white/15"></div>
                <div class="h-3.5 w-20 md:w-28 rounded bg-white/5"></div>
              </div>
            </div>

            <!-- Revenue Summary -->
            <div class="flex flex-col md:items-end shrink-0 space-y-2">
              <div class="h-2.5 w-24 rounded bg-white/5"></div>
              <div class="h-6 md:h-7 w-28 md:w-36 rounded-lg bg-white/15"></div>
            </div>
          </div>

          <!-- Internal Startups List Skeletons -->
          <div class="mt-6 flex flex-col gap-2.5">
            <div 
              v-for="j in 2" 
              :key="j"
              class="flex items-center justify-between gap-4 p-3 md:p-3.5 rounded-2xl bg-white/[0.02] border border-white/5"
            >
              <div class="flex items-center gap-3.5 min-w-0">
                <!-- Startup Logo -->
                <div class="w-10 h-10 rounded-xl bg-white/10 shrink-0"></div>
                <!-- Startup Info -->
                <div class="min-w-0 space-y-1.5">
                  <div class="h-4 w-28 md:w-36 rounded bg-white/15"></div>
                  <div class="h-3 w-20 rounded bg-white/5"></div>
                </div>
              </div>

              <!-- Startup Revenue -->
              <div class="flex flex-col items-end shrink-0 space-y-1">
                <div class="h-3.5 w-16 rounded bg-white/15"></div>
                <div class="h-2.5 w-12 rounded bg-white/5"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-else-if="leaderboard && leaderboard.length" class="flex flex-col gap-6 relative z-10">
        <div 
          v-for="(item, index) in leaderboard" 
          :key="item.id"
          class="rounded-3xl border border-white/10 bg-surface-elevated hover:border-white/20 transition-all duration-300 p-6 md:p-8 relative overflow-hidden group shadow-lg"
        >
          <!-- Top Country Header -->
          <div class="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/5">
            <div class="flex items-center gap-4 md:gap-5 min-w-0">
              <div class="w-8 h-8 md:w-9 md:h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center font-sans font-medium text-xs text-neutral-400 shrink-0">
                #{{ index + 1 }}
              </div>
              
              <!-- Prominent Taller Corner Flag -->
              <div class="w-20 h-16 md:w-24 md:h-20 rounded-2xl bg-white/5 border border-white/15 flex items-center justify-center overflow-hidden shrink-0 shadow-lg relative group-hover:scale-105 transition-transform duration-300">
                <img 
                  v-if="item.flagUrl" 
                  :src="item.flagUrl" 
                  :alt="item.name" 
                  class="w-full h-full object-cover"
                  :loading="index < 6 ? 'eager' : 'lazy'"
                  :fetchpriority="index < 3 ? 'high' : 'auto'"
                  decoding="async"
                  @error="item.flagUrl = null"
                />
                <span v-else class="font-serif font-bold text-base text-neutral-300">{{ item.name.slice(0, 2).toUpperCase() }}</span>
              </div>

              <div class="min-w-0">
                <NuxtLink :to="localePath('/saas/pais/' + item.slug)" class="group/title inline-flex items-center gap-2">
                  <h2 class="font-serif text-2xl md:text-3xl font-normal text-white group-hover/title:text-[#00D4FF] transition-colors truncate">
                    {{ item.name }}
                  </h2>
                </NuxtLink>
                <div class="text-xs font-sans text-neutral-400 font-extralight tracking-wide mt-0.5">
                  {{ item.startupsCount }} {{ item.startupsCount === 1 ? t.country_leaderboard.startup_single : t.country_leaderboard.startup_plural }}
                </div>
              </div>
            </div>

            <div class="flex flex-col md:items-end shrink-0">
              <span class="text-[10px] font-sans font-extralight tracking-widest text-neutral-400 uppercase mb-1">
                {{ t.country_leaderboard.total_billed }}
              </span>
              <span class="font-serif text-2xl md:text-3xl font-normal text-white tracking-tight">
                {{ item.totalRevenueFormatted || formatCurrency(item.totalRevenue) }}
              </span>
            </div>
          </div>

          <!-- Internal Startups List (Fully Clickable Cards) -->
          <div v-if="item.startups && item.startups.length" class="mt-6 flex flex-col gap-2.5">
            <NuxtLink 
              v-for="startup in item.startups" 
              :key="startup.id"
              :to="localePath('/saas/' + startup.slug)"
              class="flex items-center justify-between gap-4 p-3 md:p-3.5 rounded-2xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/5 hover:border-white/15 transition-all duration-300 group/startup cursor-pointer"
              @mouseenter="preloadLogo(startup.logoUrl)"
            >
              <div class="flex items-center gap-3.5 min-w-0">
                <SaasLogo 
                  :src="!startup.isIncognito ? startup.logoUrl : null" 
                  :alt="startup.name" 
                  :initial="startup.name ? startup.name.slice(0, 1).toUpperCase() : '?'"
                  size="md"
                  rounded="xl"
                  :website-url="startup.websiteUrl"
                  class="shrink-0 group-hover/startup:scale-105 transition-transform duration-300"
                />
                <div class="min-w-0">
                  <div class="font-sans text-sm md:text-base font-medium text-neutral-200 group-hover/startup:text-[#00D4FF] transition-colors truncate">
                    {{ startup.isIncognito ? t.gem_card.incognito : startup.name }}
                  </div>
                  <div v-if="startup.founderName" class="text-xs font-sans text-neutral-400 font-extralight truncate mt-0.5">
                    {{ startup.founderName }}
                  </div>
                  <div v-else-if="startup.category" class="text-xs font-sans text-neutral-500 font-extralight truncate mt-0.5">
                    {{ startup.category }}
                  </div>
                </div>
              </div>

              <div class="flex items-center gap-4 shrink-0">
                <div class="text-right min-w-[75px]">
                  <span class="font-mono text-xs md:text-sm font-medium text-white">
                    <template v-if="startup.revenue && startup.revenue !== '—'">
                      {{ startup.revenue }}
                    </template>
                    <IncognitoIcon v-else-if="startup.isIncognito" class="w-4 h-4 text-neutral-500 inline" />
                    <span v-else class="text-neutral-400 font-sans text-xs md:text-sm">—</span>
                  </span>
                  <span class="text-[10px] block text-neutral-500 font-sans tracking-wider uppercase mt-0.5">{{ t.country_leaderboard.revenue }}</span>
                </div>
              </div>
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>
