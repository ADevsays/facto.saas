<script setup lang="ts">
import { useBetaForm } from '../composables/useBetaForm';
import es from '../locales/es.json';
import en from '../locales/en.json';
import { useLanguage } from '@/composables/useLanguage';

const { canProceed, currentStep, totalSteps, isLoading, submitError, next, back } = useBetaForm();
const { t } = useLanguage({ es, en });
</script>

<template>
    <div
        class="flex flex-col px-8 py-5 shrink-0"
        style="border-top: 1px solid rgba(255,255,255,0.06);"
    >
        <div class="flex justify-between items-center">
            <button
                @click="back"
                class="text-gray-500 hover:text-white text-sm transition-colors flex items-center gap-2"
                :class="currentStep === 1 ? 'invisible' : ''"
            >
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                </svg>
                <span class="hidden sm:inline">{{ t.beta.nav.back }}</span>
            </button>

            <button
                @click="next"
                :disabled="!canProceed || isLoading"
                class="flex items-center gap-2 px-5 py-3 rounded-full text-[11px] font-bold uppercase tracking-widest transition-all duration-300 whitespace-nowrap"
                :class="canProceed && !isLoading ? 'text-white cursor-pointer' : 'text-gray-600 cursor-not-allowed'"
                :style="canProceed && !isLoading
                    ? 'background: rgba(0,212,255,0.12); border: 1px solid rgba(0,212,255,0.5); box-shadow: 0 0 20px rgba(0,212,255,0.1);'
                    : 'background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08);'"
            >
                <span>{{ isLoading ? t.beta.nav.sending : currentStep === totalSteps ? t.beta.nav.submit : t.beta.nav.continue }}</span>
                <svg v-if="!isLoading" class="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
            </button>
        </div>

        <p v-if="submitError" class="text-right text-xs mt-2 text-red-400">
            {{ submitError === 'Este email ya está registrado.' ? t.beta.errors.emailTaken : t.beta.errors.generic }}
        </p>
    </div>
</template>

