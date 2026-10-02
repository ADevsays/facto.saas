<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useLanguage } from '~/composables/useLanguage'

const props = defineProps<{
  repo: string
}>()

const { language } = useLanguage()
const isEs = computed(() => language.value === 'es')

const loading = ref(true)
const activityData = ref<any>(null)
const hoveredDay = ref<{ date: string; count: number } | null>(null)
const tooltipPosition = ref({ x: 0, y: 0 })

const MONTHS_ES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
const MONTHS_EN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

let computingRetries = 0
let retryTimeout: ReturnType<typeof setTimeout> | null = null

async function fetchActivity(isManualRetry = false) {
  if (!props.repo) return
  if (isManualRetry) {
    computingRetries = 0
  }
  loading.value = true
  try {
    const data = await $fetch<any>(`/api/github/activity?target=${encodeURIComponent(props.repo)}`)
    if (data?.status === 'computing' && computingRetries < 3) {
      computingRetries++
      if (retryTimeout) clearTimeout(retryTimeout)
      retryTimeout = setTimeout(() => {
        fetchActivity()
      }, 2000)
      return
    }
    activityData.value = data
  } catch {
    activityData.value = null
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  if (props.repo) {
    fetchActivity()
  }
})

watch(() => props.repo, (newRepo) => {
  if (newRepo) {
    fetchActivity()
  }
})

const totalContributions = computed(() => {
  return activityData.value?.totalContributions || 0
})

const weeks = computed(() => {
  return activityData.value?.weeks || []
})

const months = computed(() => {
  if (!activityData.value?.months) return []
  return activityData.value.months.map((m: any) => {
    const monthIdx = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].indexOf(m.name)
    const localizedName = monthIdx !== -1 
      ? (isEs.value ? MONTHS_ES[monthIdx] : MONTHS_EN[monthIdx])
      : m.name
    return {
      name: localizedName,
      weekIndex: m.weekIndex
    }
  })
})

function getCellColor(level: number): string {
  switch (level) {
    case 1:
      return 'bg-[#0e4429] border border-[#0e4429]'
    case 2:
      return 'bg-[#006d32] border border-[#006d32]'
    case 3:
      return 'bg-[#26a641] border border-[#26a641]'
    case 4:
      return 'bg-[#39d353] border border-[#39d353] shadow-[0_0_8px_rgba(57,211,83,0.35)]'
    default:
      return 'bg-[#161b22] border border-white/[0.04]'
  }
}

function handleMouseEnter(day: any, event: MouseEvent) {
  hoveredDay.value = day
  const target = event.currentTarget as HTMLElement
  if (target) {
    const rect = target.getBoundingClientRect()
    tooltipPosition.value = {
      x: rect.left + rect.width / 2,
      y: rect.top - 8
    }
  }
}

function handleMouseLeave() {
  hoveredDay.value = null
}

