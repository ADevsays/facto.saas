<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'
import MrrCategoryTabs from './MrrCategoryTabs.vue'
import MrrInputAutocompleteDropdown from './MrrInputAutocompleteDropdown.vue'
import { useAddSaasModal } from '~/composables/useAddSaasModal'
import { useRouter } from '#app'

import { ROUTES } from '~/utils/routes'

const { items, fetchAll } = useSaasList()
const { categories: dbCategories, fetchCategories } = useCategories()
const { open: openAddModal } = useAddSaasModal()
const router = useRouter()

const localQuery = ref('')
const results = ref<any[]>([])
const loading = ref(false)
const showDropdown = ref(false)

const searchContainer = ref<HTMLElement | null>(null)

onMounted(async () => {
  fetchAll()
  await fetchCategories()
})

const categories = ref<{ name: string; slug: string }[]>([{ name: 'Todas', slug: 'all' }])

let initializedCategories = false
let shuffleInterval: any = null

function shuffleCategories() {
  if (!dbCategories.value.length) return
  
  const currentSlugs = categories.value.slice(1).map(c => c.slug)
  let pool = dbCategories.value.filter(c => c.slug !== 'other' && !currentSlugs.includes(c.slug))
  
  // Si no hay suficientes categorías nuevas (BD muy pequeña), usamos todas
  if (pool.length < 3) {
    pool = [...dbCategories.value.filter(c => c.slug !== 'other')]
  }
  
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));[pool[i], pool[j]] = [pool[j], pool[i]]
  }
  
  categories.value = [
    { name: 'Todas', slug: 'all' },
    ...pool.slice(0, 3).map(c => ({ name: c.name, slug: c.slug }))
  ]
}

watch(dbCategories, (val) => {
  if (!val.length || initializedCategories) return
  initializedCategories = true
  
  shuffleCategories()
  
  shuffleInterval = setInterval(() => {
    shuffleCategories()
  }, 7000)
}, { immediate: true })

function onSelectCategory(slug: string) {
  if (slug === 'all') {
    router.push('/saas')
  } else {
    router.push(`${ROUTES.CATEGORY}/${slug}`)
  }
}

function onItemClick(item: any) {
  if (item.isIncognito) return
  showDropdown.value = false
  localQuery.value = ''
}

function onEnter() {
  if (results.value.length > 0) {
    const first = results.value[0]
    if (!first.isIncognito && first.slug) {
      showDropdown.value = false
      localQuery.value = ''
      router.push(`/saas/${first.slug}`)
    }
  }
}

let debounceTimeout: any = null

watch(localQuery, () => {
  if (debounceTimeout) clearTimeout(debounceTimeout)
  
  const queryVal = localQuery.value.trim()

  if (!queryVal) {
    results.value = []
    loading.value = false
    return
  }

  loading.value = true
  showDropdown.value = true

  debounceTimeout = setTimeout(async () => {
    try {
      const data = await $fetch<any[]>('/api/input-mrr/search', {
        params: { q: queryVal }
      })
      results.value = data
    } catch (err) {
      console.error(err)
      results.value = []
    } finally {
      loading.value = false
    }
  }, 300)
})

function handleClickOutside(event: MouseEvent) {
  if (searchContainer.value && !searchContainer.value.contains(event.target as Node)) {
    showDropdown.value = false
  }
}

function handleEscape(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    showDropdown.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  document.addEventListener('keydown', handleEscape)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  document.removeEventListener('keydown', handleEscape)
  if (shuffleInterval) clearInterval(shuffleInterval)
})
</script>

<template>
  <div ref="searchContainer" class="flex flex-col gap-3 w-full relative">
    <div class="flex flex-col sm:flex-row gap-3 w-full relative">
      <div class="relative flex-1 group">
        <!-- Search Icon -->
        <svg
          class="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none transition-colors duration-300 group-focus-within:text-[#00D4FF]"
          width="14" height="14" viewBox="0 0 24 24" fill="none"
        >
          <circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
          <path d="M16.5 16.5L21 21" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
        </svg>

        <!-- Input field -->
        <input
          v-model="localQuery"
          @focus="showDropdown = true"
          @keydown.enter="onEnter"
          type="text"
          placeholder="Busca cualquier SaaS: salud, 10kMRR, etc..."
          class="w-full bg-white/10 border border-white/20 rounded-xl pl-10 pr-5 py-3.5 text-white text-sm font-sans tracking-wide placeholder:text-neutral-500 focus:outline-none focus:border-[#00D4FF] focus:bg-white/15 focus:ring-4 focus:ring-[#00D4FF]/10 transition-all duration-300 shadow-sm"
        />

        <!-- Autocomplete Dropdown -->
        <MrrInputAutocompleteDropdown
          :is-open="showDropdown"
          :loading="loading"
          :results="results"
          :local-query="localQuery"
          @click-item="onItemClick"
        />
      </div>

      <!-- Add MRR Button -->
      <button @click="openAddModal" class="add-btn group flex items-center justify-center gap-2 bg-white text-black font-bold uppercase tracking-widest text-xs rounded-xl px-5 py-3.5 transition-all duration-700 hover:scale-[1.03] w-full sm:w-auto shrink-0">
        <svg
          width="12" height="12" viewBox="0 0 12 12"
          class="transition-transform duration-500 group-hover:rotate-90"
        >
          <path d="M6 1v10M1 6h10" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
        </svg>
        Agrega tu MRR
      </button>
    </div>

    <!-- Category Tabs -->
    <MrrCategoryTabs active="all" :categories="categories" @select="onSelectCategory" />
  </div>
</template>

<style scoped>
.add-btn {
  box-shadow: 0 0 10px rgba(255, 255, 255, 0.1);
}
.add-btn:hover {
  box-shadow: 0 0 20px rgba(255, 255, 255, 0.6), 0 0 40px rgba(0, 212, 255, 0.4), 0 0 60px rgba(0, 212, 255, 0.2);
}
</style>
