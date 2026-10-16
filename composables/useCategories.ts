import { computed } from 'vue'
import { useState } from '#app'
import { getCategoryDisplayName } from '~/utils/categories'

interface Category {
  id: string
  name: string
  slug: string
  description?: string
  icon?: string
}

export function useCategories() {
  const { locale } = useI18n()
  const rawCategories = useState<Category[]>('facto-categories', () => [])
  const loading = useState<boolean>('facto-categories-loading', () => true)
  const error = useState<string | null>('facto-categories-error', () => null)

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
