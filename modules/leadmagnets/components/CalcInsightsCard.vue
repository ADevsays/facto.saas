<script setup lang="ts">
import es from '../locales/es.json';
import en from '../locales/en.json';
import { useLanguage } from '@/composables/useLanguage';
import { useBetaModal } from '@/modules/landing/composables/useBetaModal';

const { t } = useLanguage({ es, en });
const { open: openBetaModal } = useBetaModal();
</script>

<template>
    <div class="flex flex-col gap-6">

        <!-- CTA -->
        <div class="flex flex-col gap-3 p-7 bg-gradient-to-br from-white/[0.04] to-white/[0.02] border border-white/[0.08] rounded-2xl">
            <p class="font-serif text-lg font-semibold text-white m-0 leading-snug">
                {{ t?.calculator.insights.ctaTitle }}
            </p>
            <p class="font-sans text-[13px] font-light text-white/45 py-2 m-0 leading-relaxed">
                {{ t?.calculator.insights.ctaDescription }}
            </p>
            <button
                @click="openBetaModal"
                class="glass-fluid-btn opacity-85 group px-6 py-2.5 rounded-full text-[11px] font-bold uppercase tracking-[0.12em] inline-flex items-center gap-2 self-start mt-2 transition-all duration-300 cursor-pointer"
            >
                {{ t?.calculator.insights.ctaButton }}
                <svg class="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
            </button>
        </div>

    </div>
</template>
