import { ref, computed } from 'vue'
import { getCategoryDisplayName } from '~/utils/categories'

interface Category {
  id: string
  name: string
  slug: string
  description?: string
  icon?: string
}

const rawCategories = ref<Category[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

export function useCategories() {
  const { locale } = useI18n()

  async function fetchCategories(force = false) {
    if (rawCategories.value.length > 0 && !force) {
      loading.value = false
      return
    }

    loading.value = true
    error.value = null

    try {
      const data = await $fetch<Category[]>('/api/categories')
      rawCategories.value = data || []
    } catch (e: any) {
      error.value = e.message || 'Error loading categories'
    } finally {
      loading.value = false
    }
  }

  const categories = computed(() => {
    return rawCategories.value.map(cat => ({
      ...cat,
      name: getCategoryDisplayName(cat.slug, cat.name, locale.value)
    }))
  })

  return {
    categories,
    loading: computed(() => loading.value),
    error: computed(() => error.value),
    fetchCategories,
  }
}
