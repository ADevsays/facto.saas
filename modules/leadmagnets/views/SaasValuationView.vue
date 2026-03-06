<script setup lang="ts">
import SaasCalculator from '../sections/SaasCalculator.vue';
import es from '../locales/es.json';
import en from '../locales/en.json';
import { useLanguage } from '@/composables/useLanguage';
import { useAppSchema } from '@/composables/useAppSchema';
import { onMounted } from 'vue';

const { t, detectLanguage } = useLanguage({ es, en });
const { defineSoftwareApp } = useAppSchema();

defineSoftwareApp({
    name: t.value?.seo.title || 'Calculadora de Valuación SaaS',
    description: t.value?.seo.description || 'Calcula cuánto vale tu SaaS en segundos.'
});

onMounted(() => {
    detectLanguage();
});

useAppSeo({
    title: () => t.value?.seo.title || '',
    description: () => t.value?.seo.description || '',
    imagePath: '/og-valuation.png',
});
</script>

<template>
    <NuxtLayout>
        <main>
            <SaasCalculator />
        </main>
    </NuxtLayout>
</template>

<style>
.outline-text {
    background: linear-gradient(
        120deg, 
        rgba(255, 255, 255, 0) 30%, 
        rgba(255, 255, 255, 0.8) 50%, 
        rgba(255, 255, 255, 0) 70%
    );
    background-size: 200% auto;
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: rgba(0, 212, 255, 0.3);
    filter: drop-shadow(0 0 15px rgba(0, 212, 255, 0.4));
    animation: shine 5s ease-in-out infinite;
    display: inline-block;
}

@keyframes shine {
    0% { background-position: -100% 0; }
    100% { background-position: 100% 0; }
}
</style>