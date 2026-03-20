<script setup lang="ts">
import SaasCard from '../components/SaasCard.vue'

const items = [
  { name: 'Linear', category: 'Project Mgmt', mrr: '$92K',  revenue: '$1.1M', multiplier: '4.2x' },
  { name: 'Loom', category: 'Video', mrr: '$310K',           revenue: '$3.7M', multiplier: '5.1x' },
  { name: 'Cron', category: 'Calendar', mrr: '$45K',         revenue: '$540K', multiplier: '3.8x' },
  { name: 'Raycast', category: 'Productivity', mrr: '$67K',  revenue: '$804K', multiplier: '4.5x' },
  { name: 'Hashnode', category: 'Blogging', mrr: '$28K',     revenue: '$336K', multiplier: '3.2x' },
  { name: 'Screen Studio', category: 'Video', mrr: '$51K',   revenue: '$612K', multiplier: '4.0x' },
]
</script>

<template>
  <section class="w-full py-2">
    <p class="text-[10px] font-sans font-extralight tracking-[0.15em] text-neutral-300 mb-4 uppercase">Recently added</p>
    <div class="flex gap-4 overflow-x-auto no-scrollbar pb-4">
      <SaasCard
        v-for="item in items"
        :key="item.name"
        v-bind="item"
      />
      <NuxtLink to="/saas" class="group shrink-0 w-28 rounded-xl border border-white/5 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all duration-300 hover:border-white/15 text-neutral-600 hover:text-neutral-300">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" class="transition-transform duration-300 group-hover:translate-x-0.5">
          <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span class="text-[10px] font-sans font-extralight tracking-[0.1em] uppercase text-center leading-tight">Ver todos</span>
      </NuxtLink>
    </div>
  </section>
</template>

<style scoped>
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
</style>
