import { computed, onMounted, onUnmounted } from 'vue'
import type { AdSlot } from '../types'

let syncChannel: BroadcastChannel | null = null
let activeListeners = 0
let onWindowFocus: (() => void) | null = null

export function useAdsSlots() {
  const { data: slotsState, pending, refresh } = useFetch<AdSlot[]>('/api/ads/slots', {
    key: 'facto_ads_slots_data',
    default: () => [],
    // Keep the SSR payload through hydration. This prevents every global ads
    // consumer from immediately issuing the same client request.
    getCachedData: (key, nuxtApp) => nuxtApp.payload.data[key] ?? nuxtApp.static.data[key],
    transform: (data) => Array.isArray(data) && data.length === 20 ? data : [],
  })

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
    if (slotsState.value && slotsState.value.length === 20) {
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
