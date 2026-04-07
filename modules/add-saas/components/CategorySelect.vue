<script setup lang="ts">
const model = defineModel<string>({ required: true })

// Usamos useFetch sin await para evitar bloquear el renderizado si no hay Suspense
const { data: categories } = useFetch<any[]>('/api/categories', {
  default: () => []
})

const open = ref(false)
const selected = computed(() => categories.value?.find((c) => c.slug === model.value))
</script>

<template>
  <div class="relative">
    <button
      type="button"
      @click="open = !open"
      class="w-full flex items-center justify-between bg-white/[0.07] border border-white/20 rounded-xl px-4 py-3.5 text-sm font-sans font-light transition-all duration-300 hover:border-white/40 focus:outline-none focus:border-[#00D4FF]/70"
      :class="open ? 'border-[#00D4FF]/60 bg-white/[0.1]' : ''"
    >
      <span :class="selected ? 'text-white' : 'text-neutral-400'">
        {{ selected?.name ?? 'Selecciona una categoría' }}
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
        @click="model = cat.slug; open = false"
        class="w-full flex items-center px-4 py-3 text-sm font-sans font-light text-left transition-colors duration-150"
        :class="model === cat.slug ? 'text-[#00D4FF] bg-[#00D4FF]/10' : 'text-neutral-300 hover:text-white hover:bg-white/[0.08]'"
      >
        {{ cat.name }}
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
