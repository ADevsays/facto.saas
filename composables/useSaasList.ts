import type { SaasListItem, SaasListState } from '~/modules/ranking/types'

const state = reactive<SaasListState>({
  items: [],
  loading: false,
  error: null,
})

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
    [...state.items].sort((a, b) => {
      if (a.mrr === null && b.mrr === null) return 0
      if (a.mrr === null) return 1
      if (b.mrr === null) return -1
      return b.mrr - a.mrr
    })
  )

  const recentItems = computed(() =>
    [...state.items]
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
      .slice(0, 6)
  )

  const bestItems = computed(() =>
    [...state.items]
      .filter((i) => i.mrr !== null)
      .sort((a, b) => (b.mrr ?? 0) - (a.mrr ?? 0))
      .slice(0, 6)
  )

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
