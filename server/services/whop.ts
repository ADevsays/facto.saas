import { supabase } from '~/server/lib/supabase'
import type { WhopMembership } from '~/modules/ads/types'

export const whopService = {
  async activateMembership(user: { id: string, email: string }, membershipId: string, customId?: string) {
    const record: any = {
      whop_user_id: user.id,
      whop_membership_id: membershipId,
      email: user.email,
      status: 'active',
      used: false
    }
    if (customId) {
      record.id = customId
    }

    return supabase.from('whop_memberships').upsert(record, { onConflict: 'whop_user_id' })
  },
  
  async deactivateMembership(userId: string) {
    return supabase
      .from('whop_memberships')
      .update({ status: 'inactive' })
      .eq('whop_user_id', userId)
  },

  async getMembershipById(id: string): Promise<WhopMembership | null> {
    const { data, error } = await supabase
      .from('whop_memberships')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !data) return null
    return data as WhopMembership
  },

  async getActiveUnusedMembershipById(id: string): Promise<WhopMembership | null> {
    const { data, error } = await supabase
      .from('whop_memberships')
      .select('*')
      .eq('id', id)
      .eq('status', 'active')
      .eq('used', false)
      .single()
      
    if (error || !data) return null
    return data as WhopMembership
  },

  async getActiveUnusedMembershipByEmail(email: string): Promise<WhopMembership | null> {
    const { data, error } = await supabase
      .from('whop_memberships')
      .select('*')
      .eq('email', email)
      .eq('status', 'active')
      .eq('used', false)
      .order('created_at', { ascending: false })
      .limit(1)
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
