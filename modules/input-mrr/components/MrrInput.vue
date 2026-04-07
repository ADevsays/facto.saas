<script setup lang="ts">
import MrrCategoryTabs from './MrrCategoryTabs.vue'
import { useAddSaasModal } from '~/composables/useAddSaasModal'

const { query, setQuery } = useStartupSearch()
const { items, fetchAll } = useSaasList()
const { open: openAddModal } = useAddSaasModal()

onMounted(fetchAll)

const categories = computed(() => {
  const slugs = new Set(items.value.map((i) => i.categorySlug))
  const found = items.value.filter((i) => slugs.has(i.categorySlug)).map((i) => i.category)
  return ['Todas', ...Array.from(new Set(found))]
})

const activeCategory = ref('Todas')

watch(activeCategory, (cat) => {
  setQuery(cat === 'Todas' ? '' : cat)
})

function onInput(e: Event) {
  activeCategory.value = 'Todas'
  setQuery((e.target as HTMLInputElement).value)
}
</script>

<template>
  <div class="flex flex-col gap-3 w-full">
    <div class="flex flex-col sm:flex-row gap-3 w-full">
      <div class="relative flex-1">
        <svg
          class="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-600 pointer-events-none"
          width="14" height="14" viewBox="0 0 24 24" fill="none"
        >
          <circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
          <path d="M16.5 16.5L21 21" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
        </svg>
        <input
          :value="query"
          @input="onInput"
          type="text"
          placeholder="Busca lo que sea..."
          class="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-5 py-3.5 text-white text-sm font-sans tracking-wide placeholder:text-neutral-600 focus:outline-none focus:border-[#00D4FF]/50 focus:bg-white/8 transition-all duration-300"
        />
      </div>
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

    <MrrCategoryTabs v-model="activeCategory" :categories="categories" />
  </div>
</template>

<style scoped>
.add-btn:hover {
  box-shadow: 0 0 15px rgba(255, 255, 255, 0.5), 0 0 30px rgba(0, 212, 255, 0.3), 0 0 45px rgba(0, 212, 255, 0.1);
}
</style>
