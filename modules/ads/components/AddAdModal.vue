<script setup lang="ts">
import { ref } from 'vue'
import { useAddAdModal } from '~/composables/useAddAdModal'
import { Check } from 'lucide-vue-next'

const { isOpen, mode, close } = useAddAdModal()

const step = ref(1)
const email = ref('')
const errorMsg = ref('')
const isChecking = ref(false)
const isSubmitting = ref(false)
const setupSuccess = ref(false)

const form = ref({
  password: '',
  name: '',
  description: '',
  url: '',
  image_url: ''
})

watch(isOpen, (val) => {
  document.body.style.overflow = val ? 'hidden' : ''
  if (!val) resetSetup()
})

function resetSetup() {
  step.value = 1
  email.value = ''
  errorMsg.value = ''
  setupSuccess.value = false
  form.value = { password: '', name: '', description: '', url: '', image_url: '' }
}

async function checkEmail() {
  if (!email.value) return
  isChecking.value = true
  errorMsg.value = ''

  try {
    const res = await $fetch<any>('/api/ads/session', {
      params: { email: email.value }
    })

    if (res?.ok) {
      step.value = 2
    }
  } catch (err: any) {
    errorMsg.value = err.data?.statusMessage || 'No se encontró un pago activo para este email.'
  } finally {
    isChecking.value = false
  }
}

