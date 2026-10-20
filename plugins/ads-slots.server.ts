import { defineNuxtPlugin, useState } from '#app'
import { adsService } from '~/modules/ads/server/services/ads'
import type { AdSlot } from '~/modules/ads/types'

let cachedSlots: AdSlot[] | null = null
let cacheExpiresAt = 0
let pendingSlots: Promise<AdSlot[]> | null = null

async function getCachedSlots() {
  if (cachedSlots && Date.now() < cacheExpiresAt) return cachedSlots

  pendingSlots ||= adsService.getAuctionSlots()
    .then((slots) => {
      cachedSlots = slots
      cacheExpiresAt = Date.now() + 15_000
      return slots
    })
    .finally(() => {
      pendingSlots = null
    })

  return pendingSlots
}

export default defineNuxtPlugin(async () => {
  const slotsState = useState<AdSlot[]>('facto_ads_slots_data')
  if (!slotsState.value || slotsState.value.length === 0) {
    try {
      slotsState.value = await getCachedSlots()
    } catch (err) {
      console.error('[AdsSlotsPlugin] Failed to preload slots on server:', err)
    }
  }
})
