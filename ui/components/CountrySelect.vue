<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { useCountries } from '~/composables/useCountries'

const model = defineModel<string>({ required: true, default: '' })

const props = withDefaults(defineProps<{
  darkBackground?: boolean
  forAdding?: boolean
}>(), {
  darkBackground: false,
  forAdding: false,
})

const { countries, fetchCountries } = useCountries()
const { locale } = useI18n()

onMounted(() => {
  fetchCountries()
})

const open = ref(false)
const opensUpwards = ref(false)
const containerRef = ref<HTMLElement | null>(null)
const dropdownRef = ref<HTMLElement | null>(null)
const searchInput = ref<HTMLInputElement | null>(null)
const searchQuery = ref('')
const highlightedIndex = ref(-1)
const addMode = computed(() => props.forAdding)

const selected = computed(() => {
  if (!model.value) return null
  return countries.value?.find(c => c.slug === model.value)
})

const sortedCountries = computed(() => {
  if (!countries.value) return []
  return [...countries.value].sort((a, b) => {
    if (a.slug === 'global') return -1
    if (b.slug === 'global') return 1
    if (addMode.value) return a.name.localeCompare(b.name, locale.value)

    const aCount = a.startupsCount || 0
    const bCount = b.startupsCount || 0

    if (aCount > 0 && bCount === 0) return -1
    if (aCount === 0 && bCount > 0) return 1
    if (aCount > 0 && bCount > 0 && bCount !== aCount) return bCount - aCount

    return a.name.localeCompare(b.name)
  })
})

