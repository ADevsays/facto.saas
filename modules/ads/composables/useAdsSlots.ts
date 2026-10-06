import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useState } from '#app'
import type { AdSlot } from '../types'

let syncChannel: BroadcastChannel | null = null
let activeListeners = 0

export function useAdsSlots() {
  const slotsState = useState<AdSlot[]>('facto_ads_slots_data', () => [])
  const pending = ref(false)

  const refresh = async () => {
    try {
      pending.value = true
      const data = await $fetch<AdSlot[]>('/api/ads/slots')
      if (Array.isArray(data) && data.length === 20) {
        slotsState.value = data
      }
    } catch (err) {
      console.error('[useAdsSlots] Error refreshing slots:', err)
    } finally {
      pending.value = false
    }
  }

  if (import.meta.client && (!slotsState.value || slotsState.value.length !== 20)) {
    refresh()
  }

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
