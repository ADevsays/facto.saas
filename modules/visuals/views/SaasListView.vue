<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useSaasList } from '~/composables/useSaasList'
import { useCategoryFilter } from '~/composables/useCategoryFilter'
import { useSortFilter } from '~/composables/useSortFilter'
import { useCategories } from '~/composables/useCategories'
import { useReveal } from '../composables/useReveal'
import SaasGemCard from '../components/SaasGemCard.vue'
import SaasBreadcrumb from '../components/SaasBreadcrumb.vue'
import SaasListHeader from '../components/SaasListHeader.vue'
import InputMrrView from '../../input-mrr/views/InputMrrView.vue'

const { items, loading, error, fetchAll } = useSaasList()
const { category, filterByCategory } = useCategoryFilter()
const { sort, sortItems } = useSortFilter()
const { categories, fetchCategories } = useCategories()

const currentCategoryName = computed(() => {
  if (!category.value || category.value === 'all') return null
  const cat = categories.value.find(c => c.slug === category.value)
  return cat ? cat.name : category.value
})

const filteredAndSortedItems = computed(() => {
  const filtered = filterByCategory(items.value)
  return sortItems(filtered)
})

const { containerRef, initObserver } = useReveal([category, sort])

onMounted(async () => {
  await Promise.all([
    fetchAll(),
    fetchCategories()
  ])
  initObserver()
})
</script>

<template>
  <main ref="containerRef" class="min-h-screen bg-[#030305] text-white overflow-x-clip relative isolate flex flex-col items-center pt-14 pb-20 px-6">
    <!-- Background glow -->
    <div class="absolute inset-0 z-[-1] pointer-events-none flex items-center justify-center">
      <div class="w-[80vw] h-[80vw] max-w-[800px] max-h-[800px] bg-[#00D4FF]/5 rounded-full blur-[120px] opacity-40"></div>
    </div>

    <div class="w-full max-w-5xl">
      <!-- Breadcrumb Link Back -->
      <SaasBreadcrumb :name="currentCategoryName" :is-category="!!currentCategoryName" />
    </div>

    <div class="w-full max-w-5xl flex flex-col gap-10">
      <!-- Header & Filtering/Sorting Area -->
      <SaasListHeader />

      <!-- Loading State -->
      <div v-if="loading" class="flex flex-col items-center justify-center py-20">
        <div class="w-8 h-8 border-2 border-white/10 border-t-[#00D4FF] rounded-full animate-spin"></div>
        <span class="text-xs font-sans tracking-widest text-neutral-500 uppercase mt-4 animate-pulse">Cargando startups...</span>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="text-center py-16">
        <p class="text-red-400 font-sans text-sm font-light bg-red-400/10 border border-red-500/20 rounded-xl p-4 inline-block">
          {{ error }}
        </p>
      </div>

      <!-- List Empty State -->
      <div v-else-if="filteredAndSortedItems.length === 0" class="text-center py-20 border border-dashed border-white/5 rounded-2xl animate-fade-in">
        <p class="text-neutral-500 font-sans text-sm font-light uppercase tracking-widest">No hay startups registradas</p>
      </div>

      <!-- Grid of Cards -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 relative z-10">
        <SaasGemCard 
          v-for="(saas, index) in filteredAndSortedItems" 
          :key="saas.id" 
          :saas="saas"
          :index="index"
          class="reveal-card"
          :class="{ 'is-visible': index < 3 }"
        />
      </div>

      <!-- Add MRR Component -->
      <div class="mt-8 relative z-10">
        <InputMrrView />
      </div>
    </div>
  </main>
</template>

<style scoped>
.reveal-card {
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1), transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
  will-change: transform, opacity;
}
.reveal-card.is-visible {
  opacity: 1;
  transform: translateY(0);
}
.animate-fade-in {
  animation: fadeIn 0.2s ease-out;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-5px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
