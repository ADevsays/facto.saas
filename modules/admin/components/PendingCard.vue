<script setup lang="ts">
import type { PendingSaas } from '../composables/usePendingReview'

const props = defineProps<{
  saas: PendingSaas
  actionLoading: boolean
}>()

const emit = defineEmits<{
  approve: [id: string]
  reject: [id: string]
}>()

const initial = computed(() => props.saas.name?.charAt(0)?.toUpperCase() ?? '?')

const formattedDate = computed(() => {
  if (!props.saas.published_at) return 'Sin publicar'
  return new Date(props.saas.published_at).toLocaleDateString('es-ES', {
    day: '2-digit', month: 'short', year: 'numeric'
  })
})

const category = computed(() => props.saas.categories?.[0]?.name ?? null)
</script>

<template>
  <Transition name="card-out">
    <div
      class="relative bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6 flex flex-col gap-5 hover:border-white/10 transition-all duration-500 group"
    >
      <!-- Glow accent top -->
      <div class="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#00D4FF]/20 to-transparent rounded-full" />

      <!-- Header: Logo + Meta -->
      <div class="flex items-start gap-4">
        <!-- Logo -->
        <div class="shrink-0 w-12 h-12 rounded-xl overflow-hidden border border-white/10 bg-white/5 flex items-center justify-center">
          <img
            v-if="saas.logo_url"
            :src="saas.logo_url"
            :alt="saas.name ?? 'Logo'"
            class="w-full h-full object-cover"
          />
          <span v-else class="font-serif text-xl text-white/70">{{ initial }}</span>
        </div>

        <!-- Info -->
        <div class="flex-1 min-w-0">
          <h3 class="font-serif text-lg text-white leading-tight truncate">
            {{ saas.name ?? '— Sin nombre —' }}
          </h3>
          <p v-if="category" class="text-[10px] uppercase tracking-widest text-[#00D4FF]/70 mt-0.5">
            {{ category }}
          </p>
          <p class="text-[11px] text-neutral-600 mt-1 font-light">
            {{ formattedDate }}
          </p>
        </div>
      </div>

      <!-- Details -->
      <div class="flex flex-col gap-2">
        <div v-if="saas.startup_type" class="text-[12px] text-neutral-400 font-light leading-relaxed line-clamp-3">
          {{ saas.startup_type }}
        </div>

        <div class="flex flex-wrap gap-3 mt-1">
          <a
            v-if="saas.website_url"
            :href="saas.website_url"
            target="_blank"
            rel="noopener noreferrer"
            class="text-[10px] uppercase tracking-widest text-neutral-500 hover:text-white transition-colors font-medium"
          >
            ↗ Sitio web
          </a>
          <span
            v-if="saas.founder_email"
            class="text-[10px] text-neutral-600 font-light truncate max-w-[180px]"
          >
            {{ saas.founder_email }}
          </span>
        </div>
      </div>

      <!-- Divider -->
      <div class="h-px bg-white/[0.05]" />

      <!-- Actions -->
      <div class="flex items-center gap-3">
        <!-- Approve -->
        <button
          :disabled="actionLoading"
          @click="emit('approve', saas.id)"
          class="group/btn relative flex-1 inline-flex items-center justify-center gap-2 bg-white text-black font-bold uppercase tracking-widest text-[10px] rounded-full px-4 py-2.5 transition-all duration-700 hover:scale-[1.03] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
          style="box-shadow: 0 0 15px rgba(255,255,255,0.3), 0 0 30px rgba(0,212,255,0.2);"
        >
          <svg v-if="!actionLoading" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          <span v-if="actionLoading" class="animate-pulse">···</span>
          <span v-else>Aprobar</span>
        </button>

        <!-- Reject -->
        <button
          :disabled="actionLoading"
          @click="emit('reject', saas.id)"
          class="flex-1 inline-flex items-center justify-center gap-2 bg-transparent text-red-400/70 border border-red-500/20 font-bold uppercase tracking-widest text-[10px] rounded-full px-4 py-2.5 transition-all duration-500 hover:border-red-500/50 hover:text-red-400 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <svg v-if="!actionLoading" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
          <span v-if="actionLoading" class="animate-pulse">···</span>
          <span v-else>Rechazar</span>
        </button>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.card-out-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}
.card-out-leave-to {
  opacity: 0;
  transform: scale(0.95) translateY(-8px);
}
</style>
