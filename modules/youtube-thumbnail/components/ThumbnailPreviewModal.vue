<script setup lang="ts">
import es from '../locales/es.json'
import en from '../locales/en.json'

const { t } = useLanguage({ es, en })

const props = defineProps<{
  imageUrl: string | null
  show: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div 
        v-if="show && imageUrl" 
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
        @click.self="emit('close')"
      >
        <div class="relative max-w-4xl w-full bg-[#0A0A0E] border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
          <!-- Modal Header -->
          <div class="flex items-center justify-between px-6 py-4 border-b border-white/10">
            <span class="text-xs uppercase tracking-widest text-neutral-400 font-medium">{{ t.modal.title }}</span>
            <button 
              @click="emit('close')"
              class="text-neutral-400 hover:text-white transition-colors p-1"
            >
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Image Frame -->
          <div class="p-4 md:p-6 bg-black/80 flex items-center justify-center">
            <img 
              :src="imageUrl" 
              alt="Miniatura YouTube" 
              class="max-h-[75vh] w-auto object-contain rounded-lg border border-white/10 shadow-2xl"
            />
          </div>

          <!-- Modal Footer -->
          <div class="px-6 py-3 border-t border-white/10 bg-[#030305] flex justify-end">
            <button
              @click="emit('close')"
              class="bg-white/10 hover:bg-white/20 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-all"
            >
              {{ t.modal.close }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
