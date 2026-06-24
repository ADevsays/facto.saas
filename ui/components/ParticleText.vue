<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  text: string
}>()

const displayText = ref(props.text)
const phase = ref<'idle' | 'out'>('idle')

// Generamos 8 pequeñas partículas
const particles = Array.from({ length: 8 }).map((_, i) => {
  const angle = Math.random() * Math.PI * 2
  const distance = Math.random() * 10 + 5 // entre 5px y 15px de distancia
  return {
    id: i,
    x: Math.cos(angle) * distance,
    y: Math.sin(angle) * distance,
    scale: Math.random() * 0.8 + 0.5
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
