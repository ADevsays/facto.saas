<script setup lang="ts">
import { computed, ref } from 'vue';
import { useSaasCalculator } from '../composables/useSaasCalculator';
import { useAddSaasModal } from '~/composables/useAddSaasModal';
import MetricBar from './MetricBar.vue';
import es from '../locales/es.json';
import en from '../locales/en.json';
import { useLanguage } from '@/composables/useLanguage';

const { inputs, valuation, arr, adjustedMultiple, marketSegment } = useSaasCalculator();
const { open: openAddSaas } = useAddSaasModal();
const { t } = useLanguage({ es, en });

// ─── Health score ───────────────────────────────────────────────────────────
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

// ─── Percentil estimado (local, sin llamada al servidor) ─────────────────────
// Modelo simple: interpolación basada en health score
const estimatedPercentile = computed(() => {
    // 100% health → top 5%, 0% health → top 95%
    return Math.round(5 + (100 - healthScore.value) * 0.9);
});

// ─── CTA a Facto ─────────────────────────────────────────────────────────────
const handleAddToFacto = () => {
    openAddSaas({
        websiteUrl: '',   // el usuario lo rellena en el modal
    });
};
</script>

<template>
    <div class="flex flex-col gap-0 bg-[#0A0A0C] border border-white/5 rounded-2xl overflow-hidden">

        <!-- ══ SECCIÓN SUPERIOR: Salud ══════════════════════════════════════ -->
        <div class="flex flex-col gap-4 p-6">
            <div class="flex justify-between items-center">
                <span class="font-sans text-[11px] font-medium tracking-[0.15em] uppercase text-white/45">
                    {{ t?.calculator.health.title }}
                </span>
                <span
                    class="font-sans text-[13px] font-semibold transition-colors duration-300"
                    :style="{ color: healthColor(healthScore) }"
                >
                    {{ healthScore }}/100
                </span>
            </div>

            <MetricBar :value="healthScore" :color="healthColor(healthScore)" :label="`${healthScore}%`" />

            <div class="flex flex-col gap-3 pt-4 border-t border-white/[0.04]">
                <div class="flex items-center gap-3">
                    <span class="font-sans text-[11px] text-white/35 min-w-[68px]">{{ t?.calculator.health.growth }}</span>
                    <MetricBar :value="growthScore" :max="40" color="#00D4FF" :label="`${inputs.growthRate}%`" />
                </div>
                <div class="flex items-center gap-3">
                    <span class="font-sans text-[11px] text-white/35 min-w-[68px]">{{ t?.calculator.health.retention }}</span>
                    <MetricBar :value="retentionScore" :max="40" color="#34D399" :label="`${(100 - inputs.churnRate).toFixed(0)}%`" />
                </div>
                <div class="flex items-center gap-3">
                    <span class="font-sans text-[11px] text-white/35 min-w-[68px]">{{ t?.calculator.health.margin }}</span>
                    <MetricBar :value="marginScore" :max="20" color="#A78BFA" :label="`${inputs.marginPercent}%`" />
                </div>
            </div>
        </div>

        <!-- ══ DIVISOR ══════════════════════════════════════════════════════ -->
        <div class="h-px bg-white/[0.04] mx-6" />

        <!-- ══ SECCIÓN INFERIOR: Tu posición → CTA Facto ══════════════════ -->
        <div class="flex flex-col gap-4 p-6">

            <!-- Título con estado -->
            <div class="flex justify-between items-center">
                <span class="font-sans text-[11px] font-medium tracking-[0.15em] uppercase text-white/45">
                    {{ t?.calculator.ranking.title }}
                </span>
                <span class="font-sans text-[11px] font-medium tracking-[0.1em] uppercase text-[#00D4FF]/60">
                    {{ t?.calculator.ranking.locked }}
                </span>
            </div>

            <!-- Barra de posición borrosa -->
            <div class="select-none" aria-hidden="true">
                <div class="flex items-center justify-between mb-2">
                    <span class="font-sans text-[11px] text-white/60">{{ t?.calculator.ranking.hint }}</span>
                    <span class="font-mono text-sm font-semibold text-white blur-[5px]">
                        {{ t?.calculator.ranking.top }} {{ estimatedPercentile }}%
                    </span>
                </div>
                <div class="relative h-1.5 rounded-full bg-white/5 overflow-hidden">
                    <div
                        class="h-full rounded-full bg-[#00D4FF]/40 blur-sm transition-all duration-700"
                        :style="`width: ${100 - estimatedPercentile}%`"
                    />
                </div>
            </div>

            <div class="h-px bg-white/[0.04]" />

            <!-- CTA -->
            <div class="flex flex-col gap-3">
                <p class="font-sans text-[13px] font-light text-white/55 leading-relaxed m-0">
                    Añade tu startup a Facto para que tu posición sea real, pública y compartible.
                </p>

                <button
                    type="button"
                    @click="handleAddToFacto"
                    class="group w-full flex items-center justify-center gap-2 bg-white text-black font-bold uppercase tracking-widest text-[10px] rounded-full py-3 px-6 hover:scale-[1.02] transition-all duration-500 shadow-[0_0_15px_rgba(255,255,255,0.2),0_0_30px_rgba(0,212,255,0.1)] cursor-pointer"
                >
                    <svg class="w-3.5 h-3.5 transition-transform duration-300 group-hover:rotate-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                    Añadir mi startup a Facto
                </button>

                <p class="font-sans text-[10px] text-white/20 text-center tracking-wide m-0">
                    Gratis · Sin tarjeta · Apareces en el directorio
                </p>
            </div>
        </div>
    </div>
</template>
