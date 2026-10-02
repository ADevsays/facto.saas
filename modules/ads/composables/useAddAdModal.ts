import { ref } from 'vue'

const isOpen = ref(false)
const isAuctionListOpen = ref(false)
const mode = ref<'sale' | 'setup'>('sale')
const selectedSlot = ref(1)
const targetPrice = ref<number | null>(null)
const targetAdName = ref<string | null>(null)
const setupToken = ref<string | null>(null)

export function useAddAdModal() {
  function open(slot: number = 1, price?: number | null, adName?: string | null) {
    mode.value = 'sale'
    selectedSlot.value = slot
    targetPrice.value = price ?? null
    targetAdName.value = adName ?? null
    setupToken.value = null
    isOpen.value = true
  }

  function openBuy(slot: number = 1, price?: number | null, adName?: string | null) {
    open(slot, price, adName)
  }

  function openAuctionList() {
    isAuctionListOpen.value = true
  }

  function closeAuctionList() {
    isAuctionListOpen.value = false
  }

  function openForSetup(slot: number = 1, token?: string | null) {
    mode.value = 'setup'
    selectedSlot.value = slot
    setupToken.value = token || null
    targetPrice.value = null
    targetAdName.value = null
    isOpen.value = true
  }

  function close() {
    isOpen.value = false
    mode.value = 'sale'
    targetPrice.value = null
    targetAdName.value = null
    setupToken.value = null
  }

  return {
    isOpen,
    isAuctionListOpen,
    mode,
    selectedSlot,
    targetPrice,
    targetAdName,
    setupToken,
    open,
    openBuy,
    openAuctionList,
    closeAuctionList,
    openForSetup,
    close
  }
}
