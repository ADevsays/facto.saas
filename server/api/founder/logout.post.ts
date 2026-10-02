import { supabase } from '~/server/lib/supabase'

export default defineEventHandler(async (event) => {
  const token = getCookie(event, 'facto_founder_token') || getHeader(event, 'x-founder-token')
  if (token) {
    await supabase.from('founder_sessions').delete().eq('token', token)
  }
  deleteCookie(event, 'facto_founder_token', { path: '/' })
  return { success: true }
})
