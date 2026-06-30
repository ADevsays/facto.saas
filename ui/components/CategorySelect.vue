<script setup lang="ts">
import { computed, ref, onMounted, nextTick } from 'vue'
import { useCategories } from '~/composables/useCategories'

const model = defineModel<string[]>({ required: true, default: () => [] })

const { categories, fetchCategories } = useCategories()

onMounted(() => {
  fetchCategories()
})

const open = ref(false)
const containerRef = ref<HTMLElement | null>(null)
const selected = computed(() => {
  if (!model.value.length) return null
  return model.value.map(slug => categories.value?.find(c => c.slug === slug)?.name).filter(Boolean).join(', ')
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

function toggleCategory(slug: string) {
  const current = [...model.value]
  const index = current.indexOf(slug)
  if (index > -1) {
    current.splice(index, 1)
  } else {
    current.push(slug)
  }
  model.value = current
}
</script>

<template>
  <div class="relative" ref="containerRef">
    <button
      type="button"
      @click="toggleOpen"
      class="w-full flex items-center justify-between bg-white/[0.07] border border-white/20 rounded-xl px-4 py-3.5 text-sm font-sans font-light transition-all duration-300 hover:border-white/40 focus:outline-none focus:border-[#00D4FF]/70"
      :class="open ? 'border-[#00D4FF]/60 bg-white/[0.1]' : ''"
    >
      <span :class="selected ? 'text-white truncate max-w-[90%]' : 'text-neutral-400'">
        {{ selected || 'Selecciona categorías' }}
      </span>
      <svg
        class="shrink-0 transition-transform duration-300 text-neutral-400"
        :class="open ? 'rotate-180' : ''"
        width="12" height="12" viewBox="0 0 12 12" fill="none"
      >
        <path d="M2 4L6 8L10 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </button>

    <div
      v-if="open"
      class="absolute z-50 top-full mt-2 w-full bg-[#0c0c10] border border-white/20 rounded-xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-xl max-h-[220px] overflow-y-auto custom-scrollbar"
    >
      <button
        v-for="cat in categories"
        :key="cat.slug"
        type="button"
        @click="toggleCategory(cat.slug)"
        class="w-full flex items-center justify-between px-4 py-3 text-sm font-sans font-light text-left transition-colors duration-150"
        :class="model.includes(cat.slug) ? 'text-[#00D4FF] bg-[#00D4FF]/10' : 'text-neutral-300 hover:text-white hover:bg-white/[0.08]'"
      >
        <span>{{ cat.name }}</span>
        <span v-if="model.includes(cat.slug)" class="text-[#00D4FF]">✓</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 10px; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(0, 212, 255, 0.3); }
</style>
