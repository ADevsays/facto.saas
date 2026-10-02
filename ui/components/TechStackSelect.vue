<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { TECH_STACK_CATALOG, getTechItem } from '~/utils/techStack'
import TechBadge from './TechBadge.vue'

const props = withDefaults(defineProps<{
  modelValue: string[]
  darkBackground?: boolean
}>(), {
  darkBackground: false
})

const emit = defineEmits<{
  'update:modelValue': [value: string[]]
}>()

const searchQuery = ref('')
const isOpen = ref(false)
const selectRef = ref<HTMLElement | null>(null)

const selectedItems = computed(() => {
  return (props.modelValue || []).map(id => getTechItem(id))
})

const filteredCatalog = computed(() => {
  const query = searchQuery.value.toLowerCase().trim()
  const selectedNormalized = (props.modelValue || []).map(item => getTechItem(item).id)
  return TECH_STACK_CATALOG.filter(item => {
    if (selectedNormalized.includes(item.id)) return false
    if (!query) return true
    return item.name.toLowerCase().includes(query) || item.category.toLowerCase().includes(query)
  })
})

function toggleItem(id: string) {
  const current = [...(props.modelValue || [])]
  const norm = id.toLowerCase().trim()
  const idx = current.findIndex(item => {
    const itemNorm = item.toLowerCase().trim()
    const tech = getTechItem(item)
    return itemNorm === norm || tech.id === norm
  })
  if (idx >= 0) {
    current.splice(idx, 1)
  } else {
    current.push(id)
  }
  emit('update:modelValue', current)
}

function removeByIndex(index: number) {
  const current = [...(props.modelValue || [])]
  if (index >= 0 && index < current.length) {
    current.splice(index, 1)
    emit('update:modelValue', current)
  }
}

function addCustomTech() {
  const query = searchQuery.value.trim()
  if (!query) return
  const id = query.toLowerCase().replace(/[^a-z0-9]/g, '')
  if (id && !(props.modelValue || []).some(item => item.toLowerCase().trim() === id || getTechItem(item).id === id)) {
    const current = [...(props.modelValue || []), query]
    emit('update:modelValue', current)
  }
  searchQuery.value = ''
}

function handleClickOutside(event: MouseEvent) {
  if (selectRef.value && !selectRef.value.contains(event.target as Node)) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <div ref="selectRef" class="relative flex flex-col gap-3 w-full">
    <!-- Selected Badges -->
    <div v-if="selectedItems.length > 0" class="flex flex-wrap gap-2">
      <TechBadge 
        v-for="(tech, idx) in selectedItems" 
        :key="tech.id + '-' + idx"
        :tech="tech.id"
        :show-name="true"
        :removable="true"
        @remove="removeByIndex(idx)"
      />
    </div>

    <!-- Dropdown Trigger & Search Input -->
    <div class="relative">
      <div 
        @click="isOpen = true"
        class="w-full border border-white/15 rounded-xl px-4 py-3 flex items-center justify-between cursor-pointer hover:border-white/30 transition-colors"
        :class="darkBackground ? 'bg-surface-dark' : 'bg-surface-elevated'"
      >
        <div class="flex items-center gap-2 flex-1">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-neutral-400">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input 
            v-model="searchQuery" 
            @focus="isOpen = true"
            @keydown.enter.prevent="addCustomTech"
            type="text" 
            placeholder="Seleccionar o buscar tecnologías (ej. Nuxt, Supabase, Stripe)..." 
            class="w-full bg-transparent text-white text-sm font-light focus:outline-none placeholder:text-neutral-500"
          />
        </div>
        <button 
          type="button" 
          @click.stop="isOpen = !isOpen"
          class="text-neutral-400 hover:text-white p-1 transition-transform duration-200"
          :class="{ 'rotate-180': isOpen }"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </button>
      </div>

      <!-- Dropdown Menu -->
      <div 
        v-if="isOpen" 
        class="absolute top-full left-0 right-0 mt-2 z-50 rounded-2xl border border-white/15 shadow-2xl p-3 max-h-64 overflow-y-auto flex flex-col gap-1 custom-scrollbar"
        :class="darkBackground ? 'bg-surface-dark' : 'bg-surface-elevated'"
      >
        <div v-if="filteredCatalog.length === 0" class="p-4 text-center text-xs text-neutral-400 font-extralight">
          <span v-if="searchQuery">Presiona Enter para agregar "{{ searchQuery }}"</span>
          <span v-else>Todas las tecnologías seleccionadas</span>
        </div>

        <button
          v-for="item in filteredCatalog"
          :key="item.id"
          type="button"
          @click="toggleItem(item.id)"
          class="flex items-center justify-between p-2.5 rounded-xl hover:bg-surface-elevated-hover text-left transition-colors group"
        >
          <div class="flex items-center gap-2.5">
            <TechBadge :tech="item.id" :show-name="false" />
            <div>
              <div class="text-sm font-sans text-neutral-200 group-hover:text-white font-normal">
                {{ item.name }}
              </div>
              <div class="text-[10px] font-sans text-neutral-400 font-light">
                {{ item.category }}
              </div>
            </div>
          </div>
          <span class="text-xs text-[#00D4FF] opacity-0 group-hover:opacity-100 transition-opacity">
            + Agregar
          </span>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 10px; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(0, 212, 255, 0.3); }
</style>
