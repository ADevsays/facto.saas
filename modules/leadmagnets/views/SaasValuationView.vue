<script setup lang="ts">
import SaasCalculator from '../sections/SaasCalculator.vue';
import es from '../locales/es.json';
import en from '../locales/en.json';
import { useLanguage } from '@/composables/useLanguage';
import { onMounted } from 'vue';

const { t, detectLanguage } = useLanguage({ es, en });
const url = useRequestURL();

onMounted(() => {
    detectLanguage();
});

useSeoMeta({
    title: () => t.value?.seo.title || '',
    ogTitle: () => t.value?.seo.ogTitle || '',
    description: () => t.value?.seo.description || '',
    ogDescription: () => t.value?.seo.ogDescription || '',
    ogImage: () => `${url.origin}/og-valuation.png`,
    ogType: 'website',
    ogUrl: () => url.href,
    twitterCard: 'summary_large_image',
    twitterTitle: () => t.value?.seo.ogTitle || t.value?.seo.title || '',
    twitterDescription: () => t.value?.seo.ogDescription || t.value?.seo.description || '',
    twitterImage: () => `${url.origin}/og-valuation.png`,
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