function formatDayDate(dateStr?: string) {
  if (!dateStr) return ''
  const date = new Date(dateStr + 'T12:00:00Z')
  return date.toLocaleDateString(isEs.value ? 'es-ES' : 'en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}
</script>

<template>
  <div class="w-full flex flex-col justify-between select-none">
    <!-- Header: Contributions in the last year (Without repository link) -->
    <div class="flex items-center justify-between gap-3 mb-4">
      <div class="flex items-center gap-2.5">
        <svg class="w-4 h-4 text-neutral-300" viewBox="0 0 24 24" fill="currentColor">
          <path fill-rule="evenodd" clip-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
        </svg>
        <span class="font-sans text-sm md:text-base font-normal text-white tracking-tight">
          <template v-if="loading">
            {{ isEs ? 'Cargando actividad...' : 'Loading activity...' }}
          </template>
          <template v-else>
            {{ totalContributions.toLocaleString() }} {{ isEs ? 'contribuciones en el último año' : 'contributions in the last year' }}
          </template>
        </span>
      </div>
    </div>

    <!-- Calendar Container Card: fills full width -->
    <div class="rounded-2xl border border-white/10 bg-[#0d1117] p-4 md:p-6 overflow-x-auto custom-scrollbar relative w-full">
      <div v-if="loading" class="w-full h-32 flex items-center justify-center">
        <span class="w-5 h-5 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin"></span>
      </div>

      <div v-else-if="weeks.length > 0" class="min-w-[660px] w-full flex flex-col gap-2">
        <!-- Months row aligned across full width -->
        <div class="flex items-center text-[10px] font-mono text-neutral-400 pl-7 md:pl-8 h-4 relative w-full">
          <span 
            v-for="(m, i) in months" 
            :key="i"
            class="absolute truncate"
            :style="{ left: `calc(32px + ${(m.weekIndex / 52) * 92}%)` }"
          >
            {{ m.name }}
          </span>
        </div>

        <!-- Heatmap Grid + Days column -->
        <div class="flex gap-2 md:gap-3 w-full items-center">
          <!-- Days labels (Lun, Mié, Vie / Mon, Wed, Fri) -->
          <div class="w-6 shrink-0 flex flex-col justify-between text-[9px] font-mono text-neutral-500 select-none py-[2px] h-[92px] md:h-[105px]">
            <span class="leading-none"></span>
            <span class="leading-none">{{ isEs ? 'Lun' : 'Mon' }}</span>
            <span class="leading-none"></span>
            <span class="leading-none">{{ isEs ? 'Mié' : 'Wed' }}</span>
            <span class="leading-none"></span>
            <span class="leading-none">{{ isEs ? 'Vie' : 'Fri' }}</span>
            <span class="leading-none"></span>
          </div>

          <!-- 52 columns filling 100% of available width -->
          <div class="w-full grid grid-cols-[repeat(52,minmax(0,1fr))] gap-[2.5px] md:gap-[3.5px]">
            <div 
              v-for="(w, wIdx) in weeks" 
              :key="wIdx" 
              class="flex flex-col gap-[2.5px] md:gap-[3.5px]"
            >
              <div 
                v-for="(d, dIdx) in w.days" 
                :key="dIdx"
                @mouseenter="handleMouseEnter(d, $event)"
                @mouseleave="handleMouseLeave"
                class="w-full aspect-square rounded-[2px] md:rounded-[3px] transition-transform duration-150 hover:scale-125 hover:z-20 cursor-pointer"
                :class="getCellColor(d.level)"
              />
            </div>
          </div>
        </div>

        <!-- Heatmap Footer: Without external links -->
        <div class="flex items-center justify-between text-[11px] font-sans font-light text-neutral-500 pt-3 border-t border-white/5 mt-2">
          <span>{{ isEs ? 'Actividad de desarrollo en GitHub' : 'Development activity on GitHub' }}</span>

          <div class="flex items-center gap-1.5 text-[10px] font-mono text-neutral-400">
            <span>{{ isEs ? 'Menos' : 'Less' }}</span>
            <span class="w-[9px] h-[9px] rounded-[2px] bg-[#161b22] border border-white/[0.04]"></span>
            <span class="w-[9px] h-[9px] rounded-[2px] bg-[#0e4429] border border-[#0e4429]"></span>
            <span class="w-[9px] h-[9px] rounded-[2px] bg-[#006d32] border border-[#006d32]"></span>
            <span class="w-[9px] h-[9px] rounded-[2px] bg-[#26a641] border border-[#26a641]"></span>
            <span class="w-[9px] h-[9px] rounded-[2px] bg-[#39d353] border border-[#39d353]"></span>
            <span>{{ isEs ? 'Más' : 'More' }}</span>
          </div>
        </div>
      </div>

      <!-- Fallback empty / private -->
      <div v-else class="text-center py-8 text-neutral-400 text-xs flex flex-col items-center justify-center gap-3">
        <p class="max-w-md">
          {{ isEs 
            ? 'No se pudo cargar la actividad del repositorio. Asegúrate de que el repositorio sea público en GitHub.' 
            : 'Could not load repository activity. Make sure the repository is public on GitHub.' 
          }}
        </p>
        <button
          @click="fetchActivity(true)"
          class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-sans text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors cursor-pointer"
        >
          <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 21h5v-5"/></svg>
          <span>{{ isEs ? 'Reintentar' : 'Retry' }}</span>
        </button>
      </div>
    </div>

    <!-- Floating Tooltip -->
    <Teleport to="body">
      <div 
        v-if="hoveredDay" 
        class="fixed z-[9999] pointer-events-none -translate-x-1/2 -translate-y-full mb-1 px-2.5 py-1.5 rounded-lg bg-[#030305]/95 border border-white/20 text-white text-[10px] font-sans shadow-xl backdrop-blur-md whitespace-nowrap"
        :style="{ left: `${tooltipPosition.x}px`, top: `${tooltipPosition.y}px` }"
      >
        <span class="font-medium text-emerald-400">
          {{ hoveredDay.count }} {{ isEs ? 'contribuciones' : (hoveredDay.count === 1 ? 'contribution' : 'contributions') }}
        </span> 
        {{ isEs ? 'el' : 'on' }} {{ formatDayDate(hoveredDay.date) }}
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  height: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 9999px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(57, 211, 83, 0.4);
}
</style>
