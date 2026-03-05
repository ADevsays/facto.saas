<script setup lang="ts">
defineI18nRoute({
  paths: {
    en: '/privacy',
    es: '/privacidad'
  }
})
import PrivacyView from '~/modules/landing/views/PrivacyView.vue';

useHead({
  title: 'Política de Privacidad | Facto.saas',
  meta: [
    { name: 'description', content: 'Política de Privacidad de Facto.saas' }
  ]
});
</script>

<template>
  <PrivacyView />
</template>
