import { supabase } from '~/server/lib/supabase'

export interface CalculatorMetrics {
    email: string
    valuation: number
    arr: number
    growthRate: number
    churnRate: number
    marginPercent: number
    marketLabel: string
    adjustedMultiple: number
}

export const saveCalculatorResult = async (metrics: CalculatorMetrics) => {
    const { error } = await supabase
        .from('calculator_results')
        .insert({
            email: metrics.email.trim().toLowerCase(),
            valuation: Number(metrics.valuation),
            arr: Number(metrics.arr),
            growth_rate: Number(metrics.growthRate),
            churn_rate: Number(metrics.churnRate),
            margin_percent: Number(metrics.marginPercent),
            market_label: metrics.marketLabel,
            adjusted_multiple: Number(metrics.adjustedMultiple)
        })

    if (error) {
        console.error('[Calculator Utility] Error saving result:', error)
        throw error
    }
}

export const calculateRanking = async (valuation: number) => {
    const [totalRes, higherRes] = await Promise.all([
        supabase
            .from('calculator_results')
            .select('id', { count: 'exact', head: true }),
        supabase
            .from('calculator_results')
            .select('id', { count: 'exact', head: true })
            .gt('valuation', valuation)
    ])

    const total = totalRes.count || 1
    const higher = higherRes.count || 0

    // Percentile rank: (Higher than user / Total) * 100
    // If you are the highest, higher is 0 -> Top 1%
    return Math.max(1, Math.round((higher / total) * 100))
}

/**
 * Genera la URL de QuickChart para el reporte de ranking.
 * Sigue el estilo sobrio de Facto con una campana de Gauss y percentiles.
 */
export const getRankingChartUrl = (userPercentile: number) => {
    // Configuración de la campana de Gauss (Normal Distribution) básica
    const marketData = [
        { x: 0, y: 1 }, { x: 10, y: 5 }, { x: 25, y: 40 }, 
        { x: 50, y: 100 }, { x: 75, y: 40 }, { x: 90, y: 10 }, { x: 100, y: 1 }
    ]

    // Mapeamos el ranking directamente al eje X (Top %):
    // 100% (izquierda, peor) -> 0% (derecha, mejor)
    // El eje X ahora representará el "Top X%" directamente.
    const userX = userPercentile
    
    const userY = userX >= 50 
        ? ((100 - userX) / 50) * 100 
        : (userX / 50) * 100

    const chartConfig = {
        type: 'line',
        data: {
            datasets: [
                {
                    label: 'Mercado',
                    // Invertimos la campana para que coincida con el eje "Top %"
                    // x: 100 (Top 100%, peor) -> x: 0 (Top 0%, mejor)
                    data: [
                        { x: 100, y: 1 }, { x: 90, y: 10 }, { x: 75, y: 40 }, 
                        { x: 50, y: 100 }, { x: 25, y: 40 }, { x: 10, y: 10 }, { x: 0, y: 1 }
                    ],
                    borderColor: 'rgba(255,255,255,0.15)',
                    backgroundColor: 'rgba(0,212,255,0.03)',
                    fill: true,
                    pointRadius: 0,
                    borderWidth: 2,
                    tension: 0.4
                },
                {
                    label: 'Tu Posicion',
                    data: [{ x: userX, y: 0 }, { x: userX, y: userY }],
                    borderColor: '#00D4FF',
                    borderWidth: 2,
                    borderDash: [5, 5],
                    pointRadius: 0
                },
                {
                    label: 'Tu Punto',
                    data: [{ x: userX, y: userY }],
                    pointBackgroundColor: '#00D4FF',
                    pointBorderColor: '#fff',
                    pointRadius: 7,
                    showLine: false
                }
            ]
        },
        options: {
            plugins: { legend: { display: false } },
            scales: {
                x: {
                    type: 'linear',
                    // El eje va de 100 (peor) a 0 (mejor)
                    min: 0,
                    max: 100,
                    reverse: true, // Invertimos para que el 0 (Top 1%) esté a la derecha
                    title: {
                        display: true,
                        text: 'POSICIÓN EN EL MERCADO (TOP %)',
                        color: '#666',
                        font: { size: 10, weight: 'bold' }
                    },
                    grid: { color: 'rgba(255,255,255,0.05)' },
                    ticks: {
                        color: '#444',
                        // Mostramos "Top X%" en lugar de solo el número
                        callback: (val: number) => val === 50 ? 'Top 50% (Media)' : `Top ${val}%`
                    }
                },
                y: {
                    beginAtZero: true,
                    title: { display: true, text: 'FRECUENCIA', color: '#555', font: { size: 9 } },
                    grid: { display: false },
                    ticks: { display: false }
                }
            }
        }
    }

    const encodedConfig = encodeURIComponent(JSON.stringify(chartConfig))
    return `https://quickchart.io/chart?v=4&c=${encodedConfig}&bkg=%230A0A0C&w=600&h=300`
}
