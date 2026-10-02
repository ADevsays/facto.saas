<script setup lang="ts">
import type { StatCountryPoint } from '../../types'
import es from '../../locales/es.json'
import en from '../../locales/en.json'

const { t } = useLanguage({ es, en })
const localePath = useLocalePath()

defineProps<{
  byCountry: StatCountryPoint[]
}>()
</script>

<template>
  <div class="lg:col-span-3 p-6 sm:p-7 rounded-3xl border border-white/10 bg-surface-elevated hover:bg-surface-elevated-hover hover:border-white/20 transition-all duration-300 flex flex-col gap-4">
    <div class="flex items-center justify-between border-b border-white/5 pb-3">
      <div class="flex items-center gap-2">
        <svg class="w-3.5 h-3.5 text-neutral-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
          <path d="M2 12h20"/>
        </svg>
        <span class="text-[10px] font-sans font-extralight tracking-widest text-neutral-400 uppercase">
          {{ t?.bento?.countries_title }}
        </span>
      </div>
      <span class="text-xs text-neutral-500 font-sans font-extralight">{{ byCountry.length }} países</span>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-2.5">
      <div
        v-for="country in byCountry.slice(0, 9)"
        :key="country.slug"
        class="flex items-center justify-between py-1.5 border-b border-white/5 last:border-0"
      >
        <div class="flex items-center gap-2.5 min-w-0">
          <span class="text-base">{{ country.flag }}</span>
          <NuxtLink :to="localePath(`/saas/pais/${country.slug}`)" class="text-xs text-neutral-300 hover:text-[#00D4FF] font-sans truncate transition-colors">
            {{ country.name }}
          </NuxtLink>
        </div>
        <div class="flex items-center gap-3 shrink-0">
          <span class="text-xs font-sans text-neutral-400 font-medium tabular-nums lining-nums">{{ country.count.toLocaleString('en-US') }} startups</span>
          <span v-if="country.totalMrr > 0" class="text-xs font-sans text-emerald-400 font-bold tabular-nums lining-nums">
            ${{ country.totalMrr.toLocaleString('en-US') }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
