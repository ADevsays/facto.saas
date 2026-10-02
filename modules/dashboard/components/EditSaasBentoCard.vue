<script setup lang="ts">
import { useLanguage } from '~/composables/useLanguage'
import TechStackSelect from '~/ui/components/TechStackSelect.vue'
import es from '../locales/es.json'
import en from '../locales/en.json'

const { t } = useLanguage({ es, en })

const problemSolved = defineModel<string>('problemSolved', { default: '' })
const valueProposition = defineModel<string>('valueProposition', { default: '' })
const acquisitionChannels = defineModel<string[]>('acquisitionChannels', { default: () => [] })
const newChannel = defineModel<string>('newChannel', { default: '' })
const techStack = defineModel<string[]>('techStack', { default: () => [] })

defineProps<{
  hasBentoData: boolean
}>()

const emit = defineEmits<{
  (e: 'addChannel'): void
  (e: 'removeChannel', idx: number): void
}>()
</script>

<template>
  <!-- Block 2: Value & Growth Card -->
  <section 
    class="rounded-3xl p-8 md:p-10 space-y-6 transition-all duration-300 border bg-surface-elevated"
    :class="hasBentoData ? 'border-white/15 shadow-lg shadow-black/20' : 'border-dashed border-white/10 hover:border-white/15'"
  >
    <div class="flex items-center justify-between pb-4 border-b border-white/5 gap-4">
      <h2 class="font-serif text-lg md:text-2xl text-white font-normal">{{ t.bento.value_title }}</h2>
      
      <div class="flex items-center gap-2 shrink-0">
        <span
          class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono tracking-wider transition-colors duration-300 border"
          :class="hasBentoData 
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.2)]' 
            : 'bg-white/5 border-white/10 text-neutral-500'"
        >
          <svg v-if="hasBentoData" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
            <circle cx="12" cy="12" r="3"></circle>
          </svg>
          <svg v-else width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"></path>
            <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"></path>
            <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"></path>
            <line x1="2" y1="2" x2="22" y2="22"></line>
          </svg>
          <span>{{ hasBentoData ? (t.badges?.public_active || 'Visible') : (t.badges?.public_hidden || 'Oculto') }}</span>
        </span>
      </div>
    </div>

    <!-- Problem Solved & Value Proposition Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="space-y-2 min-w-0">
        <label class="block text-[10px] font-sans font-medium uppercase tracking-[0.2em] text-neutral-300">{{ t.bento.problem_solved }}</label>
        <textarea
          v-model="problemSolved"
          rows="2"
          :placeholder="t.bento.problem_placeholder"
          class="w-full bg-surface-dark border border-white/15 rounded-xl px-4 py-3 text-white text-sm font-light focus:outline-none focus:border-[#00D4FF]/60 transition-colors resize-none min-h-[76px] custom-scrollbar placeholder:text-neutral-500"
        ></textarea>
      </div>

      <div class="space-y-2 min-w-0">
        <label class="block text-[10px] font-sans font-medium uppercase tracking-[0.2em] text-neutral-300">{{ t.bento.value_prop }}</label>
        <textarea
          v-model="valueProposition"
          rows="2"
          :placeholder="t.bento.value_prop_placeholder"
          class="w-full bg-surface-dark border border-white/15 rounded-xl px-4 py-3 text-white text-sm font-light focus:outline-none focus:border-[#00D4FF]/60 transition-colors resize-none min-h-[76px] custom-scrollbar placeholder:text-neutral-500"
        ></textarea>
      </div>
    </div>

    <!-- Acquisition Channels & Tech Stack Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Acquisition Channels -->
      <div class="space-y-2 min-w-0">
        <label class="block text-[10px] font-sans font-medium uppercase tracking-[0.2em] text-neutral-300">{{ t.bento.acquisition_channels }}</label>
        <div class="flex flex-wrap gap-2 mb-2">
          <span
            v-for="(ch, idx) in acquisitionChannels"
            :key="idx"
            class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-sans bg-cyan-500/10 border border-cyan-500/20 text-cyan-300"
          >
            <span>{{ ch }}</span>
            <button type="button" @click="emit('removeChannel', idx)" class="text-cyan-400/60 hover:text-white">×</button>
          </span>
        </div>
        <div class="flex items-center gap-2.5">
          <input
            v-model="newChannel"
            @keydown.enter.prevent="emit('addChannel')"
            type="text"
            :placeholder="t.bento.add_channel_placeholder"
            class="flex-1 min-w-0 bg-surface-dark border border-white/15 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#00D4FF]/60 placeholder:text-neutral-500"
          />
          <button
            type="button"
            @click="emit('addChannel')"
            class="px-4 py-3 bg-surface-dark hover:bg-white/5 border border-white/15 text-white rounded-xl text-xs font-sans transition-colors shrink-0 cursor-pointer"
          >
            {{ t.bento.add_btn }}
          </button>
        </div>
      </div>

      <!-- Tech Stack Tags -->
      <div class="space-y-2 min-w-0">
        <label class="block text-[10px] font-sans font-medium uppercase tracking-[0.2em] text-neutral-300">{{ t.bento.tech_stack }}</label>
        <TechStackSelect v-model="techStack" dark-background />
      </div>
    </div>
  </section>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 10px; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(0, 212, 255, 0.3); }
</style>
