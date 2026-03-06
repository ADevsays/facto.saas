import { supabase } from '~/server/lib/supabase'
import { saveCalculatorResult, calculateRanking, getRankingChartUrl } from '~/modules/leadmagnets/server/services/calculator'
import { generateFoundersReport } from '~/modules/leadmagnets/server/services/report'
import { sendFoundersReport } from '~/modules/leadmagnets/server/services/email'

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

export const processCalculatorLead = async (data: any) => {
    const { 
        email, 
        valuation, 
        arr, 
        growthRate, 
        churnRate, 
        marginPercent, 
        marketLabel, 
        adjustedMultiple, 
        language = 'es' 
    } = data

    // 1. Guardar resultados técnicos
    await saveCalculatorResult({
        email,
        valuation,
        arr,
        growthRate,
        churnRate,
        marginPercent,
        marketLabel,
        adjustedMultiple
    })

    // 2. Cálculo de ranking
    const ranking = await calculateRanking(valuation)
    const chartUrl = getRankingChartUrl(ranking)

    const subject = language === 'en' 
        ? `Your SaaS Valuation Report: Top ${ranking}%`
        : `Tu Reporte de Valoración SaaS: Top ${ranking}%`

    // 3. Generar reporte
    const reportHtml = generateFoundersReport({
        email,
        valuation,
        ranking,
        chartUrl,
        churnRate,
        growthRate,
        marginPercent,
        arr,
        language
    })
    
    // 4. Envío asíncrono
    sendFoundersReport({
        to: email,
        subject,
        html: reportHtml
    }).catch(e => console.error('[Report Email Error]:', e))

    return { ranking, chartUrl }
}
