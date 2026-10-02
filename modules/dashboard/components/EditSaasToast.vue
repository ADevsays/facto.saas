<script setup lang="ts">
const show = defineModel<boolean>({ default: false })

defineProps<{
  message?: string
}>()
</script>

<template>
  <Teleport to="body">
    <Transition name="toast">
      <div 
        v-if="show" 
        class="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 z-[100] flex items-center gap-3.5 bg-surface-elevated border border-emerald-500/40 rounded-2xl px-5 py-3.5 shadow-2xl shadow-black text-white text-sm font-sans backdrop-blur-2xl"
        style="box-shadow: 0 10px 40px rgba(0,0,0,0.9), 0 0 25px rgba(16, 185, 129, 0.2);"
      >
        <div class="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </div>
        <div class="flex flex-col pr-2">
          <span class="font-medium text-white text-xs md:text-sm">{{ message || 'Cambios guardados correctamente.' }}</span>
          <span class="text-[10px] text-neutral-400 font-extralight tracking-wide">Tu startup está actualizada</span>
        </div>
        <button 
          type="button"
          @click="show = false" 
          class="text-neutral-500 hover:text-white transition-colors text-xs p-1 ml-1 cursor-pointer"
        >
          ✕
        </button>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}
.toast-enter-from {
  opacity: 0;
  transform: translateY(20px) scale(0.95);
}
.toast-leave-to {
  opacity: 0;
  transform: translateY(10px) scale(0.98);
}
</style>
