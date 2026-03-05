import * as TIPS_ES from '../../const/tips.es'
import * as TIPS_EN from '../../const/tips.en'
import type { Tip } from '../../const/tips'
import { generateReportHtml } from '../utils/emailTemplates'

export interface ReportMetrics {
    email: string
    valuation: number
    ranking: number
    chartUrl: string
    churnRate: number
    growthRate: number
    marginPercent: number
    arr: number
    language?: string
}

export const generateFoundersReport = (metrics: ReportMetrics) => {
    const { 
        valuation, 
        ranking, 
        chartUrl, 
        churnRate, 
        growthRate, 
        marginPercent,
        arr 
    } = metrics

    const language = metrics.language || 'es'
    const TIPS = language === 'en' ? TIPS_EN : TIPS_ES

    // 1. Selección de Tips: siempre uno por categoría
    const tips: Tip[] = []
    
    // Churn: > 5% malo, 2-5% normal, < 2% excelente
    tips.push(churnRate > 5 ? TIPS.TIPS_CHURN.high : churnRate < 2 ? TIPS.TIPS_CHURN.low : TIPS.TIPS_CHURN.medium)

    // Growth: < 15% bajo, 15-40% normal, > 40% excepcional
    tips.push(growthRate < 15 ? TIPS.TIPS_GROWTH.low : growthRate > 40 ? TIPS.TIPS_GROWTH.high : TIPS.TIPS_GROWTH.medium)

    // Margen: < 60% bajo, 60-80% normal, > 80% excepcional
    tips.push(marginPercent < 60 ? TIPS.TIPS_MARGIN.low : marginPercent > 80 ? TIPS.TIPS_MARGIN.high : TIPS.TIPS_MARGIN.medium)

    // 2. Cálculo de Proyección Proyectada (Mejora del 30% en la métrica más débil)
    let optimizedValuation = valuation * 1.3
    let weakMetric = language === 'en' ? 'Operational Efficiency' : 'Eficiencia Operativa'

    if (churnRate > 5) {
        weakMetric = language === 'en' ? 'Retention (Churn)' : 'Retención (Churn)'
        optimizedValuation = valuation * 1.5 // El churn impacta más en el múltiplo
    } else if (growthRate < 15) {
        weakMetric = language === 'en' ? 'Growth Rate' : 'Ritmo de Crecimiento'
        optimizedValuation = valuation * 1.4
    }

    // 3. Formateo de moneda
    const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0
    })

    const html = generateReportHtml({
        email: metrics.email,
        valuation: formatter.format(valuation),
        ranking: ranking,
        chartUrl: chartUrl,
        tips: tips.slice(0, 3), // Máximo 3 tips para no saturar
        projections: {
            current: formatter.format(valuation),
            optimized: formatter.format(optimizedValuation),
            metric: weakMetric
        },
        language
    })

    return html
}
