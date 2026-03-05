<script setup lang="ts">
import es from '../locales/es.json';
import en from '../locales/en.json';
import { useLanguage } from '@/composables/useLanguage';
import LegalContent from '../components/LegalContent.vue';

const { t } = useLanguage({ es, en });
</script>

<template>
    <NuxtLayout>
        <LegalContent 
            :title="t.legal.privacy.title"
            :subtitle="t.legal.privacy.subtitle"
            :sections="t.legal.privacy.sections"
        />
    </NuxtLayout>
</template>
