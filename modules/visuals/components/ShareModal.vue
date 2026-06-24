<script setup lang="ts">
import { useShareModal } from '../composables/useShareModal'
import { computed, ref } from 'vue'

const { isOpen, closeShare, saasData } = useShareModal()

const shareUrl = computed(() => saasData.value?.url || '')
const shareText = computed(() => `Ahora ${saasData.value?.name} está en Facto 🚀`)
const encodedUrl = computed(() => encodeURIComponent(shareUrl.value))
const encodedText = computed(() => encodeURIComponent(shareText.value))

const networks = computed(() => [
  {
    id: 'x',
    name: 'X (Twitter)',
    icon: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z',
    url: `https://x.com/intent/tweet?text=${encodedText.value}&url=${encodedUrl.value}`,
    color: 'hover:bg-neutral-900 hover:border-neutral-700'
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    icon: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z',
    url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl.value}`,
    color: 'hover:bg-[#0A66C2]/10 hover:border-[#0A66C2]/50 hover:text-[#0A66C2]'
  },
  {
    id: 'facebook',
    name: 'Facebook',
    icon: 'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z',
    url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl.value}`,
    color: 'hover:bg-[#1877F2]/10 hover:border-[#1877F2]/50 hover:text-[#1877F2]'
  }
])

const showCopied = ref(false)

const copyText = async () => {
  try {
    await navigator.clipboard.writeText(`${shareText.value}\n\n${shareUrl.value}`)
    showCopied.value = true
    setTimeout(() => {
      showCopied.value = false
    }, 2000)
  } catch (err) {
    console.error('Error al copiar:', err)
  }
}
</script>

<template>
  <Teleport to="body">
    <Transition name="backdrop-fade">
      <div
        v-if="isOpen"
        class="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-0"
        style="background: rgba(3,3,5,0.75); backdrop-filter: blur(10px);"
        @click.self="closeShare"
      >
        <Transition name="modal-scale" appear>
          <div
            class="w-full max-w-sm rounded-3xl overflow-hidden relative"
            style="background: rgba(10,10,14,0.99); border: 1px solid rgba(255,255,255,0.08); box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);"
          >
            <!-- Header -->
            <div class="px-6 pt-6 pb-4 flex justify-between items-center border-b border-white/5">
              <h3 class="text-white font-sans font-medium text-lg">Compartir en redes</h3>
              <button @click="closeShare" class="text-neutral-500 hover:text-white transition-colors">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            <!-- Content -->
            <div class="p-6 flex flex-col gap-3">
              <a
                v-for="network in networks"
                :key="network.id"
                :href="network.url"
                target="_blank"
                rel="noopener noreferrer"
                class="flex items-center gap-4 px-4 py-3 rounded-xl border border-white/5 bg-white/[0.02] text-neutral-300 transition-all duration-300 group"
                :class="network.color"
              >
                <svg class="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path :d="network.icon" />
                </svg>
                <span class="font-sans text-sm font-medium">{{ network.name }}</span>
              </a>
            </div>
            
            <!-- Link Preview box -->
            <div class="px-6 pb-6 pt-0">
              <button 
                @click="copyText"
                class="w-full text-left p-3 rounded-lg bg-black/50 border border-white/5 mt-2 flex flex-col gap-3 relative transition-colors hover:bg-white/[0.03] group cursor-pointer"
              >
                <!-- Copy Icon Indicator -->
                <div class="absolute top-3 right-3 text-neutral-500 group-hover:text-[#00D4FF] transition-colors flex items-center gap-2">
                  <span v-if="showCopied" class="text-[10px] font-sans text-[#00D4FF] tracking-wider uppercase">¡Copiado!</span>
                  <svg v-if="!showCopied" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                  </svg>
                  <svg v-else class="w-4 h-4 text-[#00D4FF]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </div>

                <div class="pr-8">
                  <p class="text-xs text-neutral-500 mb-1">Vista previa del mensaje:</p>
                  <p class="text-xs text-neutral-300 font-sans leading-relaxed">{{ shareText }}<br><span class="text-[#00D4FF]">{{ shareUrl }}</span></p>
                </div>
                
                <!-- OG Image Preview -->
                <div v-if="saasData?.slug" class="w-full aspect-[1200/630] rounded-md overflow-hidden border border-white/10 bg-[#030305] relative pointer-events-none">
                  <!-- Skeleton / Loading state -->
                  <div class="absolute inset-0 flex items-center justify-center overflow-hidden bg-[#030305]">
                    <div class="absolute inset-0 bg-white/[0.02] animate-pulse"></div>
                    <div class="z-10 flex flex-col items-center justify-center w-full">
                      <!-- Logo Skeleton -->
                      <div class="w-14 h-14 rounded-2xl bg-white/10 border border-white/5 animate-pulse"></div>
                      <!-- Title Skeleton -->
                      <div class="h-7 w-[60%] max-w-[200px] bg-white/10 rounded-full animate-pulse mt-5"></div>
                      <!-- Branding Domain Skeleton -->
                      <div class="flex items-center justify-center gap-2 mt-4">
                        <div class="w-5 h-5 rounded-md bg-white/20 animate-pulse"></div>
                        <div class="h-3 w-28 bg-white/5 rounded-full animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                  <!-- Image -->
                  <img
                    :src="`/__og-image__/image/saas/${saasData.slug}/og.png?v=${Date.now()}`"
                    class="w-full h-full object-cover relative z-10 transition-opacity duration-500 opacity-0"
                    @load="(e) => (e.target as HTMLElement).classList.remove('opacity-0')"
                    @error="(e) => (e.target as HTMLElement).style.display = 'none'"
                    loading="lazy"
                    alt="Vista previa de la imagen generada"
                  />
                </div>
              </button>
            </div>
            
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.backdrop-fade-enter-active,
.backdrop-fade-leave-active {
  transition: opacity 0.3s ease;
}
.backdrop-fade-enter-from,
.backdrop-fade-leave-to {
  opacity: 0;
}

.modal-scale-enter-active {
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}
.modal-scale-leave-active {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.modal-scale-enter-from,
.modal-scale-leave-to {
  opacity: 0;
  transform: scale(0.95) translateY(10px);
}
</style>
