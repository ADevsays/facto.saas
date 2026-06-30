<script setup lang="ts">
import { computed, ref, onMounted, nextTick, onUnmounted } from 'vue'
import { useCountries } from '~/composables/useCountries'

const model = defineModel<string>({ required: true, default: '' })

const { countries, fetchCountries } = useCountries()

onMounted(() => {
  fetchCountries()
})

const open = ref(false)
const containerRef = ref<HTMLElement | null>(null)
const selected = computed(() => {
  if (!model.value) return null
  return countries.value?.find(c => c.slug === model.value)
})

async function toggleOpen() {
  open.value = !open.value
  if (open.value) {
    await nextTick()
    if (containerRef.value) {
      const dropdown = containerRef.value.querySelector('.absolute')
      if (dropdown) {
        dropdown.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
      }
    }
  }
}

function selectCountry(slug: string) {
  model.value = slug
  open.value = false
}

// Lógica de salto por teclado (A-Z)
const searchBuffer = ref('')
let searchTimeout: any = null

function handleKeydown(event: KeyboardEvent) {
  if (!open.value) return
  
  // Ignorar teclas especiales
  if (event.ctrlKey || event.metaKey || event.altKey) return
  if (event.key.length > 1 && event.key !== 'Backspace') return

  if (event.key === 'Backspace') {
    searchBuffer.value = searchBuffer.value.slice(0, -1)
  } else {
    searchBuffer.value += event.key.toLowerCase()
  }

  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    searchBuffer.value = ''
  }, 1000)

  if (searchBuffer.value && countries.value) {
    let match = countries.value.find(c => c.name.toLowerCase().startsWith(searchBuffer.value))
    
    // Si no encuentra coincidencia con el buffer acumulado, intentamos solo con la nueva tecla presionada
    if (!match && searchBuffer.value.length > 1) {
      searchBuffer.value = event.key.toLowerCase()
      match = countries.value.find(c => c.name.toLowerCase().startsWith(searchBuffer.value))
    }

    if (match) {
      const el = document.getElementById(`country-${match.slug}`)
      if (el) {
        el.scrollIntoView({ behavior: 'auto', block: 'center' })
        el.focus()
      }
    }
  }
}

function handleClickOutside(event: MouseEvent) {
  if (containerRef.value && !containerRef.value.contains(event.target as Node)) {
    open.value = false
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
  document.removeEventListener('click', handleClickOutside)
  if (searchTimeout) clearTimeout(searchTimeout)
})
</script>

<template>
  <div class="relative" ref="containerRef">
    <button
      type="button"
      @click.stop="toggleOpen"
      class="flex items-center justify-center bg-white/[0.07] border border-white/20 rounded-xl h-[50px] w-[60px] transition-all duration-300 hover:border-white/40 focus:outline-none focus:border-[#00D4FF]/70"
      :class="open ? 'border-[#00D4FF]/60 bg-white/[0.1] country-btn-glow' : 'hover:country-btn-glow'"
    >
      <div v-if="selected?.slug === 'global'" class="text-neutral-300 opacity-90 transition-opacity hover:opacity-100">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/><path d="M2 12h20"/></svg>
      </div>
      <img 
        v-else-if="selected && selected.iso_code" 
        :src="`https://flagcdn.com/w40/${selected.iso_code}.png`" 
        :alt="selected.name"
        :title="selected.name"
        class="w-6 rounded-sm shadow-sm opacity-90 transition-opacity hover:opacity-100"
      />
      <span v-else class="text-neutral-400 opacity-60">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/><path d="M2 12h20"/></svg>
      </span>
    </button>

    <div
      v-if="open"
      class="absolute z-50 top-full mt-2 w-[60px] left-0 bg-[#0c0c10] border border-white/20 rounded-xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-xl max-h-[220px] overflow-y-auto no-scrollbar"
    >
      <button
        v-for="country in countries"
        :key="country.slug"
        :id="`country-${country.slug}`"
        type="button"
        @click.stop="selectCountry(country.slug)"
        :title="country.name"
        class="w-full flex items-center justify-center p-3 transition-colors duration-150"
        :class="model === country.slug ? 'bg-[#00D4FF]/20' : 'hover:bg-white/[0.08]'"
      >
        <div v-if="country.slug === 'global'" class="text-neutral-400">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/><path d="M2 12h20"/></svg>
        </div>
        <img 
          v-else-if="country.iso_code" 
          :src="`https://flagcdn.com/w40/${country.iso_code}.png`" 
          :alt="country.name"
          class="w-6 rounded-sm shadow-sm"
        />
        <span v-else class="text-xl">{{ country.flag }}</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.no-scrollbar::-webkit-scrollbar { 
  display: none; 
}
.no-scrollbar {
  -ms-overflow-style: none;  /* IE and Edge */
  scrollbar-width: none;  /* Firefox */
}

.country-btn-glow {
  box-shadow: 0 0 10px rgba(0,212,255,0.1), inset 0 0 10px rgba(0,212,255,0.05);
}
</style>
