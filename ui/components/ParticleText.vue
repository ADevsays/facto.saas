<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  text: string
}>()

const displayText = ref(props.text)
const phase = ref<'idle' | 'out'>('idle')

const particles = Array.from({ length: 8 }).map((_, i) => {
  // Usamos una función pseudo-aleatoria basada en el índice para que sea determinista
  // y así evitar advertencias de Hydration Mismatch entre el servidor y el cliente.
  const pr1 = Math.abs((Math.sin(i * 12.9898) * 43758.5453) % 1)
  const pr2 = Math.abs((Math.sin(i * 78.233) * 43758.5453) % 1)
  const pr3 = Math.abs((Math.sin(i * 45.123) * 43758.5453) % 1)
  
  const angle = pr1 * Math.PI * 2
  const distance = pr2 * 10 + 5 // entre 5px y 15px de distancia
  return {
    id: i,
    x: Number((Math.cos(angle) * distance).toFixed(4)),
    y: Number((Math.sin(angle) * distance).toFixed(4)),
    scale: Number((pr3 * 0.8 + 0.5).toFixed(4))
  }
})

watch(() => props.text, (newVal) => {
  if (phase.value !== 'idle') {
    displayText.value = newVal
    phase.value = 'idle'
    return
  }
  
  // Fase 1: Desaparece la palabra, salen las partículas
  phase.value = 'out'
  
  setTimeout(() => {
    // Fase 2: Cambiamos la palabra oculta y regresamos al estado 'idle'
    // Esto hará que las partículas vuelvan al centro y la nueva palabra aparezca
    displayText.value = newVal
    phase.value = 'idle'
  }, 350)
})
</script>

<template>
  <span class="particle-container" :class="phase">
    <span class="the-text">{{ displayText }}</span>
    
    <span class="particles-layer">
      <span 
        v-for="p in particles" 
        :key="p.id" 
        class="dot"
        :style="{
          '--px': p.x,
          '--py': p.y,
          '--ps': p.scale
        }"
      ></span>
    </span>
  </span>
</template>

<style scoped>
.particle-container {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.the-text {
  transition: opacity 350ms ease, filter 350ms ease, transform 350ms ease;
  opacity: 1;
  filter: blur(0);
  transform: scale(1);
}

.particles-layer {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

.dot {
  position: absolute;
  width: 1.5px;
  height: 1.5px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.6);
  box-shadow: 0 0 2px rgba(255, 255, 255, 0.2);
  opacity: 0;
  transform: translate(0, 0) scale(0);
  transition: opacity 350ms ease, transform 350ms cubic-bezier(0.25, 1, 0.5, 1);
}

.particle-container.out .the-text {
  opacity: 0;
  filter: blur(6px);
  transform: scale(0.9);
}

.particle-container.out .dot {
  opacity: 1;
  transform: translate(calc(var(--px) * 1px), calc(var(--py) * 1px)) scale(var(--ps));
}
</style>
