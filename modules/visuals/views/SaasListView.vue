<script setup lang="ts">
import { onMounted, onUnmounted, computed, nextTick, ref, watch } from 'vue'
import type { SaasListItem } from '~/modules/ranking/types'
import { getCategoryDisplayName } from '~/utils/categories'
import { useCategoryFilter } from '~/composables/useCategoryFilter'
import { useCountryFilter } from '~/composables/useCountryFilter'
import { useSortFilter } from '~/composables/useSortFilter'
import { useCategories } from '~/composables/useCategories'
import { useCountries } from '~/composables/useCountries'
import { useReveal } from '../composables/useReveal'
import SaasGemCard from '../components/SaasGemCard.vue'
import SaasGemCardSkeleton from '../components/SaasGemCardSkeleton.vue'
import SaasBreadcrumb from '../components/SaasBreadcrumb.vue'
import SaasListHeader from '../components/SaasListHeader.vue'
import InputMrrView from '../../input-mrr/views/InputMrrView.vue'

import es from '../locales/es.json'
import en from '../locales/en.json'

const { t } = useLanguage({ es, en })


const { category, filterByCategory } = useCategoryFilter()
const { country, filterByCountry, isOnContinentRoute, continent } = useCountryFilter()
const { sort, sortItems } = useSortFilter()
const { categories, fetchCategories } = useCategories()
const { countries, fetchCountries } = useCountries()
const { locale } = useI18n()


const currentCategoryName = computed(() => {
  if (!category.value || category.value === 'all') return null
  const cat = categories.value.find(c => c.slug === category.value)
  return cat ? cat.name : category.value
})

const currentCountryName = computed(() => {
  if (!country.value || country.value === 'all') return null
  if (country.value === 'global') return 'Global'
  const c = countries.value.find(c => c.slug === country.value)
  return c ? c.name : country.value
})

const currentContinentName = computed(() => {
  if (!isOnContinentRoute.value || !continent.value) return null
  return continent.value.name[locale.value === 'en' ? 'en' : 'es'] || continent.value.name.es
})

const PAGE_SIZE = 12
const selectedCategory = computed(() => category.value && category.value !== 'all' ? category.value : undefined)
const selectedCountry = computed(() => country.value && country.value !== 'all' ? country.value : undefined)
const catalogQuery = computed(() => ({
  limit: PAGE_SIZE,
  sort: sort.value,
  category: selectedCategory.value,
  country: selectedCountry.value,
  countries: isOnContinentRoute.value && !selectedCountry.value ? continent.value?.countrySlugs.join(',') : undefined,
}))
const catalogFetchKey = computed(() => {
  const { sort: s, category: cat, country: c, countries: cs, limit } = catalogQuery.value
  return `facto-saas-catalog:${s || 'latest'}:${cat || 'all'}:${c || 'all'}:${cs || 'all'}:${limit}`
})

const { data, pending, error } = useLazyFetch<SaasListItem[]>('/api/ranking/list', {
  key: catalogFetchKey,
  query: catalogQuery,
  watch: [catalogQuery],
  default: () => [],
  getCachedData: (key, nuxtApp) => {
    const cached = nuxtApp.payload.data[key] ?? nuxtApp.static.data[key]
    return Array.isArray(cached) && cached.length === 0 ? undefined : cached
  },
})

const appendedItems = ref<SaasListItem[]>([])
const appendedKey = ref(catalogFetchKey.value)
const hasMoreOverride = ref<boolean | null>(null)
const loadingMore = ref(false)

const baseItems = computed<SaasListItem[]>(() => {
  return data.value ?? []
})

const items = computed<SaasListItem[]>(() => {
  const firstPage = baseItems.value
  const extra = appendedKey.value === catalogFetchKey.value ? appendedItems.value : []
  if (extra.length === 0) return firstPage
  const seen = new Set(firstPage.map(item => item.id))
  return [...firstPage, ...extra.filter(item => !seen.has(item.id))]
})

const hasMore = computed(() => {
  if (hasMoreOverride.value !== null && appendedKey.value === catalogFetchKey.value) {
    return hasMoreOverride.value
  }
  return baseItems.value.length === PAGE_SIZE
})

