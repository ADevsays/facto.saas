<script setup lang="ts">
defineProps<{
  isOpen: boolean;
  currentLabel: string;
  options: { value: string, label: string }[];
  activeValue: string | null;
}>()

defineEmits(['toggle', 'select'])
</script>

<template>
  <div class="flex items-center gap-2 relative w-full sm:w-auto">
    <span class="text-xs font-sans font-light tracking-[0.08em] text-neutral-500 uppercase shrink-0">Ordenar por:</span>
    <div class="relative w-full sm:w-auto">
      <button 
        @click="$emit('toggle')" 
        class="flex items-center justify-between gap-3 bg-white/[0.04] border border-white/10 hover:border-white/20 text-white rounded-xl px-4 py-2.5 text-xs font-sans tracking-wide transition-all duration-300 cursor-pointer min-w-[150px]"
      >
        <span>{{ currentLabel }}</span>
        <svg width="10" height="6" viewBox="0 0 10 6" fill="none" class="text-neutral-400 transition-transform duration-300 shrink-0" :class="{ 'rotate-180': isOpen }">
          <path d="M1 1L5 5L9 1" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
      <div 
        v-if="isOpen" 
        class="absolute left-0 mt-2 w-full bg-[#0c0c10]/95 border border-white/10 rounded-xl overflow-hidden shadow-2xl backdrop-blur-md z-40 flex flex-col py-1 animate-fade-in"
      >
        <button 
          v-for="option in options" 
          :key="option.value"
          @click="$emit('select', option.value)"
          class="px-4 py-2.5 text-left text-xs font-sans tracking-wide hover:bg-white/[0.08] transition-colors duration-200"
          :class="activeValue === option.value ? 'text-[#00D4FF] font-medium' : 'text-neutral-300'"
        >
          {{ option.label }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.2s ease-out;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-5px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
