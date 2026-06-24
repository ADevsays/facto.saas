<script setup lang="ts">
import PendingReviewView from '~/modules/admin/views/PendingReviewView.vue'

definePageMeta({ ssr: false })

useHead({ title: 'Admin Pendientes | Facto' })
</script>

<template>
  <PendingReviewView />
</template>
