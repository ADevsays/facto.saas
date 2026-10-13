import { computed, onMounted, onUnmounted, watch } from 'vue'
import type { AdSlot } from '../types'

let syncChannel: BroadcastChannel | null = null
let activeListeners = 0
let onWindowFocus: (() => void) | null = null

export function useAdsSlots() {
  // The server plugin preloads this state and Nuxt serializes it in the HTML.
  // Keep it as the hydration source so the browser never replaces the
  // server-rendered marquee with a second, conflicting response.
  const slotsState = useState<AdSlot[]>('facto_ads_slots_data', () => [])
  const { data: fetchedSlots, pending, refresh } = useFetch<AdSlot[]>('/api/ads/slots', {
    key: 'facto_ads_slots_fetch',
    server: true,
    immediate: import.meta.server,
    default: () => slotsState.value,
    // Keep the synchronous SSR cache contract while preferring the canonical
    // state when it was preloaded by the server plugin or hydrated from HTML.
    getCachedData: (key, nuxtApp) => {
      if (slotsState.value.length === 20) return slotsState.value
      return nuxtApp.payload.data[key] ?? nuxtApp.static.data[key]
    },
    transform: (data) => Array.isArray(data) && data.length === 20 ? data : [],
  })

  watch(fetchedSlots, (value) => {
    if (Array.isArray(value) && value.length === 20) slotsState.value = value
  }, { immediate: true })

  if (import.meta.client) {
    onMounted(() => {
      activeListeners++

      if (!syncChannel && typeof BroadcastChannel !== 'undefined') {
        try {
          syncChannel = new BroadcastChannel('facto_ads_sync')
          syncChannel.onmessage = (event) => {
            if (event.data?.type === 'AD_UPDATED') {
              refresh()
            }
          }
        } catch {}
      }

      if (!onWindowFocus) {
        onWindowFocus = () => {
          refresh()
        }
        window.addEventListener('focus', onWindowFocus)
      }

      onUnmounted(() => {
        activeListeners--
        if (activeListeners <= 0 && syncChannel) {
          syncChannel.close()
          syncChannel = null
        }
        if (activeListeners <= 0 && onWindowFocus) {
          window.removeEventListener('focus', onWindowFocus)
          onWindowFocus = null
        }
      })
    })
  }

  const safeSlots = computed<AdSlot[]>(() => {
    if (slotsState.value.length === 20) {
      return slotsState.value
    }
    const list: AdSlot[] = []
    for (let i = 1; i <= 20; i++) {
      const base = i === 1 ? 10 : 1
      list.push({
        position: i,
        ad: null,
        currentPrice: base,
        nextPrice: base,
        isAvailable: true
      })
    }
    return list
  })

  const freeSlotsCount = computed(() => safeSlots.value.filter(s => s.isAvailable).length)
  const topSlots = computed(() => safeSlots.value.slice(0, 10))
  const bottomSlots = computed(() => safeSlots.value.slice(10, 20))

  return {
    slots: slotsState,
    safeSlots,
    topSlots,
    bottomSlots,
    freeSlotsCount,
    refresh,
    pending
  }
}
