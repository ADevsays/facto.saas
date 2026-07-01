import type { SaasListItem, SaasListState } from '~/modules/ranking/types'

const state = reactive<SaasListState>({
  items: [],
  loading: true,
  error: null,
})

const parseRev = (val?: string, fallbackMrr?: number | null) => {
  if (!val || val === '—') return (fallbackMrr || 0) * 12
  let num = val.replace(/[^0-9.]/g, '')
  let multi = 1
  if (val.includes('M')) multi = 1000000
  else if (val.includes('K')) multi = 1000
  return (parseFloat(num) * multi) || 0
}

export function useSaasList() {
  async function fetchAll() {
    if (state.items.length > 0) return
    state.loading = true
    state.error = null

    try {
      const data = await $fetch<SaasListItem[]>('/api/ranking/list')
      state.items = data
    } catch (e: unknown) {
      state.error = e instanceof Error ? e.message : 'Error cargando el ranking'
    } finally {
      state.loading = false
    }
  }

  const rankingItems = computed(() =>
    [...state.items]
      .sort((a, b) => {
        if (a.mrr === null && b.mrr === null) return (b.views ?? 0) - (a.views ?? 0)
        if (a.mrr === null) return 1
        if (b.mrr === null) return -1
        return parseRev(b.revenue, b.mrr) - parseRev(a.revenue, a.mrr)
      })
      .slice(0, 10)
  )

  const recentItems = computed(() =>
    [...state.items]
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
      .slice(0, 6)
  )

  const bestItems = computed(() => {
    const withMrr = state.items.filter((i) => i.mrr !== null)
    if (withMrr.length >= 3) {
      return withMrr.sort((a, b) => {
        return parseRev(b.revenue, b.mrr) - parseRev(a.revenue, a.mrr)
      }).slice(0, 6)
    }
    return [...state.items]
      .sort((a, b) => b.views - a.views)
      .slice(0, 6)
  })

  return {
    items: computed(() => state.items),
    loading: computed(() => state.loading),
    error: computed(() => state.error),
    rankingItems,
    recentItems,
    bestItems,
    fetchAll,
  }
}
