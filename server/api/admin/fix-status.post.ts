import { supabase } from '~/server/lib/supabase'

export default defineEventHandler(async (event) => {
  const adminKey = getHeader(event, 'x-admin-key')
  if (adminKey !== process.env.ADMIN_KEY) {
    throw createError({ statusCode: 401, message: 'Unauthorized' })
  }

  const { data: pending } = await supabase
    .from('saas_entries')
    .select('id, name, status')
    .eq('status', 'pending_review')

  if (!pending || pending.length === 0) {
    return { message: 'No pending entries found', fixed: 0 }
  }

  const ids = pending.map(e => e.id)

  const { data: withCategories } = await supabase
    .from('saas_categories')
    .select('saas_id')
    .in('saas_id', ids)

  const saasIdsWithCategories = [...new Set(withCategories?.map(sc => sc.saas_id) || [])]

  if (saasIdsWithCategories.length === 0) {
    return { message: 'No pending entries with categories found', pending: pending.map(e => ({ id: e.id, name: e.name })), fixed: 0 }
  }

  const { error } = await supabase
    .from('saas_entries')
    .update({ status: 'published' })
    .in('id', saasIdsWithCategories)

  if (error) throw createError({ statusCode: 500, message: error.message })

  const fixedNames = pending.filter(e => saasIdsWithCategories.includes(e.id)).map(e => e.name)

  return {
    message: `Fixed ${fixedNames.length} entries`,
    fixed: fixedNames.length,
    entries: fixedNames,
    stillPending: pending.filter(e => !saasIdsWithCategories.includes(e.id)).map(e => ({ id: e.id, name: e.name }))
  }
})
