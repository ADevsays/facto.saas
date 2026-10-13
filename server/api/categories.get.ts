import { supabase } from '~/server/lib/supabase'

export default defineEventHandler(async (event) => {
  setResponseHeaders(event, {
    'Cache-Control': 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400',
    'CDN-Cache-Control': 'max-age=3600, stale-while-revalidate=86400',
    'Vercel-CDN-Cache-Control': 's-maxage=3600, stale-while-revalidate=86400'
  })

  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name', { ascending: true })

  if (error) throw createError({ statusCode: 500, message: error.message })

  return data ?? []
})
