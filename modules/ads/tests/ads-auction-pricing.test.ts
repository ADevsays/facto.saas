import { describe, it } from 'node:test'
import assert from 'node:assert'
import type { Ad, AdSlot } from '../types'

function computeSlotPricing(position: number, existingAd?: Partial<Ad> | null): AdSlot {
  const isFirst = position === 1
  const basePrice = isFirst ? 10 : 1

  if (existingAd && existingAd.is_active !== false) {
    const currentPrice = Number(existingAd.price) > 0 ? Number(existingAd.price) : basePrice
    return {
      position,
      ad: existingAd as Ad,
      currentPrice,
      nextPrice: Math.max(currentPrice + 1, basePrice + 1),
      isAvailable: false
    }
  }

  return {
    position,
    ad: null,
    currentPrice: basePrice,
    nextPrice: basePrice,
    isAvailable: true
  }
}

function build20SlotsList(activeAds: Ad[]): AdSlot[] {
  const adsByPos = new Map<number, Ad>()
  for (const ad of activeAds) {
    if (ad.position && ad.position >= 1 && ad.position <= 20) {
      adsByPos.set(ad.position, ad)
    }
  }

  const list: AdSlot[] = []
  for (let i = 1; i <= 20; i++) {
    list.push(computeSlotPricing(i, adsByPos.get(i)))
  }
  return list
}

describe('Ads Auction Pricing Rules', () => {
  it('should set $10 base price for Slot #1 when available', () => {
    const slot = computeSlotPricing(1, null)
    assert.strictEqual(slot.position, 1)
    assert.strictEqual(slot.isAvailable, true)
    assert.strictEqual(slot.currentPrice, 10)
    assert.strictEqual(slot.nextPrice, 10)
    assert.strictEqual(slot.ad, null)
  })

  it('should set $1 base price for Slots #2 through #20 when available', () => {
    for (let pos = 2; pos <= 20; pos++) {
      const slot = computeSlotPricing(pos, null)
      assert.strictEqual(slot.position, pos)
      assert.strictEqual(slot.isAvailable, true)
      assert.strictEqual(slot.currentPrice, 1)
      assert.strictEqual(slot.nextPrice, 1)
    }
  })

  it('should calculate correct outbid price (current + 1) for occupied slots', () => {
    const mockAd: Partial<Ad> = {
      id: 'ad-123',
      name: 'SuperSaaS',
      price: 5,
      position: 3,
      is_active: true
    }

    const slot = computeSlotPricing(3, mockAd)
    assert.strictEqual(slot.isAvailable, false)
    assert.strictEqual(slot.currentPrice, 5)
    assert.strictEqual(slot.nextPrice, 6)
  })

  it('should guarantee outbid on Slot #1 is at least $11', () => {
    const mockAd: Partial<Ad> = {
      id: 'ad-gold',
      name: 'Gold Sponsor',
      price: 10,
      position: 1,
      is_active: true
    }

    const slot = computeSlotPricing(1, mockAd)
    assert.strictEqual(slot.isAvailable, false)
    assert.strictEqual(slot.currentPrice, 10)
    assert.strictEqual(slot.nextPrice, 11)
  })

  it('should generate a deterministic list of exactly 20 slots', () => {
    const activeAds: Ad[] = [
      {
        id: 'ad-1',
        name: 'Spot 1',
        description: 'First',
        url: 'https://spot1.com',
        image_url: '',
        position: 1,
        price: 15,
        is_active: true,
        created_at: new Date().toISOString()
      },
      {
        id: 'ad-5',
        name: 'Spot 5',
        description: 'Fifth',
        url: 'https://spot5.com',
        image_url: '',
        position: 5,
        price: 3,
        is_active: true,
        created_at: new Date().toISOString()
      }
    ]

    const slots = build20SlotsList(activeAds)
    assert.strictEqual(slots.length, 20)

    // Slot 1 is occupied ($15, next: $16)
    assert.strictEqual(slots[0].isAvailable, false)
    assert.strictEqual(slots[0].currentPrice, 15)
    assert.strictEqual(slots[0].nextPrice, 16)

    // Slot 2 is free ($1, next: $1)
    assert.strictEqual(slots[1].isAvailable, true)
    assert.strictEqual(slots[1].currentPrice, 1)

    // Slot 5 is occupied ($3, next: $4)
    assert.strictEqual(slots[4].isAvailable, false)
    assert.strictEqual(slots[4].currentPrice, 3)
    assert.strictEqual(slots[4].nextPrice, 4)

    // Count available slots
    const availableCount = slots.filter(s => s.isAvailable).length
    assert.strictEqual(availableCount, 18)
  })
})
