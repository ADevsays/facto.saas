<script setup lang="ts">
import { useSaasCalculator } from '../composables/useSaasCalculator';
import { useRankSubmit } from '../composables/useRankSubmit';
import CalcRankForm from './CalcRankForm.vue';
import { computed } from 'vue';
import es from '../locales/es.json';
import en from '../locales/en.json';
import { useLanguage } from '@/composables/useLanguage';

const { inputs, valuation, arr, adjustedMultiple, marketSegment } = useSaasCalculator();
const { form, isSubmitted, isLoading, error, userRank, chartUrl, submit } = useRankSubmit();
const { t, language } = useLanguage({ es, en });

const translatedSegment = computed(() => {
    const id = marketSegment.value.id;
    return t.value.calculator.results.segments[id];
});

const handleSubmit = async () => {
    await submit({
        valuation: valuation.value,
        arr: arr.value,
        growthRate: inputs.value.growthRate,
        churnRate: inputs.value.churnRate,
        marginPercent: inputs.value.marginPercent,
        marketLabel: translatedSegment.value.label,
        adjustedMultiple: adjustedMultiple.value,
        language: language.value
    });
    
    if (chartUrl.value) {
        console.log('--- REPORTE GENERADO ---');
        console.log('Chart URL:', chartUrl.value);
        console.log('------------------------');
    }
};
</script>

<template>
    <div class="flex flex-col gap-4 p-6 bg-[#0A0A0C] border border-white/5 rounded-2xl">

        <div class="flex justify-between items-center">
            <span class="font-sans text-[11px] font-medium tracking-[0.15em] uppercase text-white/40">{{ t?.calculator.ranking.title }}</span>
            <span 
                class="font-sans text-[11px] font-medium tracking-[0.1em] uppercase transition-colors"
                :class="isSubmitted ? 'text-cyan-400' : 'text-[#00D4FF]/60'"
            >
                {{ isSubmitted ? t?.calculator.ranking.unlocked : t?.calculator.ranking.locked }}
            </span>
        </div>

        <Transition name="fade" mode="out-in">
            <div v-if="!isSubmitted" key="locked" class="flex flex-col gap-4">

                <!-- Blurred rank bar -->
                <div class="select-none" aria-hidden="true">
                    <div class="flex items-center justify-between mb-2">
                        <span class="font-sans text-[11px] text-white/25">{{ t?.calculator.ranking.hint }}</span>
                        <span class="font-mono text-sm font-semibold text-white blur-[6px]">{{ t?.calculator.ranking.top }} 23%</span>
                    </div>
                    <div class="relative h-1.5 rounded-full bg-white/5 overflow-hidden">
                        <div class="h-full rounded-full bg-[#00D4FF]/40 blur-sm" style="width: 77%" />
                    </div>
                </div>

                <div class="h-px bg-white/[0.04]" />

                <p class="font-sans text-xs text-white/30 leading-relaxed m-0">
                    {{ t?.calculator.ranking.description }}
                </p>

                <CalcRankForm
                    v-model="form"
                    :is-loading="isLoading"
                    @submit="handleSubmit"
                />

                <p v-if="error" class="font-sans text-xs text-red-400/70 m-0">{{ error }}</p>
            </div>

            <div v-else key="done" class="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-2 duration-700">
                <div class="flex flex-col gap-3">
                    <div class="flex items-center justify-between bg-cyan-400/5 border border-cyan-400/10 rounded-xl p-4">
                        <span class="font-sans text-[11px] text-white/40 uppercase tracking-widest">{{ t?.calculator.ranking.unlockedTitle }}</span>
                        <span class="font-serif text-2xl font-bold text-cyan-400">{{ t?.calculator.ranking.top }} {{ userRank }}%</span>
                    </div>
                </div>

                <div class="h-px bg-white/[0.04]" />

                <div class="flex flex-col gap-1">
                    <span class="font-sans text-sm font-medium text-white">{{ t?.calculator.ranking.reportSent }}</span>
                    <p class="font-sans text-xs text-white/30 leading-relaxed m-0">
                        {{ t?.calculator.ranking.reportHint }} <span class="text-white/60 underline decoration-white/10">{{ form.email }}</span>.
                    </p>
                </div>
            </div>
        </Transition>
    </div>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active {
    transition: opacity 0.25s ease;
}
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
