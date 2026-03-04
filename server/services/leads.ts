import { supabase } from '~/server/lib/supabase'

export interface LeadData {
    email: string
    startupUrl: string
    gateway?: string
    motivation?: string
    source: string
}

export const saveLead = async (data: LeadData) => {
    const { email, startupUrl, gateway, motivation, source } = data

    // Upsert lead in beta_leads table
    const { data: lead, error } = await supabase
        .from('beta_leads')
        .upsert({
            email: email.trim().toLowerCase(),
            startup_url: startupUrl.trim(),
            gateway: gateway || null,
            motivation: motivation || (source === 'calculator' ? 'investment' : 'reach'),
            source: source || 'unknown'
        }, { onConflict: 'email' })
        .select('id')
        .single()

    if (error) {
        console.error('[Leads Utility] Error saving lead:', error)
        throw error
    }

    return lead
}
