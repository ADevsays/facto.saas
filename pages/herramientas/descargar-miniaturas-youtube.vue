<script setup lang="ts">
import YoutubeThumbnailView from '~/modules/youtube-thumbnail/views/YoutubeThumbnailView.vue'

defineI18nRoute({
  paths: {
    en: '/tools/youtube-thumbnail-downloader',
    es: '/herramientas/descargar-miniaturas-youtube'
  }
})
</script>

<template>
  <YoutubeThumbnailView />
</template>
