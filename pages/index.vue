<script setup lang="ts">
import VisualsView from '../modules/visuals/views/VisualsView.vue'
import { useAppSchema } from '~/composables/useAppSchema'

const { t } = useI18n()
const { defineWebSite } = useAppSchema()

defineWebSite({
  name: 'Facto',
  description: t('seo.home_desc'),
})

useAppSeo({
  title: () => t('seo.home_title'),
  description: () => t('seo.home_desc'),
})
</script>

<template>
  <VisualsView />
</template>
