import { computed, onMounted, onUnmounted } from 'vue'
import type { AdSlot } from '../types'

let syncChannel: BroadcastChannel | null = null
let activeListeners = 0

export function useAdsSlots() {
  const { data: slots, refresh, pending } = useFetch<AdSlot[]>('/api/ads/slots', {
    key: 'ads-slots-list'
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

      const onFocus = () => {
        refresh()
      }
      window.addEventListener('focus', onFocus)

      onUnmounted(() => {
        activeListeners--
        window.removeEventListener('focus', onFocus)
        if (activeListeners <= 0 && syncChannel) {
          syncChannel.close()
          syncChannel = null
        }
      })
    })
  }

  const safeSlots = computed<AdSlot[]>(() => {
    if (slots.value && slots.value.length === 20) {
      return slots.value
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
    slots,
    safeSlots,
    topSlots,
    bottomSlots,
    freeSlotsCount,
    refresh,
    pending
  }
}
