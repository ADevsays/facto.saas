<script setup lang="ts">
import { useBetaForm } from '../composables/useBetaForm';
import { useLanguage } from '../composables/useLanguage';

const { form, next } = useBetaForm();
const { t } = useLanguage();
</script>

<template>
    <div>
        <p class="text-gray-600 text-xs uppercase tracking-widest mb-4">{{ t.beta.step3.pill }}</p>
        <h2 class="font-serif text-4xl md:text-5xl text-white mb-10 leading-tight">
            {{ t.beta.step3.title }}
        </h2>
        <input
            v-model="form.email"
            type="email"
            :placeholder="t.beta.step3.placeholder"
            class="w-full bg-transparent border-b py-4 text-white text-xl outline-none placeholder-white/15 transition-colors focus:border-cyan-500"
            style="border-color: rgba(255,255,255,0.12);"
            @keydown.enter="next"
        />
        <p class="text-gray-700 text-xs mt-5">
            {{ t.beta.step3.disclaimer.start }}
            <span class="text-gray-500">{{ t.beta.step3.disclaimer.highlight }}</span>
            {{ t.beta.step3.disclaimer.end }}
        </p>
    </div>
</template>

<style scoped>
input { caret-color: #00D4FF; }
</style>
