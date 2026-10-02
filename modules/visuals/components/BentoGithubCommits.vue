<script setup lang="ts">
import { ref, onMounted } from 'vue'

const props = defineProps<{
  repo: string
}>()

const commits = ref<any[]>([])
const loading = ref(true)

onMounted(async () => {
  if (!props.repo) return
  try {
    const data = await $fetch<{ commits: any[] }>(`/api/github/commits?repo=${encodeURIComponent(props.repo)}`)
    commits.value = data.commits || []
  } catch (e) {
    commits.value = []
  } finally {
    loading.value = false
  }
})

function formatRelativeDate(dateStr?: string) {
  if (!dateStr) return ''
  const diff = Date.now() - new Date(dateStr).getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  if (days === 0) {
    const hours = Math.floor(diff / (1000 * 60 * 60))
    return hours <= 1 ? 'Hace poco' : `Hace ${hours}h`
  }
  return days === 1 ? 'Ayer' : `Hace ${days}d`
}
</script>

<template>
  <div class="h-full flex flex-col justify-between">
    <div class="flex items-center justify-between gap-3 mb-4">
      <div class="flex items-center gap-2">
        <svg class="w-4 h-4 text-neutral-400" viewBox="0 0 24 24" fill="currentColor">
          <path fill-rule="evenodd" clip-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
        </svg>
        <span class="text-xs font-mono text-neutral-300 truncate max-w-[200px]">{{ repo }}</span>
      </div>
      <span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[10px] font-mono text-emerald-400">
        <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
        Live
      </span>
    </div>

    <div v-if="loading" class="space-y-3 my-auto">
      <div v-for="i in 3" :key="i" class="h-8 bg-white/5 rounded-lg animate-pulse"></div>
    </div>

    <div v-else-if="commits.length > 0" class="space-y-2.5 my-2">
      <a
        v-for="c in commits.slice(0, 3)"
        :key="c.sha"
        :href="c.url"
        target="_blank"
        rel="noopener noreferrer"
        class="group/commit block p-2.5 rounded-xl bg-white/[0.02] border border-white/5 hover:border-[#00D4FF]/30 hover:bg-white/[0.04] transition-all duration-300"
      >
        <div class="flex items-center justify-between gap-2 mb-1">
          <span class="text-xs font-sans text-neutral-200 group-hover/commit:text-white truncate flex-1">{{ c.message }}</span>
          <span class="text-[10px] font-mono text-neutral-500 group-hover/commit:text-[#00D4FF] shrink-0">{{ c.sha }}</span>
        </div>
        <div class="flex items-center justify-between text-[10px] text-neutral-500 font-sans">
          <span>{{ c.authorName }}</span>
          <span>{{ formatRelativeDate(c.date) }}</span>
        </div>
      </a>
    </div>

    <div v-else class="py-6 text-center text-xs text-neutral-500 font-sans">
      Sin commits públicos recientes
    </div>

    <a
      :href="`https://github.com/${repo}`"
      target="_blank"
      rel="noopener noreferrer"
      class="inline-flex items-center gap-1.5 text-xs text-[#00D4FF] hover:text-[#00D4FF]/80 font-sans font-light mt-3 group"
    >
      <span>Ver repositorio en GitHub</span>
      <svg class="w-3 h-3 transition-transform group-hover:translate-x-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M5 12h14M12 5l7 7-7 7"/>
      </svg>
    </a>
  </div>
</template>
