<script setup lang="ts">
import IncognitoIcon from '~/ui/components/IncognitoIcon.vue'

const emit = defineEmits<{ claim: [] }>()
</script>

<template>
  <div 
    class="absolute inset-0 z-30 flex flex-col items-center justify-center bg-[#030305]/80 backdrop-blur-sm rounded-3xl cursor-pointer group" 
    @click="emit('claim')"
  >
    <div class="flex flex-col items-center gap-4 transition-transform duration-500 group-hover:scale-[1.03]">
      <div class="w-16 h-16 rounded-full bg-white/[0.05] border border-white/10 flex items-center justify-center transition-all duration-500 group-hover:border-[#00D4FF]/40 group-hover:bg-[#00D4FF]/[0.05]">
        <IncognitoIcon class="w-6 h-6 text-neutral-500 group-hover:text-[#00D4FF] transition-colors duration-500" />
      </div>
      <div class="text-center">
        <p class="text-sm md:text-lg font-serif text-neutral-200 font-semibold mb-1">MRR no verificado</p>
        <p class="text-xs md:text-sm font-sans font-light text-neutral-500 tracking-wide max-w-xs leading-relaxed">
          Si eres el dueño de esta startup, haz click aquí para verificar tu identidad y agregar tu MRR.
        </p>
      </div>
      <div class="mt-2 text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-[#00D4FF]/60 group-hover:text-[#00D4FF] transition-colors duration-300">
        Verificar propiedad →
      </div>
    </div>
  </div>
</template>
