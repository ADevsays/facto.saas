import { computed } from 'vue'
import { useRoute, useRouter } from '#app'

export function useSortFilter() {
  const route = useRoute()
  const router = useRouter()

  const sort = computed(() => (route.query.s as 'latest' | 'mrr' | 'views') || 'latest')

  function setSort(value: 'latest' | 'mrr' | 'views') {
    router.replace({
      query: {
        ...route.query,
        s: value === 'latest' ? undefined : value,
      },
    })
  }

  function sortItems<T extends { mrr: number | null; views: number; publishedAt: string }>(items: T[]): T[] {
    return [...items].sort((a, b) => {
      if (sort.value === 'latest') {
        return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
      } else if (sort.value === 'mrr') {
        if (a.mrr === null && b.mrr === null) return 0
        if (a.mrr === null) return 1
        if (b.mrr === null) return -1
        return b.mrr - a.mrr
      } else if (sort.value === 'views') {
        return b.views - a.views
      }
      return 0
    })
  }

  return { sort, setSort, sortItems }
}
