<script setup lang="ts">
import SaasCalculator from '../sections/SaasCalculator.vue';

useSeoMeta({
    title: '¿Cuánto vale tu SaaS? | Calculadora de Valuación | Facto',
    ogTitle: '¿Cuánto vale tu SaaS? Calculadora gratuita de valuación',
    description: 'Calcula el valor de mercado de tu SaaS con los múltiplos reales que usan inversores y compradores. Gratis, instantáneo, sin registro.',
    ogDescription: 'Calcula el valor de mercado de tu SaaS con los múltiplos reales que usan inversores y compradores. Gratis, instantáneo, sin registro.',
    ogType: 'website',
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