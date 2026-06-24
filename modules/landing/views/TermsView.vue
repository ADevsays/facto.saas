<script setup lang="ts">
import es from '../locales/es.json';
import en from '../locales/en.json';
import { useLanguage } from '@/composables/useLanguage';
import LegalContent from '../components/LegalContent.vue';

const { t } = useLanguage({ es, en });
</script>

<template>
    <div>
        <LegalContent 
            :title="t.legal.terms.title"
            :subtitle="t.legal.terms.subtitle"
            :sections="t.legal.terms.sections"
        />
    </div>
</template>
