<script setup lang="ts">
import { useLanguage } from '~/composables/useLanguage'
import BentoGithubHeatmap from '~/modules/visuals/components/BentoGithubHeatmap.vue'
import es from '../locales/es.json'
import en from '../locales/en.json'

const { t } = useLanguage({ es, en })

const githubRepo = defineModel<string>('githubRepo', { default: '' })

defineProps<{
  testingGithub: boolean
  githubStatus: 'idle' | 'synced' | 'not_found' | 'unauthorized' | 'error'
  githubMessage: string
  hasGithubData: boolean
}>()

const emit = defineEmits<{
  (e: 'test'): void
}>()
</script>

<template>
  <!-- Block 3: GitHub Sync Card -->
  <section 
    class="rounded-3xl p-8 md:p-10 space-y-6 transition-all duration-300 border bg-surface-elevated"
    :class="hasGithubData ? 'border-white/15 shadow-lg shadow-black/20' : 'border-dashed border-white/10 hover:border-white/15'"
  >
    <div class="flex items-center justify-between pb-4 border-b border-white/5 gap-4">
      <div class="flex items-center gap-3">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" class="text-neutral-300">
          <path fill-rule="evenodd" clip-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
        </svg>
        <h2 class="font-serif text-lg md:text-2xl text-white font-normal">{{ t.github.title }}</h2>
      </div>

      <!-- Visual Status Eye Pill -->
      <div class="flex items-center gap-2 shrink-0">
        <span
          class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono tracking-wider transition-colors duration-300 border"
          :class="hasGithubData 
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.2)]' 
            : 'bg-white/5 border-white/10 text-neutral-500'"
        >
          <svg v-if="hasGithubData" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
            <circle cx="12" cy="12" r="3"></circle>
          </svg>
          <svg v-else width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"></path>
            <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"></path>
            <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"></path>
            <line x1="2" y1="2" x2="22" y2="22"></line>
          </svg>
          <span>{{ hasGithubData ? (t.badges?.public_active || 'Visible') : (t.badges?.public_hidden || 'Oculto') }}</span>
        </span>
      </div>
    </div>

    <div class="flex gap-3">
      <input
        v-model="githubRepo"
        @blur="emit('test')"
        type="text"
        :placeholder="t.github.repo_placeholder"
        class="flex-1 bg-surface-dark border border-white/15 rounded-xl px-4 py-3.5 text-white text-sm font-mono focus:outline-none focus:border-[#00D4FF]/60 transition-colors placeholder:text-neutral-500"
      />
      <button
        type="button"
        :disabled="testingGithub"
        @click="emit('test')"
        class="px-5 py-3.5 bg-surface-dark hover:bg-white/5 border border-white/15 text-white rounded-xl text-xs font-sans tracking-wide transition-colors shrink-0 cursor-pointer disabled:opacity-50"
      >
        {{ testingGithub ? t.github.testing : t.github.test_sync }}
      </button>
    </div>

    <p class="text-[11px] font-sans text-neutral-400 font-extralight -mt-2">
      Ingresa la URL o formato <code class="text-neutral-300 font-mono">usuario/repositorio</code>. El repositorio debe ser <strong>público</strong> en GitHub para mostrar su actividad.
    </p>

    <!-- Loading Feedback -->
    <div v-if="testingGithub" class="flex items-center gap-2 text-xs text-neutral-400 p-3 rounded-xl bg-white/[0.02] border border-white/5 animate-pulse">
      <span class="w-3.5 h-3.5 rounded-full border-2 border-[#00D4FF] border-t-transparent animate-spin"></span>
      <span>Comprobando conexión con GitHub...</span>
    </div>

    <!-- Private / Not Found Alert -->
    <div 
      v-else-if="githubStatus === 'not_found' || githubStatus === 'unauthorized'" 
      class="p-4 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-200 text-xs flex flex-col gap-1.5"
    >
      <div class="flex items-center gap-2 font-medium">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="shrink-0 text-amber-400">
          <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
          <line x1="12" y1="9" x2="12" y2="13"/>
          <line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
        <span>Repositorio no encontrado o privado</span>
      </div>
      <p class="font-extralight text-amber-200/90 leading-relaxed">
        GitHub bloquea el acceso a repositorios privados sin credenciales. Para que tus visitantes puedan ver los commits en tu showcase público de Facto, el repositorio debe ser <strong class="font-medium text-white">público</strong> en GitHub.
      </p>
    </div>

    <!-- Error Alert -->
    <div 
      v-else-if="githubStatus === 'error'" 
      class="p-4 rounded-xl border border-red-500/30 bg-red-500/10 text-red-200 text-xs flex items-center gap-2"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="shrink-0 text-red-400">
        <circle cx="12" cy="12" r="10"/>
        <line x1="15" y1="9" x2="9" y2="15"/>
        <line x1="9" y1="9" x2="15" y2="15"/>
      </svg>
      <span>{{ githubMessage || 'Error al conectar con la API de GitHub. Verifica el formato del repositorio.' }}</span>
    </div>

    <!-- Success Heatmap Preview -->
    <div v-else-if="githubStatus === 'synced'" class="pt-2">
      <BentoGithubHeatmap :repo="githubRepo" />
    </div>
  </section>
</template>
