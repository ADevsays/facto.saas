import { ref, computed } from 'vue';
import type { CalculatorInputs, MarketSegment } from '../types';
import { MARKET_SEGMENTS, THRESHOLDS } from '../const';

// Estado reactivo global para el módulo
const inputs = ref<CalculatorInputs>({
    revenueType: 'mrr',
    revenue: 5000,
    growthRate: 10,
    churnRate: 5,
    marginPercent: 70,
});

export const useSaasCalculator = () => {
    
    // Cálculos base
    const arr = computed(() => inputs.value.revenueType === 'mrr' ? inputs.value.revenue * 12 : inputs.value.revenue);
    const annualProfit = computed(() => arr.value * (inputs.value.marginPercent / 100));

    // Detección automática de segmento
    const marketSegment = computed<MarketSegment>(() => {
        const val = arr.value;
        if (val < THRESHOLDS.SMALL) return MARKET_SEGMENTS[0];
        if (val < THRESHOLDS.MEDIUM) return MARKET_SEGMENTS[1];
        if (val < THRESHOLDS.LARGE) return MARKET_SEGMENTS[2];
        return MARKET_SEGMENTS[3];
    });

    // Lógica de multiplicador (basada en el segmento con bonos/penalizaciones)
    const adjustedMultiple = computed(() => {
        const { growthRate, churnRate, marginPercent } = inputs.value;

        // Bono por crecimiento: +0.8x máximo (para 30%+ MoM). Sin cap = bono absurdo con inputs extremos.
        const growthBonus = Math.min((Math.max(growthRate - 5, 0) / 25) * 0.8, 0.8);

        // Penalización por churn: -1.0x máximo (para 10%+ churn).
        const churnPenalty = Math.min((Math.max(churnRate - 3, 0) / 7) * 1.0, 1.0);

        // Bono por margen: ±0.3x
        const marginBonus = marginPercent >= 80 ? 0.3 : marginPercent < 40 ? -0.3 : 0;

        return Math.max(marketSegment.value.baseMultiple + growthBonus - churnPenalty + marginBonus, 0.5);
    });

    // Valuación final
    const valuation = computed(() => {
        const seg = marketSegment.value;
        return seg.metric === 'profit' 
            ? annualProfit.value * adjustedMultiple.value 
            : arr.value * adjustedMultiple.value;
    });

    // Rangos (Realistas: -20% a +25%)
    const lowRange = computed(() => valuation.value * 0.8);
    const highRange = computed(() => valuation.value * 1.25);

    // Formateadores
    const formatCurrency = (val: number) => {
        if (val >= 1000000) return `$${(val / 1000000).toFixed(2)}M`;
        if (val >= 1000) return `$${(val / 1000).toFixed(0)}K`;
        return `$${Math.round(val).toLocaleString()}`;
    };

    const formatMultiplier = (val: number) => `${val.toFixed(1)}x`;

    return {
        inputs,
        arr,
        annualProfit,
        adjustedMultiple,
        marketSegment,
        valuation,
        lowRange,
        highRange,
        formatCurrency,
        formatMultiplier
    };
};
