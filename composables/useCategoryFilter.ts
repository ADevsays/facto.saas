import { computed } from 'vue'
import { useRoute, useRouter } from '#app'
import { ROUTES } from '~/utils/routes'

export function useCategoryFilter() {
  const route = useRoute()
  const router = useRouter()

  const isOnCategoryRoute = computed(() => route.path.includes(ROUTES.CATEGORY))
  const isOnCountryRoute = computed(() => route.path.includes(ROUTES.COUNTRY))

  const category = computed(() => {
    if (isOnCategoryRoute.value) {
      return (route.params.slug as string) || ''
    }
    return (route.query.categoria as string) || ''
  })

  function setCategory(value: string) {
    if (isOnCountryRoute.value) {
      if (value === 'all' || !value) {
        const { categoria, ...rest } = route.query
        router.push({ path: route.path, query: rest })
      } else {
        router.push({ path: route.path, query: { ...route.query, categoria: value } })
      }
    } else {
      if (value === 'all' || !value) {
        router.push('/saas')
      } else {
        router.push(`${ROUTES.CATEGORY}/${value}`)
      }
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
