<script setup lang="ts">
import PrivacyView from '~/modules/landing/views/PrivacyView.vue';

defineI18nRoute({
  paths: {
    en: '/privacy',
    es: '/privacidad'
  }
})

const { locale } = useI18n()

useAppSeo({
  title: () => locale.value === 'es' ? 'Política de Privacidad | Facto' : 'Privacy Policy | Facto',
  description: () => locale.value === 'es' ? 'Política de Privacidad de Facto' : 'Privacy Policy for Facto',
});
</script>

<template>
  <PrivacyView />
</template>
