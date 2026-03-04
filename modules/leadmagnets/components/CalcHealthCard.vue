<script setup lang="ts">
import MetricBar from './MetricBar.vue';
import { useSaasCalculator } from '../composables/useSaasCalculator';

const { inputs } = useSaasCalculator();

const healthColor = (score: number) => {
    if (score >= 75) return '#34D399';
    if (score >= 50) return '#00D4FF';
    if (score >= 30) return '#F59E0B';
    return '#F87171';
};

const growthScore    = computed(() => Math.min(inputs.value.growthRate / 30 * 40, 40));
const retentionScore = computed(() => Math.max((1 - inputs.value.churnRate / 10) * 40, 0));
const marginScore    = computed(() => Math.min(inputs.value.marginPercent / 100 * 20, 20));

const healthScore = computed(() => {
    const raw = growthScore.value + retentionScore.value + marginScore.value;
    const sustainability = inputs.value.marginPercent < 20
        ? (inputs.value.marginPercent / 20) * 0.3 + 0.7
        : 1.0;
    return Math.min(Math.round(raw * sustainability), 100);
});
</script>

<template>
    <div class="flex flex-col gap-4 p-6 bg-[#0A0A0C] border border-white/5 rounded-2xl">
        <div class="flex justify-between items-center">
            <span class="font-sans text-[11px] font-medium tracking-[0.15em] uppercase text-white/40">Salud del negocio</span>
            <span class="font-sans text-[13px] font-semibold transition-colors duration-300" :style="{ color: healthColor(healthScore) }">
                {{ healthScore }}/100
            </span>
        </div>

        <MetricBar :value="healthScore" :color="healthColor(healthScore)" :label="`${healthScore}%`" />

        <div class="flex flex-col gap-3 pt-4 border-t border-white/[0.04]">
            <div class="flex items-center gap-3">
                <span class="font-sans text-[11px] text-white/30 min-w-[68px]">Crecimiento</span>
                <MetricBar :value="growthScore" :max="40" color="#00D4FF" :label="`${inputs.growthRate}%`" />
            </div>
            <div class="flex items-center gap-3">
                <span class="font-sans text-[11px] text-white/30 min-w-[68px]">Retención</span>
                <MetricBar :value="retentionScore" :max="40" color="#34D399" :label="`${(100 - inputs.churnRate).toFixed(0)}%`" />
            </div>
            <div class="flex items-center gap-3">
                <span class="font-sans text-[11px] text-white/30 min-w-[68px]">Margen</span>
                <MetricBar :value="marginScore" :max="20" color="#A78BFA" :label="`${inputs.marginPercent}%`" />
            </div>
        </div>
    </div>
</template>
