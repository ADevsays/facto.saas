import { computed } from 'vue'
import { useRoute, useRouter } from '#app'
import { ROUTES } from '~/utils/routes'

export function useCategoryFilter() {
  const route = useRoute()
  const router = useRouter()

  const category = computed(() => (route.params.slug as string) || '')

  function setCategory(value: string) {
    if (value === 'all' || !value) {
      router.push('/saas')
    } else {
      router.push(`${ROUTES.CATEGORY}/${value}`)
    }
  }

  function filterByCategory<T extends { categorySlug: string; categories?: { slug: string }[] }>(items: T[]): T[] {
    const cat = category.value
    if (!cat || cat === 'all') return items
    return items.filter((item) => {
      const hasCategoryInArray = item.categories && item.categories.some(c => c.slug === cat)
      return hasCategoryInArray || item.categorySlug === cat
    })
  }

  return { category, setCategory, filterByCategory }
}
