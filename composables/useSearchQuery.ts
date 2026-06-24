import { computed } from 'vue'
import { useRoute, useRouter } from '#app'

export function useSearchQuery() {
  const route = useRoute()
  const router = useRouter()

  const query = computed(() => (route.query.q as string) || '')

  function setQuery(value: string) {
    router.replace({
      query: {
        ...route.query,
        q: value.trim() || undefined,
      },
    })
  }

  function filterByQuery<T extends { name: string | null; founderName: string | null; category: string; mrr: number | null }>(
    items: T[]
  ): T[] {
    const q = query.value.toLowerCase().trim()
    if (!q) return items

    return items.filter((item) => {
      const name = item.name?.toLowerCase() ?? ''
      const founder = item.founderName?.toLowerCase() ?? ''
      const category = item.category.toLowerCase()
      const mrr = item.mrr?.toString() ?? ''
      return name.includes(q) || founder.includes(q) || category.includes(q) || mrr.includes(q)
    })
  }

  return { query, setQuery, filterByQuery }
}
