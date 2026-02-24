<script setup lang="ts">
import { useLanguage } from '../../landing/composables/useLanguage';
import LegalContent from '../components/LegalContent.vue';

const { t } = useLanguage();
</script>

<template>
    <LegalContent 
        :title="t.legal.terms.title"
        :subtitle="t.legal.terms.subtitle"
        :sections="t.legal.terms.sections"
    />
</template>
