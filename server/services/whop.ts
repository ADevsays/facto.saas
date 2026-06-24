import { supabase } from '~/server/lib/supabase'
import type { WhopMembership } from '~/modules/ads/types'

export const whopService = {
  async activateMembership(user: { id: string, email: string }, membershipId: string) {
    return supabase.from('whop_memberships').upsert({
      whop_user_id: user.id,
      whop_membership_id: membershipId,
      email: user.email,
      status: 'active',
      used: false
    }, { onConflict: 'whop_user_id' })
  },
  
  async deactivateMembership(userId: string) {
    return supabase
      .from('whop_memberships')
      .update({ status: 'inactive' })
      .eq('whop_user_id', userId)
  },

  async getActiveUnusedMembershipByEmail(email: string): Promise<WhopMembership | null> {
    const { data, error } = await supabase
      .from('whop_memberships')
      .select('*')
      .eq('email', email)
      .eq('status', 'active')
      .eq('used', false)
      .single()
      
    if (error || !data) return null
    return data as WhopMembership
  },

  async markMembershipAsUsed(id: string) {
    return supabase
      .from('whop_memberships')
      .update({ used: true })
      .eq('id', id)
  }
}
