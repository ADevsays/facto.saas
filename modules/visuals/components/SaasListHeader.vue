<script setup lang="ts">
import { useListHeaderFilters } from '../composables/useListHeaderFilters'
import { useCountries } from '~/composables/useCountries'
import SaasCategoryDropdown from './SaasCategoryDropdown.vue'
import SaasCountryDropdown from './SaasCountryDropdown.vue'
import SaasSortDropdown from './SaasSortDropdown.vue'

const {
  category,
  country,
  sort,
  isSortOpen,
  isCategoryOpen,
  isCountryOpen,
  sortOptions,
  categoryOptions,
  currentSortLabel,
  currentCategoryLabel,
  toggleSort,
  toggleCategory,
  toggleCountry,
  closeDropdowns,
  selectSort,
  selectCategoryOption,
  selectCountryOption
} = useListHeaderFilters()

const { countries } = useCountries()
</script>

<template>
  <div>
    <!-- Backdrop overlay to close dropdowns -->
    <div v-if="isSortOpen || isCategoryOpen || isCountryOpen" class="fixed inset-0 z-20" @click="closeDropdowns" />

    <div class="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-white/5 pb-8 relative z-30">
      <div class="flex-1">
        <h1 class="font-serif text-4xl md:text-[40px] lg:text-[44px] xl:text-5xl font-normal leading-tight tracking-tight text-white md:whitespace-nowrap">
          Explora las Startups
        </h1>
        <p class="font-sans font-extralight text-sm text-neutral-400 mt-6 max-w-md">
          El ranking global de startups ordenado por ingresos <br class="hidden sm:block" /> y validado en tiempo real.
        </p>
      </div>

      <!-- Filters and Sorting Dropdowns -->
      <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0 relative z-30">
        
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

        <SaasCountryDropdown 
          :is-open="isCountryOpen"
          :active-value="country"
          :countries="countries"
          @toggle="toggleCountry"
          @select="selectCountryOption"
        />
      </div>
    </div>
  </div>
</template>
