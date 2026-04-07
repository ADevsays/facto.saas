<script setup lang="ts">
import { useAddSaasModal } from '~/composables/useAddSaasModal'
import CategorySelect from './CategorySelect.vue'
import ProviderIcon from './ProviderIcon.vue'
import ProviderTutorial from './ProviderTutorial.vue'

const { isOpen, close } = useAddSaasModal()

const provider = ref<'stripe' | 'mercadopago' | 'none' | null>(null)
const apiKey = ref('')
const detectedMrr = ref<number | null>(null)
const isMpConnecting = ref(false)

const form = ref({
  name: '',
  websiteUrl: '',
  founderEmail: '', // Privado
  categorySlug: '',
})

const loading = ref(false)
const success = ref(false)
const error = ref('')

async function openMpAuth() {
  isMpConnecting.value = true
  error.value = ''
  
  try {
    const { url } = await $fetch<{ url: string }>('/api/auth/mercadopago/url')
    
    const width = 600
    const height = 700
    const left = window.screenX + (window.outerWidth - width) / 2
    const top = window.screenY + (window.outerHeight - height) / 2
    
    const popup = window.open(
      url, 
      'MPAuth', 
      `width=${width},height=${height},left=${left},top=${top},status=no,menubar=no,toolbar=no`
    )

    // Monitorizar si el usuario cierra el popup manualmente
    const checkPopup = setInterval(() => {
      if (!popup || popup.closed) {
        clearInterval(checkPopup)
        if (isMpConnecting.value) {
          isMpConnecting.value = false
        }
      }
    }, 1000)
  } catch (e: any) {
    error.value = 'No se pudo iniciar la conexión con Mercado Pago.'
    isMpConnecting.value = false
    setTimeout(() => { error.value = '' }, 5000)
  }
}

// Escuchar mensaje del popup
if (process.client) {
  window.addEventListener('message', (event) => {
    if (event.data?.type === 'MP_AUTH_SUCCESS') {
      detectedMrr.value = event.data.mrr
      apiKey.value = 'MERCADO_PAGO_OAUTH_TOKEN' // Placeholder para el backend
      isMpConnecting.value = false
    }
  })
}

async function onSubmit() {
  if (!form.value.name || !form.value.categorySlug || !form.value.founderEmail) {
    error.value = 'Por favor completa los campos obligatorios.'
    return
  }

  loading.value = true
  error.value = ''

  try {
    const payload = {
      ...form.value,
      providerSlug: provider.value === 'none' ? undefined : provider.value,
      providerKey: apiKey.value || undefined,
      isIncognito: false
    }

    await $fetch('/api/publish', {
      method: 'POST',
      body: payload
    })

    success.value = true
    setTimeout(() => {
      close()
      success.value = false
      reset()
    }, 2000)
  } catch (e: any) {
    error.value = e.data?.message || 'Error al publicar. Inténtalo de nuevo.'
    setTimeout(() => { error.value = '' }, 5000)
  } finally {
    loading.value = false
  }
}

function reset() {
  provider.value = null
  apiKey.value = ''
  form.value = { name: '', websiteUrl: '', founderEmail: '', categorySlug: '' }
  error.value = ''
}

// Bloquear scroll en el body cuando el modal está abierto
watch(isOpen, (val) => {
  if (val) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
})
</script>

