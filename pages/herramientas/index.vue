<script setup lang="ts">
import ToolsIndexView from '~/modules/tools/views/ToolsIndexView.vue'

defineI18nRoute({
  paths: {
    en: '/tools',
    es: '/herramientas'
  }
})
</script>

<template>
  <ToolsIndexView />
</template>
