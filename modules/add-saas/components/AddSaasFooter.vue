<script setup lang="ts">
const props = defineProps<{
  loading: boolean
  isUpdate?: boolean
  error?: string
  onSubmit: () => void
}>()
</script>

<template>
  <div class="p-4 border-t border-white/5 bg-[#0c0c10] flex justify-between items-center gap-4">
    <div class="flex-1">
      <p v-if="error" class="text-[11px] text-red-400 font-sans font-medium">{{ error }}</p>
    </div>
    <button
      @click="onSubmit"
      :disabled="loading"
      class="bg-white text-black font-bold uppercase tracking-[0.15em] text-[10px] px-8 py-3.5 rounded-xl transition-all duration-500 hover:scale-[1.02] active:scale-[0.98] shadow-xl hover:shadow-[#00D4FF]/20 disabled:opacity-50"
    >
      <span v-if="loading">Enviando...</span>
      <span v-else-if="isUpdate">Actualizar</span>
      <span v-else>Unirse al Ranking</span>
    </button>
  </div>
</template>