const loading = computed(() => pending.value && items.value.length === 0)
const errorMessage = computed(() => error.value?.message || null)
const localizedItems = computed(() => items.value.map(item => ({
  ...item,
  category: getCategoryDisplayName(item.categorySlug, item.category, locale.value)
})))
const filteredAndSortedItems = computed(() => sortItems(filterByCountry(filterByCategory(localizedItems.value))))

const { containerRef, initObserver } = useReveal([category, country, sort, items])

watch(catalogFetchKey, (newKey) => {
  appendedKey.value = newKey
  appendedItems.value = []
  hasMoreOverride.value = null
  loadingMore.value = false
})

watch([data, pending], () => {
  if (import.meta.client) {
    nextTick(() => {
      initObserver()
      observeMore()
    })
  }
})

const loadMoreRef = ref<HTMLElement | null>(null)
let observer: IntersectionObserver | null = null

function observeMore() {
  observer?.disconnect()
  if (loadMoreRef.value && hasMore.value) {
    observer?.observe(loadMoreRef.value)
  }
}

async function fetchNext() {
  if (loadingMore.value || pending.value || !hasMore.value) return
  const requestKey = catalogFetchKey.value
  loadingMore.value = true
  try {
    const page = await $fetch<SaasListItem[]>('/api/ranking/list', {
      query: { ...catalogQuery.value, offset: items.value.length }
    })
    if (requestKey !== catalogFetchKey.value) return
    appendedKey.value = requestKey
    appendedItems.value = [...appendedItems.value, ...page]
    hasMoreOverride.value = page.length === PAGE_SIZE
  } catch {
    if (requestKey === catalogFetchKey.value) {
      hasMoreOverride.value = false
    }
  } finally {
    if (requestKey === catalogFetchKey.value) {
      loadingMore.value = false
      nextTick(() => {
        initObserver()
        observeMore()
      })
    }
  }
}

onMounted(async () => {
  observer = new IntersectionObserver(([entry]) => {
    if (!entry.isIntersecting) return
    fetchNext()
  }, { rootMargin: '650px 0px' })

  initObserver()
  observeMore()

  await Promise.all([
    fetchCategories(),
    fetchCountries()
  ])
})

onUnmounted(() => observer?.disconnect())
</script>

<template>
  <main ref="containerRef" class="min-h-screen bg-[#030305] text-white overflow-x-clip relative isolate flex flex-col items-center pt-14 pb-20 px-6">
    <!-- Background glow -->
    <div class="absolute inset-0 z-[-1] pointer-events-none flex items-center justify-center">
      <div class="w-[80vw] h-[80vw] max-w-[800px] max-h-[800px] bg-[#00D4FF]/5 rounded-full blur-[120px] opacity-40"></div>
    </div>

    <div class="w-full max-w-5xl">
      <SaasBreadcrumb 
        :name="currentCountryName || currentCategoryName || currentContinentName" 
        :is-category="!!currentCategoryName && !currentCountryName" 
        :is-country="!!currentCountryName || !!currentContinentName" 
      />
    </div>

    <div class="w-full max-w-5xl flex flex-col gap-10">
      <!-- Header & Filtering/Sorting Area (Sticky) -->
      <SaasListHeader />

      <!-- Loading State: Startup Cards Skeleton Grid -->
      <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 relative z-10 animate-fade-in">
        <SaasGemCardSkeleton v-for="n in PAGE_SIZE" :key="'gem-sk-' + n" />
      </div>

      <!-- Error State -->
      <div v-else-if="errorMessage" class="text-center py-16">
        <p class="text-red-400 font-sans text-sm font-light bg-red-400/10 border border-red-500/20 rounded-xl p-4 inline-block">
          {{ errorMessage }}
        </p>
      </div>

      <!-- List Empty State -->
      <div v-else-if="filteredAndSortedItems.length === 0" class="text-center py-20 border border-dashed border-white/5 rounded-2xl animate-fade-in">
        <p class="text-neutral-500 font-sans text-sm font-light uppercase tracking-widest">{{ t.list_view.empty }}</p>
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
        <template v-if="loadingMore">
          <SaasGemCardSkeleton v-for="n in PAGE_SIZE" :key="'gem-more-sk-' + n" class="animate-fade-in" />
        </template>
        <div v-if="hasMore" ref="loadMoreRef" class="col-span-full h-px" />
      </div>

      <!-- Add MRR Component -->
      <div class="mt-8 relative z-10 w-full">
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
