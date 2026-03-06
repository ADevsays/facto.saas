import { saveLead, processCalculatorLead } from '~/server/services/leads'

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const { 
        email, 
        startupUrl, 
        gateway, 
        motivation, 
        source,
        language = 'es'
    } = body

    if (!email || !startupUrl) {
        throw createError({ statusCode: 400, message: 'Faltan campos obligatorios' })
    }

    if (!email.includes('@')) {
        throw createError({ statusCode: 400, message: 'Email inválido' })
    }

    try {
        // 1. Siempre guardar el Lead como interesada en la beta
        await saveLead({
            email,
            startupUrl,
            gateway,
            motivation,
            source
        })

        let extras: { ranking: number | null, chartUrl: string | null } = { ranking: null, chartUrl: null }

        // 2. Si el lead viene de la calculadora, procesamos el reporte y ranking
        if (source === 'calculator' && body.valuation !== undefined) {
            extras = await processCalculatorLead({ ...body, language })
        }
    
        return { 
            success: true,
            ...extras
        }

    } catch (err: any) {
        console.error('[API Leads Error]:', err)
        
        if (err.code === '23505') {
            throw createError({ statusCode: 409, message: 'Este email ya está registrado.' })
        }
        
        throw createError({ 
            statusCode: 500, 
            message: 'No pudimos guardar tus datos en este momento. Inténtalo de nuevo.' 
        })
    }
})
