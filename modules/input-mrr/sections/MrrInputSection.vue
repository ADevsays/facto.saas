<script setup lang="ts">
import MrrInput from '../components/MrrInput.vue'

defineProps<{
  fullWidth?: boolean
}>()
</script>

<template>
  <section :class="fullWidth ? 'w-full' : 'w-full sm:w-2/3'">
    <div class="flex flex-col gap-2 w-full">
      <MrrInput />
    </div>
  </section>
</template>
