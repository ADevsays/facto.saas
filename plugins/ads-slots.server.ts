import { defineNuxtPlugin, useState } from '#app'
import { adsService } from '~/modules/ads/server/services/ads'
import type { AdSlot } from '~/modules/ads/types'

export default defineNuxtPlugin(async () => {
  const slotsState = useState<AdSlot[]>('facto_ads_slots_data')
  if (!slotsState.value || slotsState.value.length === 0) {
    try {
      slotsState.value = await adsService.getAuctionSlots()
    } catch (err) {
      console.error('[AdsSlotsPlugin] Failed to preload slots on server:', err)
    }
  }
})
