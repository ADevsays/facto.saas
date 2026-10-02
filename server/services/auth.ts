import { supabase } from '~/server/lib/supabase'

export const authService = {
  async createUser(email: string, password?: string) {
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    })
    
    if (error || !data.user) {
      throw new Error(error?.message || 'Failed to create user')
    }
    
    return data.user
  },

  async getOrCreateUser(email: string, password?: string) {
    try {
      return await this.createUser(email, password)
    } catch (err: any) {
      if (err.message?.toLowerCase().includes('already') || err.message?.toLowerCase().includes('exists')) {
        const { data } = await supabase.auth.admin.listUsers()
        const found = data?.users?.find(u => u.email?.toLowerCase() === email.toLowerCase())
        if (found) return found
      }
      throw err
    }
  }
}
