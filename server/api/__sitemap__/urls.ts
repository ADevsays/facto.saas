import { supabase } from '~/server/lib/supabase'

import { slugify } from '~/utils/slugify'

export default defineEventHandler(async () => {
  const { data } = await supabase
    .from('saas_entries')
    .select('name, is_incognito, published_at, status')
    .eq('status', 'published')
    .order('published_at', { ascending: false })

  if (!data) return []

  return data
    .filter((entry) => !entry.is_incognito && entry.name)
    .map((entry) => ({
      loc: `/saas/${slugify(entry.name!)}`,
      lastmod: entry.published_at ?? undefined,
    }))
})
