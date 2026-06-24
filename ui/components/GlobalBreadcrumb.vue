<script setup lang="ts">
export interface BreadcrumbItem {
  label: string
  to?: string
}

defineProps<{
  items: BreadcrumbItem[]
}>()
</script>

<template>
  <nav class="w-full flex flex-wrap items-center gap-2 text-xs md:text-sm font-sans tracking-widest uppercase z-10 animate-fade-in relative">
    <NuxtLink to="/" class="text-neutral-500 hover:text-white transition-colors duration-300 flex items-center gap-1.5 font-semibold shrink-0">
      <img src="/favicon.svg" alt="Facto" class="w-3.5 h-3.5 opacity-60" />
      facto
    </NuxtLink>
    
    <template v-for="(item, index) in items" :key="index">
      <span class="text-neutral-700 font-sans shrink-0">&gt;</span>
      <NuxtLink v-if="item.to" :to="item.to" class="text-neutral-500 hover:text-white transition-colors duration-300 shrink-0">{{ item.label }}</NuxtLink>
      <span v-else class="text-white shrink-0">{{ item.label }}</span>
    </template>
  </nav>
</template>
