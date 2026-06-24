<script setup lang="ts">
const emit = defineEmits<{
  (e: 'reset'): void
}>()
</script>

<template>
  <div class="bg-white/[0.02] border border-white/[0.05] rounded-3xl p-12 text-center stagger-fade-up relative overflow-hidden backdrop-blur-md">
    <div class="absolute inset-0 bg-[#00D4FF]/5 blur-2xl"></div>
    <Icon name="lucide:check-circle" class="text-[#00D4FF] text-6xl mb-6 relative z-10 mx-auto drop-shadow-[0_0_15px_rgba(0,212,255,0.4)]" />
    <h3 class="font-serif text-3xl mb-3 relative z-10 tracking-tight">¡Gracias por tu reporte!</h3>
    <p class="text-neutral-400 font-extralight text-sm relative z-10 mb-10 tracking-wide">Nuestro equipo revisará los detalles a la brevedad.</p>
    <button @click="emit('reset')" class="relative z-10 bg-white text-black font-bold uppercase text-xs rounded-full px-8 py-3.5 transition-all duration-700 hover:scale-[1.03]" style="box-shadow: 0 0 15px rgba(255, 255, 255, 0.3), 0 0 30px rgba(0, 212, 255, 0.2)">
      Enviar otro
    </button>
  </div>
</template>
