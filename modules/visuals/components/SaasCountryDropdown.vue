<script setup lang="ts">
import { computed } from 'vue'
import { useLanguage } from '~/composables/useLanguage'
import es from '../locales/es.json'
import en from '../locales/en.json'

const { t } = useLanguage({ es, en })

const props = defineProps<{
  isOpen: boolean;
  activeValue: string | null;
  countries: { name: string, slug: string, flag: string, iso_code: string, startupsCount?: number }[];
}>()

defineEmits(['toggle', 'select'])

const selected = computed(() => {
  if (!props.activeValue || props.activeValue === 'all') return null
  return props.countries.find(c => c.slug === props.activeValue)
})

const sortedCountries = computed(() => {
  const list = props.countries.filter(c => c.slug !== 'global')
  return [...list].sort((a, b) => {
    const aCount = a.startupsCount || 0
    const bCount = b.startupsCount || 0

    if (aCount > 0 && bCount === 0) return -1
    if (aCount === 0 && bCount > 0) return 1

    if (aCount > 0 && bCount > 0 && bCount !== aCount) {
      return bCount - aCount
    }

    return a.name.localeCompare(b.name)
  })
})

const activeCountries = computed(() => sortedCountries.value.filter(c => (c.startupsCount || 0) > 0))
const otherCountries = computed(() => sortedCountries.value.filter(c => (c.startupsCount || 0) === 0))
</script>

<template>
  <div class="relative w-auto flex-shrink-0">
    <button 
      type="button"
      @click="$emit('toggle')" 
      class="flex items-center justify-center bg-white/[0.04] border border-white/10 hover:border-white/20 rounded-xl h-[38px] w-[46px] sm:w-[50px] transition-all duration-300 cursor-pointer min-w-[46px] sm:min-w-[50px] shrink-0"
      :class="isOpen ? 'border-[#00D4FF]/40 bg-white/[0.08] country-btn-glow' : ''"
      title="Filtrar por país"
    >
      <div v-if="selected?.slug === 'global'" class="text-neutral-400 opacity-90 transition-opacity hover:opacity-100">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/><path d="M2 12h20"/></svg>
      </div>
      <img 
        v-else-if="selected && selected.iso_code" 
        :src="`https://flagcdn.com/w40/${selected.iso_code}.png`" 
        :alt="selected.name"
        :title="selected.name"
        class="w-5 rounded-[2px] shadow-sm opacity-90 transition-opacity hover:opacity-100"
      />
      <span v-else class="text-neutral-400 opacity-60">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/><path d="M2 12h20"/></svg>
      </span>
    </button>
    
    <div 
      v-if="isOpen" 
      class="absolute right-0 mt-2 w-[220px] bg-[#0c0c10] border border-white/15 rounded-xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.95)] z-50 flex flex-col py-1 max-h-60 overflow-y-auto no-scrollbar animate-fade-in"
    >
      <button 
        @click="$emit('select', 'all')"
        class="px-4 py-2 flex items-center gap-3 text-left text-xs font-sans tracking-wide hover:bg-white/[0.08] transition-colors duration-200"
        :class="(!activeValue || activeValue === 'all') ? 'bg-[#00D4FF]/10 text-[#00D4FF] font-medium' : 'text-neutral-300'"
      >
        <div class="text-neutral-400 shrink-0 flex justify-center w-5">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/><path d="M2 12h20"/></svg>
        </div>
        {{ t.filters?.all_countries || 'Todos los países' }}
      </button>

      <!-- Países con startups registradas -->
      <button 
        v-for="country in activeCountries" 
        :key="country.slug"
        @click="$emit('select', country.slug)"
        class="px-4 py-2 flex items-center justify-between gap-3 text-left text-xs font-sans tracking-wide hover:bg-white/[0.08] transition-colors duration-200"
        :class="activeValue === country.slug ? 'bg-[#00D4FF]/10 text-[#00D4FF] font-medium' : 'text-neutral-300'"
      >
        <div class="flex items-center gap-3 min-w-0">
          <div class="shrink-0 flex justify-center w-5">
            <img 
              v-if="country.iso_code" 
              :src="`https://flagcdn.com/w40/${country.iso_code}.png`" 
              :alt="country.name"
              class="w-5 rounded-[2px] shadow-sm"
            />
            <span v-else class="text-base leading-none">{{ country.flag }}</span>
          </div>
          <span class="truncate">{{ country.name }}</span>
        </div>
        <span 
          v-if="(country.startupsCount || 0) > 0" 
          class="text-[10px] font-mono text-[#00D4FF] bg-[#00D4FF]/10 border border-[#00D4FF]/20 px-1.5 py-0.5 rounded shrink-0 font-medium"
        >
          {{ country.startupsCount }}
        </span>
      </button>

      <!-- Otros países (vacíos) -->
      <div 
        v-if="otherCountries.length > 0 && activeCountries.length > 0"
        class="px-4 py-1.5 text-[10px] font-mono uppercase tracking-wider text-neutral-500 border-t border-white/10 mt-1 select-none"
      >
        {{ t.filters?.other_countries || 'Otros países' }}
      </div>

      <button 
        v-for="country in otherCountries" 
        :key="country.slug"
        @click="$emit('select', country.slug)"
        class="px-4 py-1.5 flex items-center justify-between gap-3 text-left text-xs font-sans tracking-wide hover:bg-white/[0.08] transition-colors duration-200 text-neutral-400 opacity-70 hover:opacity-100"
        :class="activeValue === country.slug ? 'bg-[#00D4FF]/10 text-[#00D4FF] font-medium opacity-100' : ''"
      >
        <div class="flex items-center gap-3 min-w-0">
          <div class="shrink-0 flex justify-center w-5">
            <img 
              v-if="country.iso_code" 
              :src="`https://flagcdn.com/w40/${country.iso_code}.png`" 
              :alt="country.name"
              class="w-5 rounded-[2px] shadow-sm opacity-60"
            />
            <span v-else class="text-base leading-none opacity-60">{{ country.flag }}</span>
          </div>
          <span class="truncate">{{ country.name }}</span>
        </div>
      </button>
    </div>
  </div>
</template>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.2s ease-out;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-5px); }
  to { opacity: 1; transform: translateY(0); }
}
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

.country-btn-glow {
  box-shadow: 0 0 10px rgba(0,212,255,0.05), inset 0 0 5px rgba(0,212,255,0.05);
}
</style>
