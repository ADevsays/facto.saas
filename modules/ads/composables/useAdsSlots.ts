import { computed, onMounted, onUnmounted, ref } from 'vue'
import type { AdSlot } from '../types'

let syncChannel: BroadcastChannel | null = null
let activeListeners = 0

export function useAdsSlots() {
  // The server plugin preloads this state and Nuxt serializes it in the HTML.
  // Keep it as the hydration source so the browser never replaces the
  // server-rendered marquee with a second, conflicting response.
  const slotsState = useState<AdSlot[]>('facto_ads_slots_data', () => [])
  const pending = ref(false)

  const refresh = async () => {
    if (pending.value) return
    pending.value = true
    try {
      const slots = await $fetch<AdSlot[]>('/api/ads/slots')
      if (slots.length === 20) slotsState.value = slots
    } finally {
      pending.value = false
    }
  }

  if (import.meta.client) {
    onMounted(() => {
      activeListeners++

      if (!syncChannel && typeof BroadcastChannel !== 'undefined') {
        try {
          syncChannel = new BroadcastChannel('facto_ads_sync')
          syncChannel.onmessage = (event) => {
            if (event.data?.type === 'AD_UPDATED') {
              refresh().catch(() => {})
            }
          }
        } catch {}
      }

      onUnmounted(() => {
        activeListeners--
        if (activeListeners <= 0 && syncChannel) {
          syncChannel.close()
          syncChannel = null
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
