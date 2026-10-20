import { computed, watch, ref } from 'vue'
import type { SaasListItem, SaasListState } from '~/modules/ranking/types'
import { getCategoryDisplayName } from '~/utils/categories'

const parseRevenue = (value?: string | null, _fallbackMrr?: number | null) => {
  if (!value) return 0
  const amount = Number.parseFloat(value.replace(/[^0-9.]/g, ''))
  const multiplier = value.includes('M') ? 1_000_000 : value.includes('K') ? 1_000 : 1
  return (amount * multiplier) || 0
}

const compareByRevenue = (a: SaasListItem, b: SaasListItem) => {
  const revenueDiff = parseRevenue(b.revenue, b.mrr) - parseRevenue(a.revenue, a.mrr)
  if (revenueDiff !== 0) return revenueDiff
  const providerDiff = Number(Boolean(b.provider)) - Number(Boolean(a.provider))
  if (providerDiff !== 0) return providerDiff
  return (b.views ?? 0) - (a.views ?? 0) || a.id.localeCompare(b.id)
}

type SaasListScope = 'home' | 'ranking' | 'catalog' | 'recommendations'

const PAGE_SIZE = 10
const MAX_RANKING_ITEMS: Record<SaasListScope, number> = {
  home: 30,
  ranking: 100,
  catalog: 200,
  recommendations: 24,
}

const listRequests: Record<SaasListScope, { key: string; endpoint: string }> = {
  home: { key: 'facto-saas-home-data', endpoint: '/api/ranking/list?scope=home&rankingLimit=10&rankingOffset=0' },
  ranking: { key: 'facto-saas-ranking-data', endpoint: '/api/ranking/list?scope=ranking&limit=10&offset=0&excludeIncognito=true' },
  catalog: { key: 'facto-saas-catalog-data', endpoint: '/api/ranking/list?limit=200' },
  recommendations: { key: 'facto-saas-recommendations-data', endpoint: '/api/ranking/list?limit=24' },
}

export function useSaasList(options: { server?: boolean; scope?: SaasListScope } = {}) {
  const { locale } = useI18n()
  const { key, endpoint } = listRequests[options.scope ?? 'catalog']
  const state = useState<SaasListState>(key, () => ({
    items: [],
    loading: true,
    error: null,
    rankingLoaded: 0,
    rankingExhausted: false,
  }))
  const loadingMore = ref(false)
  const { data, pending, error, refresh } = useLazyFetch<SaasListItem[]>(endpoint, {
    key,
    server: options.server !== false,
    immediate: options.server !== false,
    default: () => [],
    getCachedData: (key, nuxtApp) => {
      const cached = nuxtApp.payload.data[key] ?? nuxtApp.static.data[key]
      return Array.isArray(cached) && cached.length === 0 ? undefined : cached
    },
  })

  watch(data, (items) => {
    if (items && state.value.items.length === 0) {
      state.value.items = items
      const scope = options.scope ?? 'catalog'
      state.value.rankingLoaded = scope === 'home' || scope === 'ranking'
        ? Math.min(PAGE_SIZE, MAX_RANKING_ITEMS[scope])
        : items.length
      state.value.rankingExhausted = false
    }
  }, { immediate: true })

  watch(error, (value) => {
    state.value.error = value instanceof Error ? value.message : value ? String(value) : null
  }, { immediate: true })

  const sourceItems = computed(() => state.value.items)

  const localizedItems = computed(() => {
    return sourceItems.value.map(item => ({
      ...item,
      category: getCategoryDisplayName(item.categorySlug, item.category, locale.value)
    }))
  })

  async function fetchAll(force = false) {
    if (!force && sourceItems.value.length > 0) return
    state.value.error = null
    try {
      await refresh()
    } catch (e: unknown) {
      state.value.error = e instanceof Error ? e.message : 'Error cargando el ranking'
    }
  }

  async function loadMoreRanking() {
    const scope = options.scope ?? 'catalog'
    const maxItems = MAX_RANKING_ITEMS[scope]
    if (scope === 'catalog' || scope === 'recommendations' || loadingMore.value || state.value.rankingExhausted || state.value.rankingLoaded >= maxItems) return false

    loadingMore.value = true
    const offset = state.value.rankingLoaded
    try {
      const amount = Math.min(PAGE_SIZE, maxItems - offset)
      const nextEndpoint = scope === 'home'
        ? `/api/ranking/list?scope=home&rankingOnly=true&rankingLimit=${amount}&rankingOffset=${offset}`
        : `/api/ranking/list?scope=ranking&limit=${amount}&offset=${offset}&excludeIncognito=true`
      const nextItems = await $fetch<SaasListItem[]>(nextEndpoint)
      const existingIds = new Set(state.value.items.map(item => item.id))
      state.value.items.push(...nextItems.filter(item => !existingIds.has(item.id)))
      state.value.rankingLoaded = Math.min(maxItems, offset + nextItems.length)
      state.value.rankingExhausted = nextItems.length < amount
      return nextItems.length > 0
    } catch (e: unknown) {
      state.value.error = e instanceof Error ? e.message : 'Error cargando el ranking'
      return false
    } finally {
      loadingMore.value = false
    }
  }

  const rankingItems = computed(() => {
    const scope = options.scope ?? 'catalog'
    const sorted = [...localizedItems.value]
      .filter(item => !item.isIncognito)
      .sort((a, b) => {
        if (a.mrr === null && b.mrr === null) return (b.views ?? 0) - (a.views ?? 0) || a.id.localeCompare(b.id)
        if (a.mrr === null) return 1
        if (b.mrr === null) return -1
        return compareByRevenue(a, b)
      })
    return scope === 'home' || scope === 'ranking' ? sorted.slice(0, state.value.rankingLoaded) : sorted
  })

  const recentItems = computed(() =>
    [...localizedItems.value]
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
      .slice(0, 6)
  )

  const bestItems = computed(() => {
    const withMrr = localizedItems.value.filter((i) => i.mrr !== null)
    if (withMrr.length >= 3) {
      return withMrr.sort((a, b) => {
        return compareByRevenue(a, b)
      }).slice(0, 6)
    }
    return [...localizedItems.value]
      .sort((a, b) => b.views - a.views)
      .slice(0, 6)
  })

  return {
    items: localizedItems,
    loading: computed(() => pending.value),
    error: computed(() => state.value.error),
    rankingItems,
    recentItems,
    bestItems,
    fetchAll,
    loadMoreRanking,
    loadingMore,
    hasMoreRanking: computed(() => !state.value.rankingExhausted && state.value.rankingLoaded < MAX_RANKING_ITEMS[options.scope ?? 'catalog']),
  }
}
