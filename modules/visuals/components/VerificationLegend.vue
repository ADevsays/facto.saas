<script setup lang="ts">
import { computed } from 'vue'

import es from '../locales/es.json'
import en from '../locales/en.json'
const { t, locale } = useLanguage({ es, en })

const props = defineProps<{
  provider: string
  lastSyncedAt: number
  keyStatus?: 'ok' | 'invalid' | 'permissions' | 'missing'
}>()

const formattedDate = computed(() => {
  return new Date(props.lastSyncedAt).toLocaleString(locale.value === 'es' ? 'es-ES' : 'en-US', { 
    dateStyle: 'short', 
    timeStyle: 'short',
    timeZone: 'UTC'
  })
})

const capitalizedProvider = computed(() => {
  if (!props.provider) return ''
  return props.provider.charAt(0).toUpperCase() + props.provider.slice(1)
})

const verificationText = computed(() => {
  if (props.keyStatus === 'invalid') return t.value.profile.verification.key_outdated
  return (t.value.profile.verification.verified_with || '')
    .replace('{provider}', capitalizedProvider.value)
    .replace('{date}', formattedDate.value)
})
</script>

<template>
  <div v-if="t?.profile?.verification" class="flex items-center justify-end gap-1.5 text-[10px] font-sans text-neutral-500/80 tracking-wide">
    <svg class="w-3 h-3" :class="keyStatus === 'invalid' ? 'text-amber-400/80' : 'text-[#00D4FF]/70'" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
    {{ verificationText }}
  </div>
</template>
