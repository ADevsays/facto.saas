<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { useRouter } from '#app'
import { useCountries } from '~/composables/useCountries'
import { ROUTES } from '~/utils/routes'

const router = useRouter()
const { countries, fetchCountries } = useCountries()

const COUNT = 3

const visibleCountries = ref<{ name: string; slug: string; iso_code: string; flag: string }[]>([])
const phase = ref<'idle' | 'out'>('idle')
let shuffleInterval: any = null
let initialized = false

function getRandomPool() {
  const pool = countries.value.filter(c => c.slug !== 'global')
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]]
  }
  return pool.slice(0, COUNT)
}

function shuffleCountries() {
  phase.value = 'out'

  setTimeout(() => {
    visibleCountries.value = getRandomPool()
    phase.value = 'idle'
  }, 500)
}

watch(countries, (val) => {
  if (!val.length || initialized) return
  initialized = true
  visibleCountries.value = getRandomPool()

  shuffleInterval = setInterval(shuffleCountries, 12000)
}, { immediate: true })

onMounted(fetchCountries)

onUnmounted(() => {
  if (shuffleInterval) clearInterval(shuffleInterval)
})

function goToCountry(slug: string) {
  router.push(`${ROUTES.COUNTRY}/${slug}`)
}

const PARTICLES_PER_CARD = 14
function generateParticles() {
  return Array.from({ length: PARTICLES_PER_CARD }).map((_, i) => {
    const angle = Math.random() * Math.PI * 2
    const distance = Math.random() * 30 + 15
    return {
      id: i,
      x: Math.cos(angle) * distance,
      y: Math.sin(angle) * distance - (Math.random() * 20),
      scale: Math.random() * 0.6 + 0.4,
      delay: Math.random() * 150
    }
  })
}

const cardParticles = Array.from({ length: COUNT }).map(() => generateParticles())
</script>

<template>
  <section class="w-full max-w-5xl mx-auto pt-10 pb-24">

    <NuxtLink 
      to="/saas/pais"
      class="block mb-6 shrink-0 text-xs font-sans font-extralight tracking-[0.15em] text-neutral-500 hover:text-neutral-300 transition-all duration-300 uppercase"
    >
      Países
    </NuxtLink>

    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <button
        v-for="(country, idx) in visibleCountries"
        :key="idx"
        @click="goToCountry(country.slug)"
        class="country-card group relative bg-white/[0.02] border border-white/5 rounded-2xl py-6 px-5 flex items-center justify-center gap-4 text-center transition-all duration-500 hover:bg-white/[0.06] hover:border-white/15 hover:shadow-[0_0_20px_rgba(0,212,255,0.06)] outline-none cursor-pointer overflow-hidden"
      >
        <!-- Card content wrapper -->
        <div 
          class="card-content flex items-center justify-center gap-4 transition-all duration-500"
          :class="phase"
        >
          <div class="shrink-0 w-9 h-7 flex items-center justify-center">
            <img 
              v-if="country.iso_code" 
              :src="`https://flagcdn.com/w80/${country.iso_code}.png`" 
              :alt="country.name"
              class="w-9 rounded-[3px] shadow-sm opacity-85 group-hover:opacity-100 transition-opacity duration-500"
            />
            <span v-else class="text-2xl">{{ country.flag }}</span>
          </div>
          
          <span class="text-xs font-sans font-extralight tracking-[0.12em] text-neutral-400 group-hover:text-neutral-200 transition-colors duration-500 uppercase">
            {{ country.name }}
          </span>
        </div>

        <!-- Particles layer -->
        <div class="particles-layer" :class="phase">
          <span 
            v-for="p in cardParticles[idx]" 
            :key="p.id" 
            class="particle"
            :style="{
              '--px': p.x + 'px',
              '--py': p.y + 'px',
              '--ps': p.scale,
              '--pd': p.delay + 'ms'
            }"
          ></span>
        </div>

        <div class="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none bg-gradient-to-r from-[#00D4FF]/[0.02] to-transparent"></div>
      </button>
    </div>
  </section>
</template>

<style scoped>
.card-content {
  opacity: 1;
  filter: blur(0);
  transform: scale(1) translateY(0);
}

.card-content.out {
  opacity: 0;
  filter: blur(8px);
  transform: scale(0.92) translateY(-4px);
}

.particles-layer {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

.particle {
  position: absolute;
  width: 2px;
  height: 2px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.5);
  box-shadow: 0 0 3px rgba(0, 212, 255, 0.3);
  opacity: 0;
  transform: translate(0, 0) scale(0);
  transition: opacity 450ms ease, transform 450ms cubic-bezier(0.25, 1, 0.5, 1);
  transition-delay: var(--pd);
}

.particles-layer.out .particle {
  opacity: 1;
  transform: translate(var(--px), var(--py)) scale(var(--ps));
}

.country-card {
  will-change: transform;
}
</style>
