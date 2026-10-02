<script setup lang="ts">
import RankingSection from '../sections/RankingSection.vue'

defineProps<{
  limit?: number
  showViewAll?: boolean
  hideTitle?: boolean
}>()
</script>

<template>
  <RankingSection :limit="limit" :show-view-all="showViewAll" :hide-title="hideTitle" />
</template>
