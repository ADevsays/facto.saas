<script setup lang="ts">
import TermsView from '~/modules/landing/views/TermsView.vue';

defineI18nRoute({
  paths: {
    en: '/terms',
    es: '/terminos'
  }
})

const { locale } = useI18n()

useAppSeo({
  title: () => locale.value === 'es' ? 'Términos y Condiciones | Facto' : 'Terms and Conditions | Facto',
  description: () => locale.value === 'es' ? 'Términos y Condiciones de Facto' : 'Terms and Conditions for Facto',
});
</script>

<template>
  <TermsView />
</template>
