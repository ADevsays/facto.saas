<script setup lang="ts">
import { ROUTES } from '~/utils/routes'
import es from '../locales/es.json'
import en from '../locales/en.json'

const { t } = useLanguage({ es, en })
const localePath = useLocalePath()

defineProps<{
  name?: string | null
  isCategory?: boolean
  isCountry?: boolean
}>()
</script>

<template>
  <nav class="w-full max-w-5xl mx-auto flex flex-wrap items-center gap-2 text-xs md:text-sm font-sans tracking-widest uppercase mb-10 z-10 animate-fade-in">
    <NuxtLink :to="localePath('/')" class="text-neutral-500 hover:text-white transition-colors duration-300 flex items-center gap-1.5 font-semibold shrink-0">
      <img src="/favicon.svg" alt="Facto" class="w-3.5 h-3.5 opacity-60" />
      facto
    </NuxtLink>
    
    <span class="text-neutral-700 font-sans shrink-0">&gt;</span>
    
    <NuxtLink v-if="name || isCategory || isCountry" :to="localePath('/saas')" class="text-neutral-500 hover:text-white transition-colors duration-300 shrink-0">saas</NuxtLink>
    <span v-else class="text-white shrink-0">saas</span>

    <template v-if="isCategory">
      <span class="text-neutral-700 font-sans shrink-0">&gt;</span>
      <NuxtLink v-if="name" :to="localePath(ROUTES.CATEGORY)" class="text-neutral-500 hover:text-white transition-colors duration-300 shrink-0">{{ t.gem_card.category_fallback }}</NuxtLink>
      <span v-else class="text-white shrink-0">{{ t.gem_card.category_fallback }}</span>
    </template>
    
    <template v-if="isCountry">
      <span class="text-neutral-700 font-sans shrink-0">&gt;</span>
      <NuxtLink v-if="name" :to="localePath('/saas/pais')" class="text-neutral-500 hover:text-white transition-colors duration-300 shrink-0">{{ t.country_cards_section.title }}</NuxtLink>
      <span v-else class="text-white shrink-0">{{ t.country_cards_section.title }}</span>
    </template>

    <template v-if="name">
      <span class="text-neutral-700 font-sans shrink-0">&gt;</span>
      <span class="text-white shrink-0">{{ name }}</span>
    </template>
  </nav>
</template>
