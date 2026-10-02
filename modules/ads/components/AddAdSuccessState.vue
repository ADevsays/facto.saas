<script setup lang="ts">
import { Check } from 'lucide-vue-next'
import { useLanguage } from '~/composables/useLanguage'
import es from '../locales/es.json'
import en from '../locales/en.json'

const { t } = useLanguage({ es, en })

defineProps<{
  selectedSlot: number
}>()
</script>

<template>
  <div class="flex flex-col items-center gap-4 py-8">
    <div class="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
      <Check class="w-8 h-8 text-emerald-400" />
    </div>
    <p class="text-lg font-serif text-white">{{ t.modal.setup.success_title }}</p>
    <p class="text-sm font-sans font-light text-neutral-400 text-center">
      {{ t.modal.setup.success_desc.replace('{slot}', String(selectedSlot)) }}
    </p>
  </div>
</template>
