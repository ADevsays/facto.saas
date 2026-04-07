<script setup lang="ts">
import { Analytics } from '@vercel/analytics/nuxt'
import AdsBandSection from '~/modules/ads/sections/AdsBandSection.vue'

const route = useRoute()
const isInfoPage = computed(() => route.path === '/info')
</script>

<template>
  <div class="min-h-screen bg-[#030305] text-white font-sans selection:bg-cyan-500/30">
    <AdsBandSection v-if="!isInfoPage" />
    <slot />
    <Analytics />
  </div>
</template>

<style>
/* Reset global y transiciones base */
html, body {
  margin: 0;
  padding: 0;
  background-color: #030305;
}

/* Scrollbar custom */
::-webkit-scrollbar {
  width: 4px;
  height: 4px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.08);
  border-radius: 999px;
  transition: background 0.3s ease;
}
::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 212, 255, 0.35);
  box-shadow: 0 0 6px rgba(0, 212, 255, 0.3);
}
/* Firefox */
* {
  scrollbar-width: thin;
  scrollbar-color: rgba(255,255,255,0.08) transparent;
}

.page-enter-active,
.page-leave-active {
  transition: opacity 0.2s ease;
}
.page-enter-from,
.page-leave-to {
  opacity: 0;
}

.glass-fluid-btn {
    color: #fff;
    background: linear-gradient(
        120deg, 
        rgba(255, 255, 255, 0) 30%, 
        rgba(255, 255, 255, 0.15) 50%, 
        rgba(255, 255, 255, 0) 70%
    );
    background-size: 200% auto;
    border: 1px solid rgba(255, 255, 255, 0.1);
    animation: shine 12s ease-in-out infinite;
    transition: all 0.4s ease;
}

.glass-fluid-btn:hover {
    border-color: rgba(0, 212, 255, 0.5);
    background-color: rgba(0, 212, 255, 0.1);
    transform: translateY(-1px);
    box-shadow: 0 0 20px rgba(0, 212, 255, 0.1);
}

@keyframes shine {
    0% { background-position: -100% 0; }
    100% { background-position: 100% 0; }
}
</style>
