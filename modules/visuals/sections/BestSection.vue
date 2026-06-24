<script setup lang="ts">
import { onMounted } from 'vue'
import SaasCard from '../components/SaasCard.vue'
import SaasCardSkeleton from '../components/SaasCardSkeleton.vue'
import { useSaasList } from '~/composables/useSaasList'
import { formatMrrValue, formatRevenueValue } from '~/utils/format'

const { bestItems, loading, fetchAll } = useSaasList()

onMounted(fetchAll)
</script>

<template>
  <section class="w-full ">
     <div class="flex items-center justify-between mb-4">
      <p class="text-[10px] font-sans font-extralight tracking-[0.15em] text-neutral-300 uppercase">Mejores SaaS</p>
      <NuxtLink to="/saas?s=mrr" class="group text-neutral-300 hover:text-white transition-colors">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" class="transition-transform duration-300 group-hover:translate-x-0.5">
           <path d="M2 6h8M6 2l4 4-4 4" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </NuxtLink>
    </div>
    <div class="flex gap-4 overflow-x-auto no-scrollbar pb-4">
      <template v-if="loading">
        <SaasCardSkeleton v-for="n in 6" :key="'best-sk-' + n" />
      </template>
      <template v-else>
        <SaasCard
          v-for="(item, index) in bestItems"
          :key="item.id"
          :name="item.name || '— Anónimo —'"
          :category="item.category"
          :categorySlug="item.categorySlug"
          :index="index"
          :mrr="formatMrrValue(item.mrr)"
          :revenue="formatRevenueValue(item.mrr)"
          :logoUrl="item.logoUrl"
          :isIncognito="item.isIncognito"
        />
      </template>
      <NuxtLink to="/saas?s=mrr" class="group shrink-0 w-28 rounded-xl border border-white/5 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all duration-300 hover:border-white/15 text-neutral-600 hover:text-neutral-300">
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
