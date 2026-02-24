<script setup lang="ts">
import { useLanguage } from '../../landing/composables/useLanguage';
import LegalContent from '../components/LegalContent.vue';

const { t } = useLanguage();
</script>

<template>
    <LegalContent 
        :title="t.legal.privacy.title"
        :subtitle="t.legal.privacy.subtitle"
        :sections="t.legal.privacy.sections"
    />
</template>