async function submitSetup() {
  if (!form.value.password || !form.value.name || !form.value.url) return
  isSubmitting.value = true
  errorMsg.value = ''

  try {
    await $fetch('/api/ads/setup', {
      method: 'POST',
      body: {
        email: email.value,
        password: form.value.password,
        name: form.value.name,
        description: form.value.description,
        url: form.value.url,
        image_url: form.value.image_url
      }
    })

    setupSuccess.value = true
    setTimeout(() => {
      close()
      resetSetup()
    }, 2500)
  } catch (err: any) {
    errorMsg.value = err.data?.statusMessage || 'Error al configurar el anuncio'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <Transition name="backdrop">
    <div v-if="isOpen" class="fixed inset-0 z-[90] bg-black/80 backdrop-blur-md" @click="close" />
  </Transition>

  <Transition name="fade">
    <div v-if="isOpen" class="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 pointer-events-none">

      <div class="relative w-full max-w-lg bg-[#0c0c10] border border-white/10 rounded-3xl overflow-hidden shadow-[0_30px_100px_rgba(0,0,0,0.8)] flex flex-col max-h-[85vh] pointer-events-auto">

        <!-- Header -->
        <div class="p-8 pb-5 flex flex-col gap-4 border-b border-white/5 bg-[#0c0c10]">
          <div class="flex items-start justify-between">
            <div class="flex flex-col gap-1.5">
              <h2 class="font-serif text-2xl text-white tracking-tight leading-tight">
                {{ mode === 'setup' ? 'Configura tu anuncio' : 'Tu próximo cliente ya está aquí' }}
              </h2>
              <p class="text-[10px] font-sans font-bold text-[#00D4FF] tracking-[0.15em] uppercase">
                {{ mode === 'setup' ? 'Completa los datos de tu ad' : '+10,000 fundadores activos cada mes' }}
              </p>
            </div>
            <button @click="close" class="text-neutral-500 hover:text-white transition-colors p-1">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Body -->
        <div class="flex-1 overflow-y-auto px-8 py-6 flex flex-col gap-6 custom-scrollbar">

          <!-- ========== SALE MODE ========== -->
          <template v-if="mode === 'sale'">
            <div class="bg-white/[0.03] border border-white/5 rounded-xl p-3.5">
              <p class="text-sm font-sans font-light text-neutral-400 leading-relaxed">
                <span class="text-white font-semibold">La distribución es el problema #1 de los SaaS.</span>
                Facto pone tu producto frente a la audiencia más calificada del ecosistema: fundadores que ya están comprando.
              </p>
            </div>

            <div class="grid grid-cols-3 gap-3">
              <div class="flex flex-col items-center gap-2 rounded-xl p-4 border border-white/5 bg-white/[0.02]">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" class="text-neutral-400">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
                  <circle cx="9" cy="7" r="4" stroke="currentColor" stroke-width="1.6"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
                </svg>
                <span class="text-sm font-sans font-bold text-white">10K+</span>
                <span class="text-[9px] font-sans font-light text-neutral-500 text-center tracking-[0.05em] uppercase leading-tight">Fundadores / mes</span>
              </div>

              <div class="flex flex-col items-center gap-2 rounded-xl p-4 border border-white/5 bg-white/[0.02]">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" class="text-neutral-400">
                  <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.6"/>
                  <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.6"/>
                </svg>
                <span class="text-sm font-sans font-bold text-white">No mirones</span>
                <span class="text-[9px] font-sans font-light text-neutral-500 text-center tracking-[0.05em] uppercase leading-tight">Solo compradores</span>
              </div>

              <div class="flex flex-col items-center gap-2 rounded-xl p-4 border border-[#f59e0b]/25 bg-[#f59e0b]/[0.05]">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" class="text-amber-400">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>
                </svg>
                <span class="text-sm font-sans font-bold text-amber-400">6/20</span>
                <span class="text-[9px] font-sans font-light text-amber-500/60 text-center tracking-[0.05em] uppercase leading-tight">Lugares</span>
              </div>
            </div>

            <div class="flex flex-col gap-2">
              <p class="text-[10px] font-sans font-bold text-neutral-300 tracking-[0.15em] uppercase">Tu exposición, sin algoritmos</p>
              <p class="text-sm font-sans font-light text-neutral-400 leading-relaxed">
                Tu startup se muestra en la <span class="text-neutral-200">banda superior de Facto</span>, fija y visible en cada página que visita un fundador. Sin competir por impresiones, sin pagar por clics. Solo presencia constante frente a quien ya tiene intención de compra.
              </p>
            </div>

            <div class="bg-white/[0.03] border border-white/5 rounded-xl p-4 flex flex-col gap-1.5">
              <p class="text-[10px] font-sans font-bold text-neutral-300 tracking-[0.15em] uppercase mb-1">Inversión</p>
              <p class="text-sm font-sans font-light text-neutral-300">
                <span class="text-[#00D4FF] font-semibold">$1,499/mes</span> — sin contratos, sin sorpresas.
              </p>
              <p class="text-sm font-sans font-light text-neutral-500">
                Quedan <span class="text-amber-400 font-medium">6 Lugares</span> de 20. Cuando se llenen, cierra la lista.
              </p>
            </div>
          </template>

          <!-- ========== SETUP MODE ========== -->
          <template v-else>
            <!-- Success state -->
            <div v-if="setupSuccess" class="flex flex-col items-center gap-4 py-8">
              <div class="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                <Check class="w-8 h-8 text-emerald-400" />
              </div>
              <p class="text-lg font-serif text-white">¡Anuncio activado!</p>
              <p class="text-sm font-sans font-light text-neutral-400">Tu anuncio ya es visible en Facto.</p>
            </div>

            <!-- Step 1: Verify Email -->
            <template v-else-if="step === 1">
              <p class="text-sm font-sans font-light text-neutral-400">
                Ingresa el email con el que realizaste el pago en Whop para comenzar.
              </p>

              <div class="flex flex-col gap-1.5">
                <label class="text-xs font-bold text-neutral-300 uppercase tracking-widest">Email</label>
                <input
                  v-model="email"
                  type="email"
                  placeholder="fundador@startup.com"
                  class="bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#00D4FF]/50 transition-colors"
                  @keydown.enter="checkEmail"
                />
              </div>

              <p v-if="errorMsg" class="text-red-400 text-xs">{{ errorMsg }}</p>

              <button
                @click="checkEmail"
                :disabled="isChecking || !email"
                class="bg-white text-black font-bold uppercase tracking-widest text-[10px] px-6 py-3.5 rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-transform disabled:opacity-50 disabled:hover:scale-100"
              >
                {{ isChecking ? 'Verificando...' : 'Continuar' }}
              </button>
            </template>

            <!-- Step 2: Ad Data -->
            <template v-else>
              <div class="flex flex-col gap-1.5">
                <label class="text-xs font-bold text-neutral-300 uppercase tracking-widest">Email verificado</label>
                <input :value="email" disabled class="bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-neutral-500 text-sm outline-none" />
              </div>

              <div class="flex flex-col gap-1.5">
                <label class="text-xs font-bold text-neutral-300 uppercase tracking-widest">Contraseña de acceso</label>
                <input v-model="form.password" type="password" class="bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#00D4FF]/50 transition-colors" />
              </div>

              <div class="h-px bg-white/10 my-1"></div>

              <div class="flex flex-col gap-1.5">
                <label class="text-xs font-bold text-neutral-300 uppercase tracking-widest">Nombre del SaaS</label>
                <input v-model="form.name" type="text" class="bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#00D4FF]/50 transition-colors" />
              </div>

              <div class="flex flex-col gap-1.5">
                <label class="text-xs font-bold text-neutral-300 uppercase tracking-widest">Descripción (opcional)</label>
                <input v-model="form.description" type="text" class="bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#00D4FF]/50 transition-colors" />
              </div>

              <div class="flex flex-col gap-1.5">
                <label class="text-xs font-bold text-neutral-300 uppercase tracking-widest">URL del producto</label>
                <input v-model="form.url" type="url" class="bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#00D4FF]/50 transition-colors" />
              </div>

              <p v-if="errorMsg" class="text-red-400 text-xs">{{ errorMsg }}</p>

              <button
                @click="submitSetup"
                :disabled="isSubmitting || !form.password || !form.name || !form.url"
                class="bg-[#00D4FF] text-black font-bold uppercase tracking-widest text-[10px] px-6 py-3.5 rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-transform disabled:opacity-50 disabled:hover:scale-100"
              >
                {{ isSubmitting ? 'Configurando...' : 'Activar Anuncio' }}
              </button>
            </template>
          </template>

        </div>

        <!-- Footer / CTA (only in sale mode) -->
        <div v-if="mode === 'sale'" class="p-4 border-t border-white/5 bg-[#0c0c10] flex justify-end">
          <a
            :href="`https://whop.com/checkout/${$config.public.whopPlanId || 'plan_YOUR_PLAN_HERE'}?redirect_url=${encodeURIComponent('https://facto.saas/?ad_setup=true')}`"
            target="_blank"
            rel="noopener noreferrer"
            class="group inline-flex items-center gap-2 bg-white text-black font-bold uppercase tracking-[0.15em] text-[10px] px-8 py-3.5 rounded-xl transition-all duration-500 hover:scale-[1.02] active:scale-[0.98] shadow-xl hover:shadow-[#00D4FF]/20"
          >
            Quiero llegar a 10k
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" class="transition-transform duration-300 group-hover:translate-x-0.5">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
              <polyline points="15 3 21 3 21 9" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
              <line x1="10" y1="14" x2="21" y2="3" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
            </svg>
          </a>
        </div>

      </div>
    </div>
  </Transition>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.backdrop-leave-active { transition: opacity 0.3s ease; }
.backdrop-leave-to { opacity: 0; }

.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(0,212,255,0.3); }
</style>
