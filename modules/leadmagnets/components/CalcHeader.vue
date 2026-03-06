<script setup lang="ts">
import es from '../locales/es.json';
import en from '../locales/en.json';
import { useLanguage } from '@/composables/useLanguage';
const { t } = useLanguage({ es, en });
</script>

<template>
    <div class="text-center mb-16">
        <div class="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border border-white/10 bg-white/[0.04] font-sans text-[10px] font-medium tracking-[0.2em] uppercase text-white/55 mb-7">
            <span class="w-1.5 h-1.5 rounded-full bg-[#00D4FF] shadow-[0_0_8px_#00D4FF] animate-pulse"></span>
            {{ t?.calculator.header.pill }}
        </div>
        <h1 class="font-serif text-[clamp(2.8rem,7vw,5.5rem)] font-bold leading-[0.9] tracking-[-0.04em] text-white m-0 mb-6">
            {{ t?.calculator.header.title }}<br>
            <span class="outline-text">{{ t?.calculator.header.titleAccent }}</span>
        </h1>
        <p class="font-sans text-[15px] font-light text-white/50 max-w-[520px] mx-auto leading-[1.7] tracking-[0.01em]">
            {{ t?.calculator.header.subtitle }}
        </p>
    </div>
</template>
