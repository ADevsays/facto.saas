import { supabase } from '~/server/lib/supabase'
import type { Ad, AdSlot } from '../../types'
import { sendOutbidNotification } from './adEmail'

function parseAdRecord(raw: any): Ad {
  const ad: Ad = {
    id: raw.id,
    name: raw.name,
    description: raw.description || '',
    url: raw.url,
    image_url: raw.image_url || '',
    is_active: raw.is_active,
    created_at: raw.created_at,
    user_id: raw.user_id,
    whop_membership_id: raw.whop_membership_id,
    position: raw.position !== undefined && raw.position !== null ? Number(raw.position) : undefined,
    price: raw.price !== undefined && raw.price !== null ? Number(raw.price) : undefined,
    email: raw.email,
    is_affiliate: raw.is_affiliate
  }

  // If position is not directly on the DB column, parse from encoded metadata in description
  if (ad.position === undefined || ad.position === null) {
    const metaMatch = ad.description?.match(/<!--meta:(\{.*?\})-->/)
    if (metaMatch) {
      try {
        const meta = JSON.parse(metaMatch[1])
        if (meta.position !== undefined) ad.position = Number(meta.position)
        if (meta.price !== undefined) ad.price = Number(meta.price)
        if (meta.email !== undefined) ad.email = meta.email
        if (meta.is_affiliate !== undefined) ad.is_affiliate = meta.is_affiliate
      } catch (_) {}
    }
  }

  // Strip metadata tag from public description
  if (ad.description) {
    ad.description = ad.description.replace(/<!--meta:\{.*?\}-->/, '').trim()
  }

  return ad
}

export const adsService = {
  async getActiveAds(): Promise<Ad[]> {
    try {
      const { data, error } = await supabase
        .from('ads')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: true })

      if (error) {
        console.error('[AdsService] Error fetching active ads:', error.message)
        return []
      }

      const list = (data || []).map(parseAdRecord)
      return list.sort((a, b) => (a.position || 99) - (b.position || 99))
    } catch (err) {
      console.error('[AdsService] Exception in getActiveAds:', err)
      return []
    }
  },

  async getAuctionSlots(): Promise<AdSlot[]> {
    const activeAds = await this.getActiveAds()
    const adsByPosition = new Map<number, Ad>()

    for (const ad of activeAds) {
      const pos = Number(ad.position)
      if (pos >= 1 && pos <= 20) {
        adsByPosition.set(pos, ad)
      }
    }

    const slots: AdSlot[] = []
    for (let pos = 1; pos <= 20; pos++) {
      const ad = adsByPosition.get(pos) || null
      const basePrice = pos === 1 ? 10 : 1
      if (ad) {
        const currentPrice = Number(ad.price) > 0 ? Number(ad.price) : basePrice
        slots.push({
          position: pos,
          ad,
          currentPrice,
          nextPrice: Math.max(currentPrice + 1, basePrice + 1),
          isAvailable: false
        })
      } else {
        slots.push({
          position: pos,
          ad: null,
          currentPrice: basePrice,
          nextPrice: basePrice,
          isAvailable: true
        })
      }
    }

    return slots
  },

  async deactivateAdByMembershipId(membershipId: string) {
    return supabase
      .from('ads')
      .update({ is_active: false })
      .eq('whop_membership_id', membershipId)
  },

  async claimSlot(adData: {
    position: number
    name: string
    description?: string
    url: string
    image_url?: string
    price: number
    email?: string
    user_id?: string
    whop_membership_id?: string
    is_affiliate?: boolean
  }): Promise<Ad> {
    const slotNumber = Math.max(1, Math.min(20, Math.floor(adData.position)))

    // 1. Deactivate previous ad on this slot and notify if applicable
    try {
      const activeAds = await this.getActiveAds()
      const prevAds = activeAds.filter(a => a.position === slotNumber)

      for (const prevAd of prevAds) {
        await supabase
          .from('ads')
          .update({ is_active: false })
          .eq('id', prevAd.id)

        if (prevAd.email) {
          sendOutbidNotification({
            to: prevAd.email,
            slot: slotNumber,
            oldPrice: prevAd.price || 1,
            newPrice: adData.price,
            adName: prevAd.name || 'tu anuncio'
          }).catch(e => console.error('[AdsService] Outbid notification error:', e))
        }
      }
    } catch (checkErr) {
      console.warn('[AdsService] Non-fatal check error:', checkErr)
    }

    // 2. Format description with embedded metadata tag for backward compatibility
    const metaTag = `<!--meta:${JSON.stringify({
      position: slotNumber,
      price: adData.price,
      email: adData.email || '',
      is_affiliate: !!adData.is_affiliate
    })}-->`

    const cleanDescription = (adData.description || '').trim()
    const descriptionWithMeta = cleanDescription ? `${cleanDescription} ${metaTag}` : metaTag

    // 3. Try to insert new ad with native columns first
    const payload: Record<string, any> = {
      name: adData.name,
      description: descriptionWithMeta,
      url: adData.url,
      image_url: adData.image_url || '',
      position: slotNumber,
      price: adData.price,
      is_active: true
    }

    if (adData.email) payload.email = adData.email
    if (adData.user_id) payload.user_id = adData.user_id
    if (adData.whop_membership_id) payload.whop_membership_id = adData.whop_membership_id
    if (adData.is_affiliate !== undefined) payload.is_affiliate = adData.is_affiliate

    const { data, error } = await supabase
      .from('ads')
      .insert(payload)
      .select()
      .single()

    if (error) {
      // Fallback if schema columns are not yet applied in Supabase
      if (error.message?.includes('column')) {
        console.warn('[AdsService] Schema columns missing in DB, inserting base columns with metadata tag:', error.message)
        const fallbackPayload: Record<string, any> = {
          name: adData.name,
          description: descriptionWithMeta,
          url: adData.url,
          image_url: adData.image_url || '',
          is_active: true
        }
        if (adData.user_id) fallbackPayload.user_id = adData.user_id
        if (adData.whop_membership_id) fallbackPayload.whop_membership_id = adData.whop_membership_id

        const { data: fallbackData, error: fallbackError } = await supabase
          .from('ads')
          .insert(fallbackPayload)
          .select()
          .single()

        if (fallbackError) throw new Error('Error creating ad: ' + fallbackError.message)
        return parseAdRecord(fallbackData)
      }
      throw new Error('Error creating ad: ' + error.message)
    }

    return parseAdRecord(data)
  },

  async createAd(adData: {
    name: string
    description: string
    url: string
    image_url: string
    user_id: string
    whop_membership_id: string
    position?: number
    price?: number
    email?: string
  }) {
    return this.claimSlot({
      position: adData.position || 1,
      name: adData.name,
      description: adData.description,
      url: adData.url,
      image_url: adData.image_url,
      price: adData.price || 1,
      user_id: adData.user_id,
      whop_membership_id: adData.whop_membership_id,
      email: adData.email
    })
  }
}
