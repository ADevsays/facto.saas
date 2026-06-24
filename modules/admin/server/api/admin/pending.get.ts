import { supabase } from '~/server/lib/supabase'

export default defineEventHandler(async (event) => {
  const adminKey = getHeader(event, 'x-admin-key')
  if (adminKey !== process.env.ADMIN_SECRET_KEY) {
    throw createError({ statusCode: 401, message: 'Unauthorized' })
  }

  const { data, error } = await supabase
    .from('saas_entries')
    .select(`
      id, name, slug, logo_url, website_url, founder_email, startup_type, published_at,
      categories!saas_categories ( name, slug )
    `)
    .eq('status', 'pending_review')
    .order('published_at', { ascending: false, nullsFirst: false })

  if (error) {
    throw createError({ statusCode: 500, message: 'Failed to fetch pending entries' })
  }

  return data ?? []
})
