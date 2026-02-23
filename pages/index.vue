<script setup lang="ts">
import LandingView from '@/modules/landing/views/LandingView.vue';
import { Analytics } from '@vercel/analytics/nuxt'
</script>

<template>
  <Analytics />
  <LandingView />
</template>
