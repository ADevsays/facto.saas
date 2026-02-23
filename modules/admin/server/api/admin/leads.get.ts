import { supabase } from '~/server/lib/supabase'

export default defineEventHandler(async (event) => {
    const query = getQuery(event)
    const page = Number(query.page ?? 1)
    const limit = Number(query.limit ?? 20)
    const from = (page - 1) * limit
    const to = from + limit - 1

    const { data, error, count } = await supabase
        .from('beta_leads')
        .select('id, email, startup_url, gateway, motivation, submitted_at', { count: 'exact' })
        .order('submitted_at', { ascending: false })
        .range(from, to)

    if (error) {
        throw createError({ statusCode: 500, message: 'Failed to fetch leads' })
    }

    return {
        leads: data,
        total: count ?? 0,
        page,
        limit,
    }
})
