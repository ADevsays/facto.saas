import { supabase } from '~/server/lib/supabase'

export default defineEventHandler(async () => {
  const { data } = await supabase
    .from('saas_entries')
    .select('slug, published_at')
    .not('published_at', 'is', null)
    .order('published_at', { ascending: false })

  if (!data) return []

  return data.map((entry) => ({
    loc: `/saas/${entry.slug}`,
    lastmod: entry.published_at ?? undefined,
  }))
})
