<script setup lang="ts">
import FeedbackView from '~/modules/feedback/views/FeedbackView.vue'

defineI18nRoute({
  paths: {
    en: '/feedback',
    es: '/feedback'
  }
})

const { t } = useI18n()

useAppSeo({
  title: () => t('footer.report_error') + ' | Facto',
  description: () => t('seo.home_desc'),
})
</script>

<template>
  <FeedbackView />
</template>
