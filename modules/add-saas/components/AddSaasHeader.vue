<script setup lang="ts">
defineProps<{
  onClose: () => void
  onBack?: () => void
  isEditMode?: boolean
  showBackButton?: boolean
}>()
</script>

<template>
  <div class="p-8 pb-5 flex flex-col gap-4 border-b border-white/5 bg-[#0c0c10]">
    <div class="flex items-start justify-between">
      <div class="flex flex-col gap-1.5">
        <button 
          v-if="showBackButton"
          class="flex items-center gap-1.5 text-[10px] font-sans font-medium uppercase tracking-[0.1em] text-neutral-400 hover:text-white transition-colors mb-2 w-fit"
          @click="onBack"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Volver al perfil
        </button>
        <h2 class="font-serif text-2xl text-white tracking-tight leading-tight">
          {{ isEditMode ? 'Edita tu' : 'Agrega tu' }} <span class="text-[#00D4FF]">Startup</span>
        </h2>
        <p v-if="!isEditMode" class="text-[10px] font-sans font-bold text-[#00D4FF] tracking-[0.15em] uppercase">
          Llega a +10,000 fundadores mensualmente
        </p>
      </div>
      <button @click="onClose" class="text-neutral-500 hover:text-white transition-colors p-1">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      </button>
    </div>
  </div>
</template>
