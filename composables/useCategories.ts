import { ref, computed } from 'vue'

interface Category {
  id: string
  name: string
  slug: string
  description?: string
  icon?: string
}

const categories = ref<Category[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

export function useCategories() {
  async function fetchCategories(force = false) {
    if (categories.value.length > 0 && !force) {
      loading.value = false
      return
    }

    loading.value = true
    error.value = null

    try {
      const data = await $fetch<Category[]>('/api/categories')
      categories.value = data || []
    } catch (e: any) {
      error.value = e.message || 'Error loading categories'
    } finally {
      loading.value = false
    }
  }

  return {
    categories: computed(() => categories.value),
    loading: computed(() => loading.value),
    error: computed(() => error.value),
    fetchCategories,
  }
}
