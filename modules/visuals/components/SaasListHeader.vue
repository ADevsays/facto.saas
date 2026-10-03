<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useListHeaderFilters } from '../composables/useListHeaderFilters'
import { useCountries } from '~/composables/useCountries'
import SaasCategoryDropdown from './SaasCategoryDropdown.vue'
import SaasCountryDropdown from './SaasCountryDropdown.vue'
import SaasSortDropdown from './SaasSortDropdown.vue'

import es from '../locales/es.json'
import en from '../locales/en.json'

const { t } = useLanguage({ es, en })
const { locale } = useI18n()
const { getActiveMeta } = useSaasViewMeta()

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
const { isOnContinentRoute, continentSlug, continent } = useCountryFilter()

const displayedCountries = computed(() => {
  let list = countries.value
  if (isOnContinentRoute.value && continent.value) {
    const allowed = new Set(continent.value.countrySlugs)
    list = list.filter(c => allowed.has(c.slug) || c.slug === 'global')
  }
  return [...list].sort((a, b) => {
    if (a.slug === 'global') return -1
    if (b.slug === 'global') return 1

    const aCount = a.startupsCount || 0
    const bCount = b.startupsCount || 0

    if (aCount > 0 && bCount === 0) return -1
    if (aCount === 0 && bCount > 0) return 1

    if (aCount > 0 && bCount > 0 && bCount !== aCount) {
      return bCount - aCount
    }

    return a.name.localeCompare(b.name)
  })
})

const currentCountryName = computed(() => {
  if (!country.value || country.value === 'all') return null
  if (country.value === 'global') return 'Global'
  const c = countries.value.find(c => c.slug === country.value)
  return c ? c.name : country.value
})

const activeMeta = computed(() => {
  return getActiveMeta({
    categorySlug: category.value,
    categoryName: currentCategoryLabel.value !== t.value.filters.all_categories && currentCategoryLabel.value !== t.value.filters.categories_fallback ? currentCategoryLabel.value : null,
    countrySlug: country.value,
    countryName: currentCountryName.value,
    continentSlug: isOnContinentRoute.value ? continentSlug.value : null,
    locale: locale.value
  })
})

const isScrolled = ref(false)
let ticking = false

const handleScroll = () => {
  if (!ticking) {
    window.requestAnimationFrame(() => {
      const y = window.scrollY
      // Histeresis: activa al pasar 70px, desactiva solo al subir de 20px
      if (!isScrolled.value && y > 70) {
        isScrolled.value = true
      } else if (isScrolled.value && y < 20) {
        isScrolled.value = false
      }
      ticking = false
    })
    ticking = true
  }
}

const handleOutsideClick = (event: MouseEvent) => {
  if (isSortOpen.value || isCategoryOpen.value || isCountryOpen.value) {
    const target = event.target as HTMLElement
    const filtersEl = document.getElementById('saas-filters-container')
    if (filtersEl && filtersEl.contains(target)) return
    closeDropdowns()
  }
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true })
  handleScroll()
  document.addEventListener('click', handleOutsideClick, { capture: true })
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  document.removeEventListener('click', handleOutsideClick, { capture: true })
})
</script>

<template>
  <div 
    class="sticky top-0 z-30 -mx-6 px-6 pt-3 pb-5 bg-[#030305]/90 backdrop-blur-md border-b transition-colors duration-200"
    :class="isScrolled ? 'border-white/10 shadow-lg shadow-black/40' : 'border-transparent'"
  >
    <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-40">
      <!-- Title -->
      <h1 class="font-serif text-3xl sm:text-4xl lg:text-[38px] xl:text-[42px] font-normal leading-tight tracking-tight text-white min-w-0 flex-1 break-words whitespace-normal">
        {{ activeMeta.titleStart }} <span class="facto-effect">{{ activeMeta.titleHighlight }}</span>
      </h1>

      <!-- Filters and Sorting Dropdowns -->
      <div id="saas-filters-container" class="flex flex-wrap sm:flex-nowrap items-center gap-3 shrink-0 relative z-40 mt-3">
        <SaasCategoryDropdown 
          :is-open="isCategoryOpen"
          :current-label="currentCategoryLabel"
          :options="categoryOptions"
          :active-value="category"
          class="order-1 flex-1 sm:flex-initial sm:order-1"
          @toggle="toggleCategory"
          @select="selectCategoryOption"
        />

        <SaasCountryDropdown 
          :is-open="isCountryOpen"
          :active-value="country"
          :countries="displayedCountries"
          class="order-2 shrink-0 sm:order-3"
          @toggle="toggleCountry"
          @select="selectCountryOption"
        />

        <SaasSortDropdown 
          :is-open="isSortOpen"
          :current-label="currentSortLabel"
          :options="sortOptions"
          :active-value="sort"
          class="order-3 w-full sm:w-auto sm:order-2"
          @toggle="toggleSort"
          @select="selectSort"
        />
      </div>
    </div>

    <!-- Description (Collapses smoothly with hysteresis) -->
    <div 
      class="relative z-10 transition-all duration-300 ease-out origin-top overflow-hidden" 
      :class="isScrolled ? 'max-h-0 opacity-0 mt-0 pointer-events-none' : 'max-h-24 opacity-100 mt-3'"
    >
      <p class="font-sans font-extralight text-sm text-neutral-400 max-w-lg leading-relaxed">
        {{ activeMeta.description }}
      </p>
    </div>
  </div>
</template>

<style scoped>
.facto-effect {
  background: linear-gradient(120deg, rgba(255,255,255,0) 30%, rgba(255,255,255,0.8) 50%, rgba(255,255,255,0) 70%);
  background-size: 200% auto;
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: rgba(0, 212, 255, 0.3);
  filter: drop-shadow(0 0 15px rgba(0, 212, 255, 0.4));
  animation: shine 12s ease-in-out infinite;
  display: inline-block;
}

@keyframes shine {
  0%   { background-position: -100% 0; }
  100% { background-position: 100% 0; }
}
</style>
