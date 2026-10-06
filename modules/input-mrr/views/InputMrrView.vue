<script setup lang="ts">
import MrrInputSection from '../sections/MrrInputSection.vue'

defineProps<{
  fullWidth?: boolean
}>()
</script>

<template>
  <div :class="['flex items-center justify-center', fullWidth ? 'w-full !my-0' : 'mt-10 mb-10 md:mt-12 md:mb-16']">
    <MrrInputSection :full-width="fullWidth" />
  </div>
</template>
