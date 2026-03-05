import { saveLead } from '~/server/services/leads'
import { saveCalculatorResult, calculateRanking, getRankingChartUrl } from '~/modules/leadmagnets/server/services/calculator'
import { generateFoundersReport } from '~/modules/leadmagnets/server/services/report'
import { sendFoundersReport } from '~/modules/leadmagnets/server/services/email'

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const { 
        email, 
        startupUrl, 
        gateway, 
        motivation, 
        source,
        valuation,
        arr,
        growthRate,
        churnRate,
        marginPercent,
        marketLabel,
        adjustedMultiple,
        language = 'es'
    } = body

    if (!email || !startupUrl) {
        throw createError({ statusCode: 400, message: 'Faltan campos obligatorios' })
    }

    if (!email.includes('@')) {
        throw createError({ statusCode: 400, message: 'Email inválido' })
    }

    try {
        // 1. Guardar Lead (Servicio de Leads)
        await saveLead({
            email,
            startupUrl,
            gateway,
            motivation,
            source
        })

        let ranking = null
        let chartUrl = null

        // 2. Si es de la calculadora, guardar resultados y calcular ranking (Servicio de Calculadora)
        if (source === 'calculator' && valuation !== undefined) {
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

            ranking = await calculateRanking(valuation)
            chartUrl = getRankingChartUrl(ranking)

            const subject = language === 'en' 
                ? `Your SaaS Valuation Report: Top ${ranking}%`
                : `Tu Reporte de Valoración SaaS: Top ${ranking}%`

            // 3. Generar Reporte Completo (Infografía HTML)
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
            
            // 4. Enviar email con Brevo (No bloqueante para la respuesta del API)
            sendFoundersReport({
                to: email,
                subject,
                html: reportHtml
            }).catch(e => console.error('[Report Email Error]:', e))

        }
    
        return { 
            success: true,
            ranking,
            chartUrl
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
