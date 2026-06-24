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
  }
}
