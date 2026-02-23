import { supabase } from '~/server/lib/supabase'

export default defineEventHandler(async () => {
    const [totalResult, gatewayResult, motivationResult, dailyResult] = await Promise.all([
        supabase
            .from('beta_leads')
            .select('id', { count: 'exact', head: true }),

        supabase
            .from('beta_leads')
            .select('gateway'),

        supabase
            .from('beta_leads')
            .select('motivation'),

        supabase
            .from('beta_leads')
            .select('submitted_at')
            .gte('submitted_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
            .order('submitted_at', { ascending: true }),
    ])

    if (totalResult.error || gatewayResult.error || motivationResult.error || dailyResult.error) {
        throw createError({ statusCode: 500, message: 'Failed to fetch stats' })
    }

    const gatewayCounts = (gatewayResult.data ?? []).reduce<Record<string, number>>((acc, { gateway }) => {
        acc[gateway] = (acc[gateway] ?? 0) + 1
        return acc
    }, {})

    const motivationCounts = (motivationResult.data ?? []).reduce<Record<string, number>>((acc, { motivation }) => {
        acc[motivation] = (acc[motivation] ?? 0) + 1
        return acc
    }, {})

    // Initialize the last 30 days with 0
    const dailyCounts: Record<string, number> = {}
    const now = new Date()
    for (let i = 29; i >= 0; i--) {
        const d = new Date(now)
        d.setDate(d.getDate() - i)
        const day = d.toISOString().slice(0, 10)
        dailyCounts[day] = 0
    }

    // Populate with actual data
    if (dailyResult.data) {
        dailyResult.data.forEach(({ submitted_at }) => {
            const day = submitted_at.slice(0, 10)
            if (dailyCounts[day] !== undefined) {
                dailyCounts[day]++
            }
        })
    }

    return {
        total: totalResult.count ?? 0,
        byGateway: gatewayCounts,
        byMotivation: motivationCounts,
        byDay: dailyCounts,
    }
})
