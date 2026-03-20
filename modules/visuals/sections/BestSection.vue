<script setup lang="ts">
import SaasCard from '../components/SaasCard.vue'

const items = [
  { name: 'Stripe',  category: 'Payments',       mrr: '$4.5M', revenue: '$54M',  multiplier: '8.2x', rank: 1 },
  { name: 'GitHub',  category: 'Dev Tools',       mrr: '$9.2M', revenue: '$110M', multiplier: '7.5x', rank: 2 },
  { name: 'Figma',   category: 'Design',          mrr: '$1.2M', revenue: '$14.4M',multiplier: '6.8x', rank: 3 },
  { name: 'Vercel',  category: 'Infrastructure',  mrr: '$890K', revenue: '$10.7M',multiplier: '5.9x', rank: 4 },
  { name: 'Notion',  category: 'Productivity',    mrr: '$180K', revenue: '$2.2M', multiplier: '4.7x', rank: 5 },
  { name: 'Loom',    category: 'Video',           mrr: '$310K', revenue: '$3.7M', multiplier: '5.1x', rank: 6 },
]
</script>

<template>
  <section class="w-full py-8">
    <p class="text-[10px] font-sans font-extralight tracking-[0.15em] text-neutral-300 mb-4 uppercase">Best SaaS</p>
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
