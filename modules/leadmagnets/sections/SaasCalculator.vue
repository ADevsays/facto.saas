<script setup lang="ts">
import { ref, watch, onMounted, computed } from 'vue';
import { useSaasCalculator } from '../composables/useSaasCalculator';
import CalcHeader from '../components/CalcHeader.vue';
import CalcInputsPanel from '../components/CalcInputsPanel.vue';
import CalcValuationCard from '../components/CalcValuationCard.vue';
import CalcHealthCard from '../components/CalcHealthCard.vue';
import CalcInsightsCard from '../components/CalcInsightsCard.vue';
import CalcRankTeaser from '../components/CalcRankTeaser.vue';
import es from '../locales/es.json';
import en from '../locales/en.json';
import { useLanguage } from '@/composables/useLanguage';

const { t } = useLanguage({ es, en });

const {
    valuation,
    adjustedMultiple,
    marketSegment,
    annualProfit,
    arr,
    lowRange,
    highRange,
    formatCurrency,
    formatMultiplier,
} = useSaasCalculator();


// Animación de números
const displayValuation = ref(0);
const displayMultiplier = ref(0);

const animateNumber = (target: number, current: any, duration = 600) => {
    const start = current.value || 0;
    const diff = target - start;
    const startTime = performance.now();
    const step = (now: number) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        current.value = start + diff * eased;
        if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
};

onMounted(() => {
    displayValuation.value = valuation.value;
    displayMultiplier.value = adjustedMultiple.value;
    
    watch(valuation, (val) => animateNumber(val, displayValuation));
    watch(adjustedMultiple, (val) => animateNumber(val, displayMultiplier, 400));
});

const metricValue = computed(() =>
    marketSegment.value.metric === 'profit' ? annualProfit.value : arr.value
);

const metricLabel = computed(() =>
    marketSegment.value.metric === 'profit' ? t.value.calculator.results.metricProfit : t.value.calculator.results.metricArr
);

const translatedSegment = computed(() => {
    const id = marketSegment.value.id;
    return t.value.calculator.results.segments[id];
});
</script>

<template>
    <section class="min-h-dvh bg-[#030305] px-6 py-20 pb-32 flex items-start justify-center">
        <div class="w-full max-w-[1100px] mx-auto">

            <CalcHeader />

            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">

                <!-- Columna Izquierda: Inputs + Relleno Visual -->
                 <div class="flex flex-col gap-6">
                    <CalcInputsPanel />

                    <CalcInsightsCard />
                 </div>

                <!-- Columna Derecha: Resultados -->
                <div class="flex flex-col gap-6">
                    <CalcValuationCard
                        :market-label="translatedSegment.label"
                        :buyer-profile="translatedSegment.buyer"
                        :display-valuation="displayValuation"
                        :display-multiplier="displayMultiplier"
                        :metric-label="metricLabel"
                        :metric-value="metricValue"
                        :low-range="lowRange"
                        :high-range="highRange"
                        :format-currency="formatCurrency"
                        :format-multiplier="formatMultiplier"
                    />
                    
                    <CalcHealthCard />

                    <CalcRankTeaser />
                    
                </div>
            </div>

        </div>

    </section>
</template>
