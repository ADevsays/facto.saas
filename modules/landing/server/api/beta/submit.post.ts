import { supabase } from '~/server/lib/supabase'

export default defineEventHandler(async (event) => {
    const { email, startupUrl, gateway, motivation } = await readBody(event)

    if (!email || !startupUrl || !gateway || !motivation) {
        throw createError({ statusCode: 400, message: 'Missing required fields' })
    }

    if (!email.includes('@')) {
        throw createError({ statusCode: 400, message: 'Invalid email' })
    }

    const { error } = await supabase
        .from('beta_leads')
        .insert({
            email: email.trim().toLowerCase(),
            startup_url: startupUrl.trim(),
            gateway,
            motivation,
        })

    if (error?.code === '23505') {
        throw createError({ statusCode: 409, message: 'Email already registered' })
    }

    if (error) {
        throw createError({ statusCode: 500, message: 'Failed to save lead' })
    }

    return { success: true }
})
