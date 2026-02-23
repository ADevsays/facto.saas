<script setup lang="ts">
import { useBetaForm } from '../composables/useBetaForm';
import { useLanguage } from '../composables/useLanguage';

const { form, next } = useBetaForm();
const { t } = useLanguage();
</script>

<template>
    <div>
        <p class="text-gray-600 text-xs uppercase tracking-widest mb-4">{{ t.beta.step1.pill }}</p>
        <h2 
            class="font-serif text-4xl md:text-5xl text-white mb-10 leading-tight whitespace-pre-line"
        >
            {{ t.beta.step1.title }}
        </h2>
        <input
            v-model="form.startupUrl"
            type="url"
            :placeholder="t.beta.step1.placeholder"
            class="w-full bg-transparent border-b py-4 text-white text-xl outline-none placeholder-white/15 transition-colors focus:border-cyan-500"
            style="border-color: rgba(255,255,255,0.12);"
            @keydown.enter="next"
            autofocus
        />
    </div>
</template>

<style scoped>
input { caret-color: #00D4FF; }
</style>