function normalizeSearch(value: string) {
  return value.toLocaleLowerCase(locale.value).normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

const visibleCountries = computed(() => {
  const query = normalizeSearch(searchQuery.value.trim())
  if (!query) return sortedCountries.value
  return sortedCountries.value.filter((country) => normalizeSearch(`${country.name} ${country.slug} ${country.iso_code || ''}`).includes(query))
})

const otherCountriesLabel = computed(() => locale.value === 'en' ? 'Other countries' : 'Otros países')
const searchPlaceholder = computed(() => locale.value === 'en' ? 'Search country...' : 'Buscar país...')
const noResultsLabel = computed(() => locale.value === 'en' ? 'No countries found' : 'No se encontraron países')

async function toggleOpen() {
  open.value = !open.value
  if (open.value) {
    searchQuery.value = ''
    await nextTick()
    if (containerRef.value) {
      const rect = containerRef.value.getBoundingClientRect()
      const spaceBelow = window.innerHeight - rect.bottom
      opensUpwards.value = spaceBelow < 250 || rect.bottom > window.innerHeight * 0.65
    }
    const idx = visibleCountries.value.findIndex(c => c.slug === model.value)
    highlightedIndex.value = idx >= 0 ? idx : 0
    await nextTick()
    if (addMode.value) searchInput.value?.focus()
    scrollToHighlighted()
  } else {
    searchQuery.value = ''
  }
}

function selectCountry(slug: string) {
  model.value = slug
  open.value = false
  searchQuery.value = ''
}

function scrollToHighlighted() {
  if (!dropdownRef.value || highlightedIndex.value < 0) return
  const targetSlug = visibleCountries.value[highlightedIndex.value]?.slug
  if (!targetSlug) return
  const activeEl = dropdownRef.value.querySelector(`#country-${targetSlug}`) as HTMLElement | null
  activeEl?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
}

let searchTimeout: ReturnType<typeof setTimeout> | undefined
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

  if (event.ctrlKey || event.metaKey || event.altKey) return
  if (event.key === 'Escape') {
    open.value = false
    searchQuery.value = ''
    return
  }

  if (event.key === 'Enter') {
    event.preventDefault()
    const country = visibleCountries.value[highlightedIndex.value]
    if (country) selectCountry(country.slug)
    return
  }

  if (event.key === 'ArrowDown') {
    event.preventDefault()
    if (highlightedIndex.value < visibleCountries.value.length - 1) {
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

  if (!addMode.value && event.target !== searchInput.value && event.key.length === 1 && /[a-zA-ZáéíóúÁÉÍÓÚñÑ]/.test(event.key)) {
    const key = event.key.toLocaleLowerCase(locale.value)
    const matches = visibleCountries.value
      .map((country, idx) => ({ country, idx }))
      .filter(({ country }) => country.name.toLocaleLowerCase(locale.value).startsWith(key) || country.slug.toLocaleLowerCase(locale.value).startsWith(key))

    if (matches.length > 0) {
      lastKeyIndex = lastKey === key ? (lastKeyIndex + 1) % matches.length : 0
      lastKey = key
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

watch(searchQuery, async () => {
  highlightedIndex.value = visibleCountries.value.length > 0 ? 0 : -1
  await nextTick()
  scrollToHighlighted()
})

function handleClickOutside(event: MouseEvent) {
  if (containerRef.value && !containerRef.value.contains(event.target as Node)) {
    open.value = false
    searchQuery.value = ''
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
      :aria-expanded="open"
      aria-haspopup="listbox"
    >
      <div v-if="selected?.slug === 'global'" class="text-neutral-300 transition-opacity" :class="addMode ? 'opacity-100' : 'opacity-90 hover:opacity-100'">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/><path d="M2 12h20"/></svg>
      </div>
      <img
        v-else-if="selected && selected.iso_code"
        :src="`https://flagcdn.com/w40/${selected.iso_code}.png`"
        :alt="selected.name"
        :title="selected.name"
        class="w-6 rounded-sm shadow-sm transition-opacity"
        :class="addMode ? 'opacity-100' : 'opacity-90 hover:opacity-100'"
      />
      <span v-else class="text-neutral-400" :class="addMode ? 'opacity-100' : 'opacity-60'">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/><path d="M2 12h20"/></svg>
      </span>
    </button>

    <div
      v-if="open"
      ref="dropdownRef"
      class="absolute z-50 right-0 w-[230px] border border-white/15 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.95)] backdrop-blur-xl p-1.5"
      :class="[
        opensUpwards ? 'bottom-full mb-2' : 'top-full mt-2',
        darkBackground ? 'bg-surface-dark' : 'bg-surface-elevated',
        addMode ? 'flex max-h-[320px] w-[250px] flex-col overflow-hidden' : 'max-h-[250px] overflow-y-auto custom-scrollbar'
      ]"
    >
      <label v-if="addMode" class="mb-1.5 flex h-10 shrink-0 items-center gap-2 rounded-lg border border-white/10 bg-black/20 px-2.5 text-neutral-500 focus-within:border-[#00D4FF]/40 focus-within:text-neutral-300">
        <svg class="h-4 w-4 shrink-0" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <circle cx="8.8" cy="8.8" r="5.8" stroke="currentColor" stroke-width="1.6" />
          <path d="m13.2 13.2 4 4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
        </svg>
        <input
          ref="searchInput"
          v-model="searchQuery"
          type="search"
          autocomplete="off"
          :placeholder="searchPlaceholder"
          :aria-label="searchPlaceholder"
          class="h-full min-w-0 flex-1 bg-transparent text-xs text-white outline-none placeholder:text-neutral-500"
          @keydown.esc.stop.prevent="open = false"
        />
      </label>

      <div role="listbox" :class="addMode ? 'min-h-0 flex-1 overflow-y-auto custom-scrollbar' : ''">
        <template v-for="(country, idx) in visibleCountries" :key="country.slug">
          <div
            v-if="!addMode && idx > 0 && (country.startupsCount || 0) === 0 && (visibleCountries[idx - 1]?.startupsCount || 0) > 0"
            class="border-t border-white/10 my-1 pt-1.5 px-2.5 text-[10px] font-mono uppercase tracking-wider text-neutral-500 select-none"
          >
            {{ otherCountriesLabel }}
          </div>

          <button
            :id="`country-${country.slug}`"
            type="button"
            role="option"
            :aria-selected="model === country.slug"
            @click.stop="selectCountry(country.slug)"
            @mouseenter="highlightedIndex = idx"
            :title="country.name"
            class="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-left text-xs font-sans transition-all duration-150 cursor-pointer my-0.5"
            :class="[
              model === country.slug
                ? 'bg-[#00D4FF]/20 text-white font-medium border border-[#00D4FF]/30'
                : (highlightedIndex === idx ? 'bg-white/10 text-white' : (addMode || (country.startupsCount || 0) > 0 || country.slug === 'global' ? 'text-neutral-200 hover:bg-white/5' : 'text-neutral-400 opacity-75 hover:opacity-100 hover:bg-white/5'))
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
              :class="!addMode && (country.startupsCount || 0) === 0 ? 'opacity-70' : ''"
            />
            <span v-else class="text-sm shrink-0" :class="!addMode && (country.startupsCount || 0) === 0 ? 'opacity-70' : ''">{{ country.flag }}</span>

            <span class="truncate flex-1 text-xs">{{ country.name }}</span>

            <span
              v-if="!addMode && (country.startupsCount || 0) > 0"
              class="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#00D4FF]/10 text-[#00D4FF] border border-[#00D4FF]/20 shrink-0 font-medium"
            >
              {{ country.startupsCount }}
            </span>

            <svg v-if="model === country.slug" class="w-3.5 h-3.5 text-[#00D4FF] shrink-0 ml-auto" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          </button>
        </template>
        <p v-if="visibleCountries.length === 0" class="px-2.5 py-3 text-xs text-neutral-500">{{ noResultsLabel }}</p>
      </div>
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
input[type='search']::-webkit-search-cancel-button {
  display: none;
}
</style>
