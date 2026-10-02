<script setup lang="ts">
import { computed } from 'vue'
import { TOOLS_LIST as TOOLS_LIST_ES } from '~/modules/tools/const/toolsList.es'
import { TOOLS_LIST as TOOLS_LIST_EN } from '~/modules/tools/const/toolsList.en'

import es from '../locales/es.json'
import en from '../locales/en.json'

const { t, language } = useLanguage({ es, en })
const toolsList = computed(() => language.value === 'es' ? TOOLS_LIST_ES : TOOLS_LIST_EN)

const localePath = useLocalePath()
</script>

<template>
  <section class="w-full py-16">
    <NuxtLink 
      :to="localePath('/herramientas')"
      class="block mb-6 shrink-0 text-xs font-sans font-extralight tracking-[0.15em] text-neutral-500 hover:text-neutral-300 transition-all duration-300 uppercase"
    >
      {{ t.tools_teaser_section.title }}
    </NuxtLink>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 w-full">
      <NuxtLink
        v-for="(tool, i) in toolsList"
        :key="tool.id"
        :to="localePath(tool.link)"
        class="group flex items-center justify-between gap-4 bg-[#0A0A0C] border border-white/[0.04] hover:border-white/[0.1] rounded-2xl p-4 transition-all duration-300 hover:bg-white/[0.02] cursor-pointer"
      >
        <div class="flex items-center gap-4 min-w-0 flex-1">
          <!-- Icon Pill -->
          <div 
            class="w-12 h-12 shrink-0 rounded-xl flex items-center justify-center transition-transform duration-500 group-hover:scale-105"
            :class="{
              'bg-[#00D4FF]/10 text-[#00D4FF] shadow-[inset_0_0_15px_rgba(0,212,255,0.15)]': i % 6 === 0,
              'bg-[#A855F7]/10 text-[#A855F7] shadow-[inset_0_0_15px_rgba(168,85,247,0.15)]': i % 6 === 1,
              'bg-[#F59E0B]/10 text-[#F59E0B] shadow-[inset_0_0_15px_rgba(245,158,11,0.15)]': i % 6 === 2,
              'bg-[#10B981]/10 text-[#10B981] shadow-[inset_0_0_15px_rgba(16,185,129,0.15)]': i % 6 === 3,
              'bg-[#EC4899]/10 text-[#EC4899] shadow-[inset_0_0_15px_rgba(236,72,153,0.15)]': i % 6 === 4,
              'bg-[#EF4444]/10 text-[#EF4444] shadow-[inset_0_0_15px_rgba(239,68,68,0.15)]': i % 6 === 5,
            }"
          >
            <svg v-if="tool.id === 'youtube-downloader'" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
            </svg>
            <svg v-else-if="tool.id === 'saas-calculator'" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            <svg v-else class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          
          <!-- Content -->
          <div class="min-w-0 flex-1">
            <h3 class="font-sans text-[14px] font-semibold text-white/90 truncate group-hover:text-white transition-colors">{{ tool.title }}</h3>
            <p class="font-sans text-[12px] font-light text-white/40 truncate group-hover:text-white/60 transition-colors mt-0.5">{{ tool.description }}</p>
          </div>
        </div>

        <!-- Arrow -->
        <div class="shrink-0 text-white/20 group-hover:text-white/60 transition-colors group-hover:translate-x-1 duration-300 pr-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </div>
      </NuxtLink>
    </div>
  </section>
</template>
