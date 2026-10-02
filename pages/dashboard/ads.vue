<script setup lang="ts">
import ManageAdsDashboardView from '~/modules/dashboard/views/ManageAdsDashboardView.vue'

const { t } = useI18n()

useAppSeo({
  title: () => t('seo.dashboard_ads_title'),
  description: () => t('seo.dashboard_ads_desc')
})
</script>

<template>
  <ManageAdsDashboardView />
</template>
