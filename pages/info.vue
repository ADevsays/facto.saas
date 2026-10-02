<script setup lang="ts">
import LandingView from '@/modules/landing/views/LandingView.vue';

defineI18nRoute({
  paths: {
    en: '/about',
    es: '/info'
  }
})
</script>

<template>
  <LandingView />
</template>
