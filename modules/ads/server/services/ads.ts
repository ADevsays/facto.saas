import { supabase } from '~/server/lib/supabase'

export const adsService = {
  async deactivateAdByMembershipId(membershipId: string) {
    return supabase
      .from('ads')
      .update({ is_active: false })
      .eq('whop_membership_id', membershipId)
  },

  async createAd(adData: { name: string, description: string, url: string, image_url: string, user_id: string, whop_membership_id: string }) {
    const { data, error } = await supabase
      .from('ads')
      .insert({
        ...adData,
        is_active: true
      })
      .select()
      .single()
      
    if (error) throw new Error('Error creating ad: ' + error.message)
    return data
  }
}
