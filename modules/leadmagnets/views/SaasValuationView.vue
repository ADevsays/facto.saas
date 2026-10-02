<script setup lang="ts">
import SaasCalculator from '../sections/SaasCalculator.vue';
import SaasSeoContent from '../sections/SaasSeoContent.vue';
import es from '../locales/es.json';
import en from '../locales/en.json';
import { useAppSchema } from '@/composables/useAppSchema';
import { computed } from 'vue';
import GlobalBreadcrumb from '~/ui/components/GlobalBreadcrumb.vue';

const { locale } = useI18n();
const { t } = useLanguage({ es, en });
const localePath = useLocalePath();
const { defineSoftwareApp } = useAppSchema();

defineSoftwareApp({
    name: t.value?.seo.title || 'Calculadora de Valuación SaaS',
    description: t.value?.seo.description || 'Calcula cuánto vale tu SaaS en segundos.'
});

useAppSeo({
    title: () => t.value?.seo.title || '',
    description: () => t.value?.seo.description || '',
    imagePath: '/og-valuation.png',
});


useHead(() => {
    if (!t.value?.seoContent?.faq?.items) return {};

    const schemaBreadcrumb = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            { '@type': 'ListItem', position: 1, name: locale.value === 'es' ? 'Inicio' : 'Home', item: 'https://www.factosaas.com' },
            { '@type': 'ListItem', position: 2, name: locale.value === 'es' ? 'Herramientas' : 'Tools', item: 'https://www.factosaas.com/herramientas' },
            { '@type': 'ListItem', position: 3, name: t.value.seo.title, item: 'https://www.factosaas.com/herramientas/cuanto-vale-tu-saas' },
        ]
    }

    return {
        script: [
            {
                type: 'application/ld+json',
                key: 'breadcrumb-schema',
                innerHTML: JSON.stringify(schemaBreadcrumb),
            },
            {
                type: 'application/ld+json',
                key: 'faq-schema',
                innerHTML: JSON.stringify({
                    '@context': 'https://schema.org',
                    '@type': 'FAQPage',
                    mainEntity: t.value.seoContent.faq.items.map((item: any) => ({
                        '@type': 'Question',
                        name: item.question,
                        acceptedAnswer: {
                            '@type': 'Answer',
                            text: item.answer,
                        },
                    })),
                }),
            },
        ],
    };
});
</script>

<template>
    <div class="min-h-screen bg-[#030305] text-white flex flex-col items-center pt-14 relative isolate overflow-x-clip">
        <!-- Premium Glows -->
        <div class="absolute inset-0 pointer-events-none -z-10 flex justify-center">
            <div class="absolute top-[-10%] w-[1000px] h-[600px] bg-[#00D4FF]/[0.03] blur-[150px] rounded-full"></div>
        </div>

        <div class="w-full max-w-[1100px] px-6 z-10 relative">
            <GlobalBreadcrumb :items="[{ label: locale === 'es' ? 'herramientas' : 'tools', to: localePath('/herramientas') }, { label: locale === 'es' ? 'cuánto vale' : 'valuation' }]" class="mb-4" />
        </div>

        <div class="w-full">
            <SaasCalculator />
            <SaasSeoContent />
        </div>
    </div>
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