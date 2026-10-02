import { ref, computed, watch } from 'vue'
import type { Ref } from 'vue'
import type { AdSlot } from '../types'

export function useAdCheckout(options: {
  selectedSlot: Ref<number>
  targetPrice: Ref<number | null>
  targetAdName: Ref<string | null>
  slots: Ref<AdSlot[] | null | undefined>
  onCheckoutSuccess?: () => void
}) {
  const { selectedSlot, targetPrice, targetAdName, slots, onCheckoutSuccess } = options

  const customBid = ref(selectedSlot.value === 1 ? 10 : 1)
  const isCreatingCheckout = ref(false)
  const checkoutError = ref('')

  const allSlotsList = computed(() => {
    const result: Array<{
      position: number
      isAvailable: boolean
      currentPrice: number
      nextPrice: number
      ad: any
    }> = []

    for (let i = 1; i <= 20; i++) {
      const existing = slots.value?.find(s => s.position === i)
      const base = i === 1 ? 10 : 1
      if (existing) {
        result.push(existing)
      } else {
        result.push({
          position: i,
          isAvailable: true,
          currentPrice: base,
          nextPrice: base,
          ad: null
        })
      }
    }

    return result
  })

  const currentSlotData = computed(() => {
    if (!slots.value) return null
    return slots.value.find(s => s.position === selectedSlot.value) || null
  })

  const minPrice = computed(() => {
    if (currentSlotData.value) {
      const slotMin = currentSlotData.value.isAvailable
        ? currentSlotData.value.currentPrice
        : currentSlotData.value.nextPrice
      if (targetPrice.value !== null && targetPrice.value !== undefined) {
        return Math.max(slotMin, targetPrice.value)
      }
      return slotMin
    }
    return targetPrice.value || (selectedSlot.value === 1 ? 10 : 1)
  })

  const isSlotAvailable = computed(() => {
    if (!currentSlotData.value) return true
    return currentSlotData.value.isAvailable
  })

  function selectSlot(position: number) {
    selectedSlot.value = position
    targetPrice.value = null
    targetAdName.value = null
    const target = slots.value?.find(s => s.position === position)
    const base = target ? (target.isAvailable ? target.currentPrice : target.nextPrice) : (position === 1 ? 10 : 1)
    customBid.value = base
  }

  function decrementBid() {
    if (customBid.value > minPrice.value) {
      customBid.value--
    }
  }

  function incrementBid(amount = 1) {
    customBid.value += amount
  }

  function setPreset(amount: number) {
    if (amount === 0) {
      customBid.value = minPrice.value
    } else {
      customBid.value = Math.max(minPrice.value, customBid.value) + amount
    }
  }

  function syncBidWithMin() {
    const target = slots.value?.find(s => s.position === selectedSlot.value)
    const base = target ? (target.isAvailable ? target.currentPrice : target.nextPrice) : (targetPrice.value || (selectedSlot.value === 1 ? 10 : 1))
    customBid.value = Math.max(base, minPrice.value)
  }

  watch([selectedSlot, targetPrice], () => {
    syncBidWithMin()
  }, { immediate: true })

  async function startCheckout() {
    isCreatingCheckout.value = true
    checkoutError.value = ''
    if (customBid.value < minPrice.value) {
      customBid.value = minPrice.value
    }

    try {
      const res = await $fetch<{ ok: boolean; checkoutUrl: string }>('/api/ads/checkout', {
        method: 'POST',
        body: {
          slot: selectedSlot.value,
          price: customBid.value
        }
      })

      if (res?.checkoutUrl) {
        if (typeof window !== 'undefined') {
          window.open(res.checkoutUrl, '_blank')
        }
        isCreatingCheckout.value = false
        if (onCheckoutSuccess) onCheckoutSuccess()
      } else {
        throw new Error('No se pudo generar la URL de pago')
      }
    } catch (err: any) {
      checkoutError.value = err.data?.statusMessage || err.message || 'Error al iniciar el pago con Whop.'
      isCreatingCheckout.value = false
    }
  }

  return {
    customBid,
    minPrice,
    allSlotsList,
    currentSlotData,
    isSlotAvailable,
    isCreatingCheckout,
    checkoutError,
    selectSlot,
    decrementBid,
    incrementBid,
    setPreset,
    syncBidWithMin,
    startCheckout
  }
}
