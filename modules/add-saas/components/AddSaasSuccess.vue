<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  isUpdate?: boolean
  publishedData?: any
}>()

const isPending = computed(() => props.publishedData?.status === 'pending_review')
const saasLink = computed(() => {
  if (props.publishedData?.slug) {
    return `/saas/${props.publishedData.slug}`
  }
  return '#'
})

const emit = defineEmits(['close-modal'])
</script>

<template>
  <div class="flex-1 flex flex-col items-center justify-center p-12 text-center gap-6 animate-in fade-in zoom-in duration-500">
    <div class="w-16 h-16 rounded-full bg-[#00D4FF]/10 border border-[#00D4FF]/20 flex items-center justify-center">
      <svg v-if="!isPending" class="w-8 h-8 text-[#00D4FF]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
        <polyline points="20 6 9 17 4 12" />
      </svg>
      <svg v-else class="w-8 h-8 text-[#00D4FF]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"></circle>
        <polyline points="12 6 12 12 16 14"></polyline>
      </svg>
    </div>
    
    <div class="flex flex-col gap-2">
      <h3 class="font-serif text-2xl text-white">
        {{ isUpdate ? '¡Startup Actualizada!' : (isPending ? 'Enviada a revisión' : '¡Startup Registrada!') }}
      </h3>
      
      <p v-if="!isUpdate && isPending" class="text-neutral-400 text-sm font-sans font-light">
        Tu startup se envió para revisar. Te notificaremos pronto.
      </p>
      <p v-else-if="!isUpdate && !isPending" class="text-neutral-400 text-sm font-sans font-light">
        Tu startup ya está pública. ¡Presume de tu MRR!
      </p>
    </div>

    <div v-if="!isPending && !isUpdate" class="mt-4 flex flex-col items-center gap-3">
      <NuxtLink 
        @click="emit('close-modal')"
        :to="saasLink" 
        class="inline-flex items-center justify-center bg-[#00D4FF]/10 hover:bg-[#00D4FF]/20 text-[#00D4FF] border border-[#00D4FF]/30 hover:border-[#00D4FF]/50 transition-all rounded-full px-6 py-2.5 text-sm font-medium tracking-wide uppercase shadow-[0_0_15px_rgba(0,212,255,0.15)]"
      >
        Ver perfil público
      </NuxtLink>
    </div>
  </div>
</template>
