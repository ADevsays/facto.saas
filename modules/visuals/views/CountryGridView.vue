<script setup lang="ts">
import type { CountryLeaderboardItem } from '~/modules/ranking/types'
import SaasBreadcrumb from '../components/SaasBreadcrumb.vue'
import CountryStartupList from '../components/CountryStartupList.vue'
import InputMrrView from '../../input-mrr/views/InputMrrView.vue'

import es from '../locales/es.json'
import en from '../locales/en.json'

const { t } = useLanguage({ es, en })
const localePath = useLocalePath()
const { data: leaderboard, pending } = await useLazyFetch<CountryLeaderboardItem[]>('/api/countries/leaderboard')

useAppSeo({
  title: () => t.value?.country_leaderboard?.seo_title || 'Ranking Mundialista de SaaS | Facto',
  description: () => t.value?.country_leaderboard?.seo_description || 'Descubre el ranking mundialista de facturación e ingresos por país en Facto.'
})

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(value)
}

function flagUrl(country: CountryLeaderboardItem) {
  return country.isoCode ? `https://flagcdn.com/w160/${country.isoCode}.png` : null
}
</script>

<template>
  <main class="min-h-screen bg-[#030305] text-white relative isolate pt-14 pb-20 px-6 flex flex-col items-center">
    <div class="absolute inset-0 z-[-1] pointer-events-none flex justify-center items-start pt-20 overflow-hidden">
      <div class="w-[80vw] h-[40vw] max-w-[800px] max-h-[400px] bg-[#00D4FF]/5 rounded-full blur-[120px] opacity-40" />
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
        <div class="mt-8 w-full">
          <InputMrrView full-width />
        </div>
      </div>

      <div v-if="pending" class="flex flex-col gap-6 relative z-10 w-full">
        <div v-for="i in 3" :key="i" class="rounded-3xl border border-white/10 bg-surface-elevated p-6 md:p-8 animate-pulse">
          <div class="flex items-center justify-between gap-6">
            <div class="flex items-center gap-4">
              <div class="w-9 h-9 rounded-full bg-white/10" />
              <div class="w-20 h-16 rounded-2xl bg-white/10" />
              <div class="h-7 w-40 rounded-lg bg-white/15" />
            </div>
            <div class="h-7 w-28 rounded-lg bg-white/15" />
          </div>
        </div>
      </div>

      <div v-else-if="leaderboard?.length" class="flex flex-col gap-6 relative z-10">
        <section
          v-for="(country, index) in leaderboard"
          :key="country.slug"
          class="rounded-3xl border border-white/10 bg-surface-elevated hover:border-white/20 transition-all duration-300 p-6 md:p-8 relative overflow-hidden group shadow-lg"
        >
          <div class="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/5">
            <div class="flex items-center gap-4 md:gap-5 min-w-0">
              <div class="w-8 h-8 md:w-9 md:h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center font-sans font-medium text-xs text-neutral-400 shrink-0">
                #{{ index + 1 }}
              </div>

              <div class="w-20 h-16 md:w-24 md:h-20 rounded-2xl bg-white/5 border border-white/15 flex items-center justify-center overflow-hidden shrink-0 shadow-lg relative group-hover:scale-105 transition-transform duration-300">
                <img
                  v-if="flagUrl(country)"
                  :src="flagUrl(country) || undefined"
                  :alt="country.name"
                  class="w-full h-full object-cover"
                  :loading="index < 3 ? 'eager' : 'lazy'"
                  :fetchpriority="index < 3 ? 'high' : 'auto'"
                  decoding="async"
                >
                <span v-else class="font-serif font-bold text-base text-neutral-300">{{ country.flag || country.name.slice(0, 2).toUpperCase() }}</span>
              </div>

              <div class="min-w-0">
                <NuxtLink :to="localePath('/saas/pais/' + country.slug)" class="group/title inline-flex items-center gap-2">
                  <h2 class="font-serif text-2xl md:text-3xl font-normal text-white group-hover/title:text-[#00D4FF] transition-colors truncate">
                    {{ country.name }}
                  </h2>
                </NuxtLink>
                <div class="text-xs font-sans text-neutral-400 font-extralight tracking-wide mt-0.5">
                  {{ country.startupsCount }} {{ country.startupsCount === 1 ? t.country_leaderboard.startup_single : t.country_leaderboard.startup_plural }}
                </div>
              </div>
            </div>

            <div class="flex flex-col md:items-end shrink-0">
              <span class="text-[10px] font-sans font-extralight tracking-widest text-neutral-400 uppercase mb-1">
                {{ t.country_leaderboard.total_billed }}
              </span>
              <span class="font-serif text-2xl md:text-3xl font-normal text-white tracking-tight">
                {{ formatCurrency(country.totalRevenue) }}
              </span>
            </div>
          </div>

          <CountryStartupList :country="country.slug" />
        </section>
      </div>
    </div>
  </main>
</template>
