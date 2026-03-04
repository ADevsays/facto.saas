<script setup lang="ts">
defineProps<{
    marketLabel: string;
    buyerProfile: string;
    displayValuation: number;
    displayMultiplier: number;
    metricLabel: string;
    metricValue: number;
    lowRange: number;
    highRange: number;
    stageColor?: string;
    formatCurrency: (v: number) => string;
    formatMultiplier: (v: number) => string;
}>();
</script>

<template>
    <div class="relative p-8 bg-gradient-to-br from-[#0D1117] to-[#0A0D13] border border-[#00D4FF]/15 rounded-3xl overflow-hidden">
        <div class="absolute -top-16 -right-16 w-52 h-52 bg-[radial-gradient(circle,rgba(0,212,255,0.06)_0%,transparent_70%)] rounded-full pointer-events-none"></div>

        <div class="mb-4">
            <span class="font-sans text-[10px] font-semibold tracking-[0.2em] uppercase text-[#00D4FF]">{{ marketLabel }}</span>
            <p class="font-sans text-[11px] text-white/30 mt-1 mb-0 leading-snug">{{ buyerProfile }}</p>
        </div>

        <div class="font-serif text-[clamp(2.5rem,5vw,4rem)] font-bold text-white leading-none tracking-[-0.03em] mb-2.5 transition-all duration-300">
            {{ formatCurrency(displayValuation) }}
        </div>
        <p class="font-sans text-xs text-white/30 m-0 mb-5">
            Rango estimado:
            <span class="text-white/50">{{ formatCurrency(lowRange) }} – {{ formatCurrency(highRange) }}</span>
        </p>

        <div class="h-px bg-white/[0.06] mb-5"></div>

        <div class="flex items-center gap-5">
            <div class="flex flex-col gap-1">
                <span class="font-sans text-xl font-semibold text-white">{{ formatCurrency(metricValue) }}</span>
                <span class="font-sans text-[10px] tracking-[0.12em] uppercase text-white/30">{{ metricLabel }}</span>
            </div>
            <div class="w-px h-9 bg-white/[0.08]"></div>
            <div class="flex flex-col gap-1">
                <span class="font-sans text-xl font-semibold text-[#00D4FF]">
                    {{ formatMultiplier(displayMultiplier) }}
                </span>
                <span class="font-sans text-[10px] tracking-[0.12em] uppercase text-white/30">Múltiplo aplicado</span>
            </div>
        </div>
    </div>
</template>
