import { computed, onMounted } from 'vue'
import type { AdSlot } from '../types'

export function useAdsSlots() {
  const { data: slots, refresh } = useFetch<AdSlot[]>('/api/ads/slots', {
    key: 'ads-slots-list'
  })

  onMounted(() => {
    refresh()
  })

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
    refresh
  }
}
