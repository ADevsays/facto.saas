import { computed, watch } from 'vue'
import type { SaasListItem, SaasListState } from '~/modules/ranking/types'
import { getCategoryDisplayName } from '~/utils/categories'

const parseRevenue = (value?: string, _fallbackMrr?: number | null) => {
  if (!value || value === '—') return 0
  const amount = Number.parseFloat(value.replace(/[^0-9.]/g, ''))
  const multiplier = value.includes('M') ? 1_000_000 : value.includes('K') ? 1_000 : 1
  return (amount * multiplier) || 0
}

type SaasListScope = 'home' | 'ranking' | 'catalog' | 'recommendations'

const listRequests: Record<SaasListScope, { key: string; endpoint: string }> = {
  home: { key: 'facto-saas-home-data', endpoint: '/api/ranking/list?scope=home' },
  ranking: { key: 'facto-saas-ranking-data', endpoint: '/api/ranking/list?limit=100&excludeIncognito=true' },
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
  }))
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
    if (items) state.value.items = items
  }, { immediate: true })

  watch(error, (value) => {
    state.value.error = value instanceof Error ? value.message : value ? String(value) : null
  }, { immediate: true })

  const sourceItems = computed(() => data.value.length > 0 ? data.value : state.value.items)

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

  const rankingItems = computed(() =>
    [...localizedItems.value]
      .filter(item => !item.isIncognito)
      .sort((a, b) => {
        if (a.mrr === null && b.mrr === null) return (b.views ?? 0) - (a.views ?? 0)
        if (a.mrr === null) return 1
        if (b.mrr === null) return -1
        return parseRevenue(b.revenue, b.mrr) - parseRevenue(a.revenue, a.mrr)
      })
  )

  const recentItems = computed(() =>
    [...localizedItems.value]
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
      .slice(0, 6)
  )

  const bestItems = computed(() => {
    const withMrr = localizedItems.value.filter((i) => i.mrr !== null)
    if (withMrr.length >= 3) {
      return withMrr.sort((a, b) => {
        return parseRevenue(b.revenue, b.mrr) - parseRevenue(a.revenue, a.mrr)
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
  }
}