<template>
  <Transition name="fade">
    <div v-if="isOpen" class="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <!-- Backdrop -->
      <div class="absolute inset-0 bg-black/80 backdrop-blur-md" @click="close" />

      <!-- Modal Content -->
      <div class="relative w-full max-w-lg bg-[#0c0c10] border border-white/10 rounded-3xl overflow-hidden shadow-[0_30px_100px_rgba(0,0,0,0.8)] flex flex-col max-h-[85vh]">
        
        <!-- Success State -->
        <div v-if="success" class="flex-1 flex flex-col items-center justify-center p-12 text-center gap-6 animate-in fade-in zoom-in duration-500">
          <div class="w-16 h-16 rounded-full bg-[#00D4FF]/10 border border-[#00D4FF]/20 flex items-center justify-center">
            <svg class="w-8 h-8 text-[#00D4FF]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <div class="flex flex-col gap-2">
            <h3 class="font-serif text-2xl text-white">¡Startup Registrada!</h3>
            <p class="text-neutral-400 text-sm font-sans font-light">Ya eres parte de Facto.</p>
          </div>
        </div>

        <template v-else>
          <!-- Header (Sticky) -->
          <div class="p-8 pb-5 flex flex-col gap-4 border-b border-white/5 bg-[#0c0c10]">
            <div class="flex items-start justify-between">
              <div class="flex flex-col gap-1.5">
                <h2 class="font-serif text-2xl text-white tracking-tight leading-tight">
                  Agrega tu Startup
                </h2>
                <p class="text-[10px] font-sans font-bold text-[#00D4FF] tracking-[0.15em] uppercase">
                  Llega a +10,000 fundadores mensualmente
                </p>
              </div>
              <button @click="close" class="text-neutral-500 hover:text-white transition-colors p-1">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <!-- Body (Scrollable) -->
          <div class="flex-1 overflow-y-auto px-8 py-6 flex flex-col gap-7 custom-scrollbar">
            
            <!-- Insight / Pain (más compacto) -->
            <div class="bg-white/[0.03] border border-white/5 rounded-xl p-3.5">
              <p class="text-sm font-sans font-light text-neutral-400 leading-relaxed">
                <span class="text-white font-semibold">¿Tu startup es invisible?</span> Verifica tu MRR para destacar frente al mercado.
              </p>
            </div>

            <!-- 1. Payment Provider Selection (Unified & Modular) -->
            <div class="flex flex-col gap-4">
              <label class="text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-neutral-500">
                Escoge tu proveedor
              </label>
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  @click="provider = 'stripe'"
                  :class="[
                    'flex items-center gap-2.5 p-2 rounded-xl border transition-all duration-300',
                    provider === 'stripe' ? 'border-[#00D4FF] bg-[#00D4FF]/10 text-white' : 'border-white/10 bg-white/[0.04] text-neutral-400 hover:border-white/20'
                  ]"
                >
                  <ProviderIcon provider="stripe" />
                  <span class="text-sm font-sans font-medium">Stripe</span>
                </button>

                <button
                  type="button"
                  @click="provider = 'mercadopago'"
                  :class="[
                    'flex items-center gap-2 p-1 rounded-xl border transition-all duration-300',
                    provider === 'mercadopago' ? 'border-[#00D4FF] bg-[#00D4FF]/10 text-white' : 'border-white/10 bg-white/[0.04] text-neutral-400 hover:border-white/20'
                  ]"
                >
                  <ProviderIcon provider="mercadopago" />
                  <span class="text-xs font-sans font-medium ">Mercado Pago</span>
                </button>

                <button
                  type="button"
                  @click="provider = 'none'"
                  :class="[
                    'flex items-center gap-2.5 p-2 rounded-xl border transition-all duration-300',
                    provider === 'none' ? 'border-white/40 bg-white/10 text-white' : 'border-white/10 bg-white/[0.04] text-neutral-400 hover:border-white/20'
                  ]"
                >
                  <ProviderIcon provider="none" />
                  <span class="text-sm font-sans font-medium">Más tarde</span>
                </button>
              </div>
            </div>

            <!-- 2. Connection / Key Area (Refined Animation) -->
            <div class="flex flex-col gap-5">
              <!-- Tutorial Section (Always visible if provider selected) -->
              <ProviderTutorial :provider="provider" />

              <!-- Action Area (Stripe Key or MP Button) -->
              <div v-if="provider === 'stripe'" class="flex flex-col gap-2">
                <label class="text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-neutral-500">2. Stripe Restricted Key</label>
                <input
                  v-model="apiKey"
                  type="password"
                  placeholder="sk_live_..."
                  class="w-full bg-white/[0.06] border border-white/10 rounded-xl px-4 py-4 text-white text-sm font-sans font-light placeholder:text-neutral-600 focus:outline-none focus:border-[#00D4FF]/50 transition-all duration-300"
                />
              </div>

              <div v-else-if="provider === 'mercadopago'" class="flex flex-col gap-4">
                <div v-if="detectedMrr !== null" class="bg-[#00D4FF]/10 border border-[#00D4FF]/20 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 animate-in zoom-in duration-300">
                  <div class="flex flex-col gap-0.5">
                    <span class="text-[10px] uppercase font-bold text-[#00D4FF]">MRR Detectado</span>
                    <span class="text-sm font-serif text-white">${{ detectedMrr.toLocaleString() }}</span>
                  </div>
                  <div class="w-8 h-8 rounded-full bg-[#00D4FF]/20 flex items-center justify-center">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00D4FF" stroke-width="3">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                </div>
                <button
                  v-else
                  type="button"
                  @click="openMpAuth"
                  :disabled="isMpConnecting"
                  class="w-full py-3.5 rounded-xl border border-[#00D4FF]/30 bg-[#00D4FF]/10 text-white font-sans font-bold text-[10px] uppercase tracking-widest hover:bg-[#00D4FF]/20 transition-all duration-300 flex items-center justify-center gap-3"
                >
                  <svg v-if="isMpConnecting" class="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" />
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  {{ isMpConnecting ? 'Conectando...' : 'Conectar Mercado Pago' }}
                </button>
              </div>
            </div>

            <!-- 3. Startup Info -->
            <div class="flex flex-col gap-6">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div class="flex flex-col gap-2">
                  <label class="text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-neutral-500">Nombre del SaaS *</label>
                  <input
                    v-model="form.name"
                    type="text"
                    placeholder="Mi Startup"
                    class="w-full bg-white/[0.06] border border-white/10 rounded-xl px-4 py-4 text-white text-sm font-sans font-light placeholder:text-neutral-600 focus:outline-none focus:border-[#00D4FF]/50 transition-all duration-300"
                  />
                </div>
                <div class="flex flex-col gap-2">
                  <label class="text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-neutral-500">Web URL</label>
                  <input
                    v-model="form.websiteUrl"
                    type="url"
                    placeholder="https://..."
                    class="w-full bg-white/[0.06] border border-white/10 rounded-xl px-4 py-4 text-white text-sm font-sans font-light placeholder:text-neutral-600 focus:outline-none focus:border-[#00D4FF]/50 transition-all duration-300"
                  />
                </div>
              </div>

              <div class="flex flex-col gap-2">
                <label class="text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-neutral-500">Categoría *</label>
                <CategorySelect v-model="form.categorySlug" />
              </div>

              <div class="flex flex-col gap-2">
                <label class="text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-neutral-500">Email (Privado) *</label>
                <input
                  v-model="form.founderEmail"
                  type="email"
                  placeholder="hola@tuweb.com"
                  class="w-full bg-white/[0.06] border border-white/10 rounded-xl px-4 py-4 text-white text-sm font-sans font-light placeholder:text-neutral-600 focus:outline-none focus:border-[#00D4FF]/50 transition-all duration-300"
                />
              </div>
            </div>

            <p v-if="error" class="text-xs text-red-100 font-sans font-light bg-red-400/20 p-4 rounded-xl border border-red-400/30">
              {{ error }}
            </p>
          </div>

          <!-- Footer (Sticky) -->
          <div class="p-6 pt-2 border-t border-white/5 bg-[#0c0c10] flex justify-end">
            <button
              @click="onSubmit"
              :disabled="loading"
              class="bg-white text-black font-bold uppercase tracking-[0.15em] text-[10px] px-8 py-3.5 rounded-xl transition-all duration-500 hover:scale-[1.02] active:scale-[0.98] shadow-xl hover:shadow-[#00D4FF]/20 disabled:opacity-50"
            >
              {{ loading ? 'Enviando...' : 'Unirse al Ranking' }}
            </button>
          </div>
        </template>

      </div>
    </div>
  </Transition>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.slide-up-enter-active, .slide-up-leave-active { transition: all 0.3s ease; }
.slide-up-enter-from, .slide-up-leave-to { opacity: 0; transform: translateY(10px); }

.fade-slide-enter-active, .fade-slide-leave-active { transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1); }
.fade-slide-enter-from, .fade-slide-leave-to { opacity: 0; transform: translateY(8px); }

.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 10px; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(0, 212, 255, 0.3); }
</style>
