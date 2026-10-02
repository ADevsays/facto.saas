<script setup lang="ts">
import { computed, ref, onMounted, nextTick, onUnmounted } from 'vue'
import { useCountries } from '~/composables/useCountries'

const model = defineModel<string>({ required: true, default: '' })

const props = withDefaults(defineProps<{
  darkBackground?: boolean
}>(), {
  darkBackground: false
})

const { countries, fetchCountries } = useCountries()

onMounted(() => {
  fetchCountries()
})

const open = ref(false)
const opensUpwards = ref(false)
const containerRef = ref<HTMLElement | null>(null)
const dropdownRef = ref<HTMLElement | null>(null)
const highlightedIndex = ref(-1)

const selected = computed(() => {
  if (!model.value) return null
  return countries.value?.find(c => c.slug === model.value)
})

const sortedCountries = computed(() => {
  if (!countries.value) return []
  return countries.value
})

async function toggleOpen() {
  open.value = !open.value
  if (open.value) {
    await nextTick()
    if (containerRef.value) {
      const rect = containerRef.value.getBoundingClientRect()
      const spaceBelow = window.innerHeight - rect.bottom
      // Si hay poco espacio abajo o está en modal, abrir hacia arriba para no estirar el scroll inferior
      opensUpwards.value = spaceBelow < 250 || rect.bottom > window.innerHeight * 0.65
    }
    if (model.value) {
      const idx = sortedCountries.value.findIndex(c => c.slug === model.value)
      if (idx !== -1) highlightedIndex.value = idx
    } else {
      highlightedIndex.value = 0
    }
    await nextTick()
    scrollToHighlighted()
  }
}

function selectCountry(slug: string) {
  model.value = slug
  open.value = false
}

function scrollToHighlighted() {
  if (!dropdownRef.value || highlightedIndex.value < 0) return
  const activeEl = dropdownRef.value.children[highlightedIndex.value] as HTMLElement
  if (activeEl) {
    activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }
}

// Lógica de salto por teclado (A-Z con soporte para ciclo y búsqueda)
let searchTimeout: any = null
let lastKey = ''
let lastKeyIndex = -1

function handleKeydown(event: KeyboardEvent) {
  if (!open.value) {
    if (containerRef.value?.contains(document.activeElement)) {
      if (['Enter', ' ', 'ArrowDown', 'ArrowUp'].includes(event.key)) {
        event.preventDefault()
        toggleOpen()
        return
      }
      if (event.key.length === 1 && /[a-zA-ZáéíóúÁÉÍÓÚñÑ]/.test(event.key)) {
        toggleOpen()
      } else {
        return
      }
    } else {
      return
    }
  }

  // Ignorar atajos del sistema
  if (event.ctrlKey || event.metaKey || event.altKey) return

  if (event.key === 'Escape') {
    open.value = false
    return
  }

  if (event.key === 'Enter') {
    event.preventDefault()
    if (highlightedIndex.value >= 0 && highlightedIndex.value < sortedCountries.value.length) {
      selectCountry(sortedCountries.value[highlightedIndex.value].slug)
    }
    return
  }

  if (event.key === 'ArrowDown') {
    event.preventDefault()
    if (highlightedIndex.value < sortedCountries.value.length - 1) {
      highlightedIndex.value++
      scrollToHighlighted()
    }
    return
  }

  if (event.key === 'ArrowUp') {
    event.preventDefault()
    if (highlightedIndex.value > 0) {
      highlightedIndex.value--
      scrollToHighlighted()
    }
    return
  }

  if (event.key.length === 1 && /[a-zA-ZáéíóúÁÉÍÓÚñÑ]/.test(event.key)) {
    const key = event.key.toLowerCase()

    const matches = sortedCountries.value
      .map((c, idx) => ({ country: c, idx }))
      .filter(({ country }) => country.name.toLowerCase().startsWith(key) || country.slug.toLowerCase().startsWith(key))

    if (matches.length > 0) {
      if (lastKey === key) {
        lastKeyIndex = (lastKeyIndex + 1) % matches.length
      } else {
        lastKey = key
        lastKeyIndex = 0
      }
      highlightedIndex.value = matches[lastKeyIndex].idx
      scrollToHighlighted()
    }

    if (searchTimeout) clearTimeout(searchTimeout)
    searchTimeout = setTimeout(() => {
      lastKey = ''
      lastKeyIndex = -1
    }, 1200)
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
      class="flex items-center justify-center border border-white/15 rounded-xl h-[50px] w-[60px] transition-all duration-300 hover:border-white/30 focus:outline-none focus:border-[#00D4FF]/70 cursor-pointer select-none"
      :class="[
        open ? 'border-[#00D4FF]/60 ring-1 ring-[#00D4FF]/30' : '',
        darkBackground ? 'bg-surface-dark hover:bg-white/5' : 'bg-surface-elevated hover:bg-surface-elevated-hover'
      ]"
      :title="selected ? selected.name : 'Seleccionar país'"
    >
      <div v-if="selected?.slug === 'global'" class="text-neutral-300 opacity-90 transition-opacity hover:opacity-100">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/><path d="M2 12h20"/></svg>
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

    <!-- Dropdown: Aligned right-0 (inwards towards left, safe from right border) and opens upwards if near bottom -->
    <div
      v-if="open"
      ref="dropdownRef"
      class="absolute z-50 right-0 w-[210px] border border-white/15 rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.95)] backdrop-blur-xl max-h-[220px] overflow-y-auto custom-scrollbar p-1.5"
      :class="[
        opensUpwards ? 'bottom-full mb-2' : 'top-full mt-2',
        darkBackground ? 'bg-surface-dark' : 'bg-surface-elevated'
      ]"
    >
      <button
        v-for="(country, idx) in sortedCountries"
        :key="country.slug"
        :id="`country-${country.slug}`"
        type="button"
        @click.stop="selectCountry(country.slug)"
        @mouseenter="highlightedIndex = idx"
        :title="country.name"
        class="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-left text-xs font-sans transition-all duration-150 cursor-pointer my-0.5"
        :class="[
          model === country.slug
            ? 'bg-[#00D4FF]/20 text-white font-medium border border-[#00D4FF]/30'
            : (highlightedIndex === idx ? 'bg-white/10 text-white' : 'text-neutral-300 hover:bg-white/5')
        ]"
      >
        <div v-if="country.slug === 'global'" class="w-5 h-5 flex items-center justify-center text-neutral-300 shrink-0">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/><path d="M2 12h20"/></svg>
        </div>
        <img 
          v-else-if="country.iso_code" 
          :src="`https://flagcdn.com/w40/${country.iso_code}.png`" 
          :alt="country.name"
          class="w-5 h-3.5 object-cover rounded-sm shadow-sm shrink-0"
        />
        <span v-else class="text-sm shrink-0">{{ country.flag }}</span>

        <span class="truncate flex-1 text-xs text-neutral-200">{{ country.name }}</span>
        
        <svg v-if="model === country.slug" class="w-3.5 h-3.5 text-[#00D4FF] shrink-0 ml-auto" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
      </button>
    </div>
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.12);
  border-radius: 999px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 212, 255, 0.4);
}
</style>
