<script setup lang="ts">
import { useLanguage } from '../composables/useLanguage';

const emit = defineEmits<{ close: [] }>();
const { t } = useLanguage();
</script>

<template>
    <div class="flex justify-between items-center px-8 pt-7 pb-4 shrink-0">
        <p class="text-[10px] uppercase tracking-[0.2em] text-cyan-500 font-bold">
            {{ t.beta.header }}
        </p>
        <button
            @click="emit('close')"
            class="w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:bg-white/10 text-gray-500 hover:text-white"
        >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
        </button>
    </div>
</template>
