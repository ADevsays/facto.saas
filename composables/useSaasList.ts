import { computed, watch } from 'vue'
import type { SaasListItem, SaasListState } from '~/modules/ranking/types'
import { getCategoryDisplayName } from '~/utils/categories'

let pendingRequest: Promise<void> | null = null

const parseRevenue = (value?: string, fallbackMrr?: number | null) => {
  if (!value || value === '—') return (fallbackMrr || 0) * 12
  const amount = Number.parseFloat(value.replace(/[^0-9.]/g, ''))
  const multiplier = value.includes('M') ? 1_000_000 : value.includes('K') ? 1_000 : 1
  return (amount * multiplier) || 0
}

export function useSaasList(options: { server?: boolean } = {}) {
  const { locale } = useI18n()
  const state = useState<SaasListState>('facto-saas-list', () => ({
    items: [],
    loading: true,
    error: null,
  }))
  const { data, pending, error, refresh } = useFetch<SaasListItem[]>('/api/ranking/list?limit=1000', {
    key: 'facto-saas-list-data',
    server: options.server !== false,
    immediate: options.server !== false,
    default: () => [],
    // SSR embeds this once in Nuxt's payload. Hydration reuses it instead of
    // re-requesting the ranking from the browser.
    // An empty payload can be produced while Supabase is temporarily
    // unavailable. Do not treat that snapshot as authoritative:
    // allow useFetch to recover from the origin instead of freezing Home with
    // “No se encontraron resultados”. Non-empty payloads remain fully
    // hydrated and avoid the extra request.
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

  // `watch` callbacks are not guaranteed to run before an SSR render. Render
  // from the async-data ref itself so direct entries to /saas use the same
  // branch on the server and client; keep useState only as cross-route
  // fallback once the client has already loaded the list.
  const sourceItems = computed(() => data.value.length > 0 ? data.value : state.value.items)

  const localizedItems = computed(() => {
    return sourceItems.value.map(item => ({
      ...item,
      category: getCategoryDisplayName(item.categorySlug, item.category, locale.value)
    }))
  })

  async function fetchAll(force = false) {
    if (!force && sourceItems.value.length > 0) return
    if (pendingRequest) return pendingRequest

    pendingRequest = (async () => {
      state.value.error = null

      try {
        await refresh()
      } catch (e: unknown) {
        state.value.error = e instanceof Error ? e.message : 'Error cargando el ranking'
      } finally {
        pendingRequest = null
      }
    })()

    return pendingRequest
  }

  const rankingItems = computed(() =>
    [...localizedItems.value]
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
