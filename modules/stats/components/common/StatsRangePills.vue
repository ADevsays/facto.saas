<script setup lang="ts">
import type { TimeRange } from '../../types'
import es from '../../locales/es.json'
import en from '../../locales/en.json'

const { t } = useLanguage({ es, en })

defineProps<{
  modelValue: TimeRange
  activeClass?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: TimeRange]
}>()

const ranges: TimeRange[] = ['all', '90d', '30d']
</script>

<template>
  <div class="flex items-center gap-1 p-1 rounded-xl bg-white/[0.04] border border-white/5 self-start sm:self-auto">
    <button
      v-for="r in ranges"
      :key="r"
      type="button"
      @click="emit('update:modelValue', r)"
      class="px-2.5 py-1 rounded-lg text-[11px] font-sans transition-all cursor-pointer"
      :class="modelValue === r ? (activeClass || 'bg-white/20 text-white font-medium') : 'text-neutral-400 hover:text-neutral-200'"
    >
      {{ t?.bento?.[`range_${r}`] || r }}
    </button>
  </div>
</template>
