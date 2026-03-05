```
<script setup lang="ts">
defineI18nRoute({
  paths: {
    en: '/terms',
    es: '/terminos'
  }
})
import TermsView from '~/modules/landing/views/TermsView.vue';

useHead({
  title: 'Términos y Condiciones | Facto.saas',
  meta: [
    { name: 'description', content: 'Términos y Condiciones de Facto.saas' }
  ]
});
</script>

<template>
  <TermsView />
</template>
