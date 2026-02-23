<script setup lang="ts">
import { useBetaForm } from '../composables/useBetaForm';

const { currentStep, totalSteps } = useBetaForm();
</script>

<template>
    <div class="px-8 mb-2 shrink-0">
        <div class="flex gap-1.5">
            <div
                v-for="step in totalSteps"
                :key="step"
                class="h-[2px] flex-1 rounded-full transition-all duration-500"
                :class="step <= currentStep ? 'bg-cyan-500' : 'bg-white/10'"
            />
        </div>
    </div>
</template>
