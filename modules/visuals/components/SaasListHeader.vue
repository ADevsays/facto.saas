<script setup lang="ts">
import { useListHeaderFilters } from '../composables/useListHeaderFilters'
import SaasCategoryDropdown from './SaasCategoryDropdown.vue'
import SaasSortDropdown from './SaasSortDropdown.vue'

const {
  category,
  sort,
  isSortOpen,
  isCategoryOpen,
  sortOptions,
  categoryOptions,
  currentSortLabel,
  currentCategoryLabel,
  toggleSort,
  toggleCategory,
  closeDropdowns,
  selectSort,
  selectCategoryOption
} = useListHeaderFilters()
</script>

<template>
  <div>
    <!-- Backdrop overlay to close dropdowns -->
    <div v-if="isSortOpen || isCategoryOpen" class="fixed inset-0 z-20" @click="closeDropdowns" />

    <div class="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-8 relative z-30">
      <div>
        <h1 class="font-serif text-4xl md:text-5xl font-normal leading-tight tracking-tight text-white">
          Explora las Startups
        </h1>
        <p class="font-sans font-extralight text-sm  text-neutral-400 mt-6">
          El ranking global de startups ordenado por ingresos y validado en tiempo real.
        </p>
      </div>

      <!-- Filters and Sorting Dropdowns -->
      <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 shrink-0 relative z-30">
        <SaasCategoryDropdown 
          :is-open="isCategoryOpen"
          :current-label="currentCategoryLabel"
          :options="categoryOptions"
          :active-value="category"
          @toggle="toggleCategory"
          @select="selectCategoryOption"
        />

        <SaasSortDropdown 
          :is-open="isSortOpen"
          :current-label="currentSortLabel"
          :options="sortOptions"
          :active-value="sort"
          @toggle="toggleSort"
          @select="selectSort"
        />
      </div>
    </div>
  </div>
</template>
