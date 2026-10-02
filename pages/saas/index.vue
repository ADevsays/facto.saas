<script setup lang="ts">
import { computed } from 'vue'
import { useSaasViewMeta } from '~/composables/useSaasViewMeta'
import SaasListView from '~/modules/visuals/views/SaasListView.vue'

const { locale } = useI18n()
const { getDefaultMeta } = useSaasViewMeta()

const defaultMeta = computed(() => getDefaultMeta(locale.value))

useAppSeo({
  title: () => defaultMeta.value.seoTitle,
  description: () => defaultMeta.value.seoDescription,
})
</script>

<template>
  <SaasListView />
</template>
