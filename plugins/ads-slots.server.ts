import { defineNuxtPlugin, useState } from '#app'
import { adsService } from '~/modules/ads/server/services/ads'
import type { AdSlot } from '~/modules/ads/types'

let cachedSlots: AdSlot[] | null = null
let cacheExpiresAt = 0
let pendingSlots: Promise<AdSlot[]> | null = null
const ADS_SSR_TIMEOUT_MS = 1_500

function withTimeout<T>(request: Promise<T>, timeoutMs: number): Promise<T> {
  let timeout: ReturnType<typeof setTimeout> | undefined

  return Promise.race([
    request,
    new Promise<T>((_, reject) => {
      timeout = setTimeout(() => reject(new Error(`Ads slots timed out after ${timeoutMs}ms`)), timeoutMs)
    }),
  ]).finally(() => {
    if (timeout) clearTimeout(timeout)
  })
}

async function getCachedSlots() {
  if (cachedSlots && Date.now() < cacheExpiresAt) return cachedSlots

  pendingSlots ||= withTimeout(adsService.getAuctionSlots(), ADS_SSR_TIMEOUT_MS)
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
