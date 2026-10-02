<script setup lang="ts">
import { useLanguage } from '~/composables/useLanguage'
import es from '../locales/es.json'
import en from '../locales/en.json'

const { t } = useLanguage({ es, en })

defineEmits<{
  (e: 'buy'): void
}>()
</script>

<template>
  <div class="p-10 md:p-14 rounded-3xl bg-surface-elevated border border-white/10 text-center flex flex-col items-center justify-center gap-5">
    <div class="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[#00D4FF] shadow-[0_0_25px_rgba(0,212,255,0.12)]">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="20" height="14" x="2" y="3" rx="2"/><line x1="8" x2="16" y1="21" y2="21"/><line x1="12" x2="12" y1="17" y2="21"/></svg>
    </div>

    <div class="space-y-1.5 max-w-md">
      <h3 class="font-serif text-xl md:text-2xl text-white font-medium tracking-tight">
        {{ t.ads?.empty_title }}
      </h3>
      <p class="font-sans text-xs md:text-sm text-neutral-400 font-extralight tracking-[0.08em] leading-relaxed">
        {{ t.ads?.empty_desc }}
      </p>
    </div>

    <button
      @click="$emit('buy')"
      class="group relative inline-flex items-center gap-2 bg-white text-black font-bold uppercase tracking-widest text-xs rounded-full px-6 py-3 transition-all duration-700 hover:scale-[1.03] cursor-pointer shadow-[0_0_15px_rgba(255,255,255,0.35)] hover:shadow-[0_0_25px_rgba(0,212,255,0.3)] mt-1"
    >
      <span>{{ t.ads?.empty_btn }}</span>
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="transition-transform duration-500 group-hover:translate-x-1">
        <path d="M5 12h14"></path>
        <path d="m12 5 7 7-7 7"></path>
      </svg>
    </button>
  </div>
</template>
