<script setup lang="ts">
const props = defineProps<{
  id: string
  active: boolean
  label: string
  compact?: boolean
}>()

const emit = defineEmits(['click'])
</script>

<template>
  <button
    type="button"
    @click="emit('click')"
    :class="[
      'flex items-center rounded-xl border transition-all duration-300',
      compact ? 'gap-2 p-1' : 'gap-2.5 p-2',
      active ? 'border-[#00D4FF] bg-[#00D4FF]/10 text-white' : 'border-white/10 bg-white/[0.04] text-neutral-400 hover:border-white/20'
    ]"
  >
    <slot name="icon" />
    <span :class="[
      'font-sans font-medium',
      compact ? 'text-xs' : 'text-sm'
    ]">
      {{ label }}
    </span>
  </button>
</template>
