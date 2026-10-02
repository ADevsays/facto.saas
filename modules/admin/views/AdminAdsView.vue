<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import AdminLogin from '../components/AdminLogin.vue'
import DashboardHeader from '../components/DashboardHeader.vue'
import { useAdminAuth } from '../composables/useAdminAuth'
import type { AdSlot } from '~/modules/ads/types'
import { Plus, Trash2, Edit3, ExternalLink, Upload, Check, Loader2, Sparkles } from 'lucide-vue-next'

const { isAuthenticated, init, login, logout, getHeaders } = useAdminAuth()

const slots = ref<AdSlot[]>([])
const loading = ref(true)
const error = ref('')
const loginError = ref('')
const isChecking = ref(true)

// Assign modal state
const isModalOpen = ref(false)
const isSubmitting = ref(false)
const modalError = ref('')
const isUploading = ref(false)

const form = ref({
  position: 1,
  name: '',
  description: '',
  url: '',
  image_url: '',
  price: 1
})

const stats = computed(() => {
  const total = 20
  const occupied = slots.value.filter(s => !s.isAvailable).length
  const affiliates = slots.value.filter(s => s.ad?.is_affiliate).length
  const free = total - occupied
  return { total, occupied, free, affiliates }
})

async function fetchSlots() {
  loading.value = true
  error.value = ''
  try {
    const data = await $fetch<AdSlot[]>('/api/ads/slots')
    slots.value = data || []
  } catch (err: any) {
    error.value = 'Error al cargar los cupos de anuncios.'
  } finally {
    loading.value = false
  }
}

const handleLogin = async (key: string) => {
  loginError.value = ''
  login(key)
  await fetchSlots()
}

function openAssignModal(targetPosition?: number) {
  modalError.value = ''
  form.value = {
    position: targetPosition || 1,
    name: '',
    description: '',
    url: '',
    image_url: '',
    price: 1
  }

  // If slot is occupied, prefill
  if (targetPosition) {
    const existing = slots.value.find(s => s.position === targetPosition)?.ad
    if (existing) {
      form.value.name = existing.name || ''
      form.value.description = existing.description || ''
      form.value.url = existing.url || ''
      form.value.image_url = existing.image_url || ''
      form.value.price = existing.price || 1
    }
  }

  isModalOpen.value = true
}

async function handleFileUpload(e: Event) {
  const target = e.target as HTMLInputElement
  if (!target.files || target.files.length === 0) return
  const file = target.files[0]

  const formData = new FormData()
  formData.append('file', file)

  isUploading.value = true
  modalError.value = ''

  try {
    const res = await $fetch<{ imageUrl: string }>('/api/ads/upload', {
      method: 'POST',
      body: formData
    })
    if (res?.imageUrl) {
      form.value.image_url = res.imageUrl
    }
  } catch (err: any) {
    modalError.value = err.data?.message || 'Error al subir la imagen'
  } finally {
    isUploading.value = false
  }
}

async function submitAssignment() {
  if (!form.value.name || !form.value.url) {
    modalError.value = 'El nombre y la URL son obligatorios.'
    return
  }

  isSubmitting.value = true
  modalError.value = ''

  try {
    await $fetch('/api/admin/ads/assign', {
      method: 'POST',
      headers: getHeaders(),
      body: {
        position: form.value.position,
        name: form.value.name,
        description: form.value.description,
        url: form.value.url,
        image_url: form.value.image_url,
        price: Number(form.value.price) || 1
      }
    })

    isModalOpen.value = false
    await fetchSlots()
  } catch (err: any) {
    modalError.value = err.data?.statusMessage || err.message || 'Error al asignar el afiliado.'
  } finally {
    isSubmitting.value = false
  }
}

async function removeAd(pos: number) {
  if (!confirm(`¿Seguro que deseas liberar el Puesto #${pos}?`)) return

  try {
    await $fetch('/api/admin/ads/remove', {
      method: 'POST',
      headers: getHeaders(),
      body: { position: pos }
    })
    await fetchSlots()
  } catch (err: any) {
    alert('Error al liberar el cupo: ' + (err.data?.statusMessage || err.message))
  }
}

onMounted(async () => {
  init()
  if (isAuthenticated.value) {
    await fetchSlots()
  }
  isChecking.value = false
})
</script>

<template>
  <div class="min-h-screen bg-[#030305] font-sans text-white">

    <!-- Checking session -->
    <Transition name="fade">
      <div v-if="isChecking" class="fixed inset-0 bg-[#030305] flex items-center justify-center z-50">
        <span class="text-[10px] uppercase tracking-[0.2em] text-gray-700 animate-pulse">Verificando…</span>
      </div>
    </Transition>

    <!-- Login -->
    <AdminLogin
      v-if="!isChecking && !isAuthenticated"
      :error="loginError"
      @login="handleLogin"
    />

    <!-- Dashboard -->
    <div v-else-if="!isChecking" class="max-w-7xl mx-auto px-6 sm:px-8 py-10">

      <DashboardHeader
        title="Anuncios & Afiliados"
        :loading="loading"
        @refresh="fetchSlots"
        @logout="logout"
      />

      <!-- Quick Stats Bar -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div class="bg-white/[0.02] border border-white/5 rounded-2xl p-4 flex flex-col gap-1">
          <span class="text-[10px] uppercase tracking-widest text-neutral-500 font-mono">Cupos Totales</span>
          <span class="text-2xl font-bold font-mono text-white">{{ stats.total }}</span>
        </div>
        <div class="bg-white/[0.02] border border-white/5 rounded-2xl p-4 flex flex-col gap-1">
          <span class="text-[10px] uppercase tracking-widest text-emerald-500/80 font-mono">Cupos Libres</span>
          <span class="text-2xl font-bold font-mono text-emerald-400">{{ stats.free }}</span>
        </div>
        <div class="bg-white/[0.02] border border-white/5 rounded-2xl p-4 flex flex-col gap-1">
          <span class="text-[10px] uppercase tracking-widest text-amber-500/80 font-mono">Ocupados</span>
          <span class="text-2xl font-bold font-mono text-amber-400">{{ stats.occupied }}</span>
        </div>
        <div class="bg-white/[0.02] border border-white/5 rounded-2xl p-4 flex flex-col gap-1">
          <span class="text-[10px] uppercase tracking-widest text-[#00D4FF]/80 font-mono">Afiliados Manuales</span>
          <span class="text-2xl font-bold font-mono text-[#00D4FF]">{{ stats.affiliates }}</span>
        </div>
      </div>

      <!-- Action Bar -->
      <div class="flex items-center justify-between mb-6">
        <div>
          <h2 class="text-lg font-serif text-white">Subasta y Marquee de 20 Puestos</h2>
          <p class="text-xs text-neutral-400 mt-0.5">
            Los anuncios se despliegan en orden estricto (#1 a #20) en la cabecera. Puedes inyectar afiliados o patrocinadores directos en cualquier puesto.
          </p>
        </div>

        <button
          @click="openAssignModal()"
          class="inline-flex items-center gap-2 bg-[#00D4FF] hover:bg-[#00D4FF]/90 text-black font-bold uppercase tracking-wider text-xs px-4 py-2.5 rounded-xl transition-all shadow-lg hover:shadow-[#00D4FF]/20"
        >
          <Plus class="w-4 h-4" />
          <span>Asignar Afiliado</span>
        </button>
      </div>

      <p v-if="error" class="text-xs text-red-400 mb-6">{{ error }}</p>

      <!-- Slots Table / Grid -->
      <div class="border border-white/10 rounded-2xl overflow-hidden bg-[#0c0c10]">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs border-collapse">
            <thead>
              <tr class="border-b border-white/10 bg-white/[0.02] text-neutral-400 font-mono text-[10px] uppercase tracking-widest">
                <th class="py-3 px-4">Puesto</th>
                <th class="py-3 px-4">Estado</th>
                <th class="py-3 px-4">Anuncio / Empresa</th>
                <th class="py-3 px-4">Precio Actual</th>
                <th class="py-3 px-4">Próxima Puja</th>
                <th class="py-3 px-4">Tipo</th>
                <th class="py-3 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-white/5">
              <tr
                v-for="s in slots"
                :key="s.position"
                class="hover:bg-white/[0.02] transition-colors"
              >
                <!-- Position -->
                <td class="py-3.5 px-4 font-mono font-bold text-white">
                  <span class="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-white/5 border border-white/10 text-xs">
                    #{{ s.position }}
                  </span>
                </td>

                <!-- Status -->
                <td class="py-3.5 px-4">
                  <span
                    v-if="s.isAvailable"
                    class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                  >
                    <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    Libre
                  </span>
                  <span
                    v-else
                    class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                  >
                    <span class="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                    Activo
                  </span>
                </td>

                <!-- Startup Details -->
                <td class="py-3.5 px-4">
                  <div v-if="s.ad" class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                      <img
                        v-if="s.ad.image_url"
                        :src="s.ad.image_url"
                        :alt="s.ad.name"
                        class="w-full h-full object-cover"
                      />
                      <span v-else class="text-xs text-neutral-500 font-bold font-mono">
                        {{ s.ad.name?.charAt(0) || '✦' }}
                      </span>
                    </div>

                    <div class="flex flex-col min-w-0">
                      <div class="flex items-center gap-1.5">
                        <span class="font-medium text-white truncate">{{ s.ad.name }}</span>
                        <a
                          :href="s.ad.url"
                          target="_blank"
                          rel="noopener"
                          class="text-neutral-500 hover:text-white transition-colors"
                        >
                          <ExternalLink class="w-3 h-3" />
                        </a>
                      </div>
                      <span class="text-[11px] text-neutral-400 truncate max-w-xs">
                        {{ s.ad.description || s.ad.url }}
                      </span>
                    </div>
                  </div>

                  <span v-else class="text-neutral-600 italic">
                    Sin anuncio asignado (Disponible para subasta)
                  </span>
                </td>

                <!-- Price -->
                <td class="py-3.5 px-4 font-mono font-medium text-neutral-200">
                  ${{ s.currentPrice }} USD
                </td>

                <!-- Next Price -->
                <td class="py-3.5 px-4 font-mono font-medium text-[#00D4FF]">
                  ${{ s.nextPrice }} USD
                </td>

                <!-- Type -->
                <td class="py-3.5 px-4">
                  <span
                    v-if="s.ad?.is_affiliate"
                    class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-purple-500/10 text-purple-400 border border-purple-500/20"
                  >
                    <Sparkles class="w-2.5 h-2.5" />
                    Afiliado
                  </span>
                  <span
                    v-else-if="s.ad"
                    class="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-white/5 text-neutral-400 border border-white/5"
                  >
                    Whop / Pago
                  </span>
                  <span v-else class="text-neutral-600">—</span>
                </td>

                <!-- Actions -->
                <td class="py-3.5 px-4 text-right">
                  <div class="flex items-center justify-end gap-2">
                    <button
                      @click="openAssignModal(s.position)"
                      class="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white border border-white/10 transition-colors flex items-center gap-1 text-[11px]"
                      :title="s.ad ? 'Modificar o reemplazar anuncio' : 'Asignar afiliado directo'"
                    >
                      <Edit3 v-if="s.ad" class="w-3 h-3" />
                      <Plus v-else class="w-3 h-3" />
                      <span>{{ s.ad ? 'Editar' : 'Asignar' }}</span>
                    </button>

                    <button
                      v-if="s.ad"
                      @click="removeAd(s.position)"
                      class="px-2 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-colors"
                      title="Liberar este cupo"
                    >
                      <Trash2 class="w-3 h-3" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>

    <!-- Assignment Modal -->
    <Transition name="fade">
      <div v-if="isModalOpen" class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <div class="relative w-full max-w-md bg-[#0c0c10] border border-white/10 rounded-3xl p-6 shadow-2xl flex flex-col gap-4">

          <div class="flex items-center justify-between border-b border-white/10 pb-3">
            <div>
              <h3 class="font-serif text-lg text-white">Asignar Afiliado / Patrocinador</h3>
              <p class="text-xs text-[#00D4FF]">Inyección directa sin pasarela de pago</p>
            </div>
            <button @click="isModalOpen = false" class="text-neutral-500 hover:text-white p-1">
              ✕
            </button>
          </div>

          <form @submit.prevent="submitAssignment" class="flex flex-col gap-3.5">
            <!-- Position selector -->
            <div class="flex flex-col gap-1">
              <label class="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Puesto en Marquee (1 - 20)</label>
              <select
                v-model="form.position"
                class="bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-white text-xs outline-none focus:border-[#00D4FF]"
              >
                <option v-for="i in 20" :key="i" :value="i">
                  Puesto #{{ i }}
                </option>
              </select>
            </div>

            <!-- Name -->
            <div class="flex flex-col gap-1">
              <label class="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Nombre de la Empresa / SaaS</label>
              <input
                v-model="form.name"
                type="text"
                placeholder="Ej: Supabase, Linear, Vercel..."
                class="bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-white text-xs outline-none focus:border-[#00D4FF]"
                required
              />
            </div>

            <!-- Description -->
            <div class="flex flex-col gap-1">
              <label class="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Pitch / Descripción corta</label>
              <input
                v-model="form.description"
                type="text"
                placeholder="Ej: The open source Firebase alternative."
                class="bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-white text-xs outline-none focus:border-[#00D4FF]"
              />
            </div>

            <!-- URL -->
            <div class="flex flex-col gap-1">
              <label class="text-[10px] font-bold uppercase tracking-widest text-neutral-400">URL de Destino / Link de Afiliado</label>
              <input
                v-model="form.url"
                type="url"
                placeholder="https://tusaas.com?ref=facto"
                class="bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-white text-xs outline-none focus:border-[#00D4FF]"
                required
              />
            </div>

            <!-- Price -->
            <div class="flex flex-col gap-1">
              <label class="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Precio Base Simulado ($ USD)</label>
              <input
                v-model.number="form.price"
                type="number"
                min="1"
                class="bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-white text-xs outline-none focus:border-[#00D4FF]"
              />
              <span class="text-[10px] text-neutral-500">
                Determina el precio que un tercero deberá pagar para superar este puesto (+1 USD).
              </span>
            </div>

            <!-- Logo Upload -->
            <div class="flex flex-col gap-1">
              <label class="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Logo del SaaS</label>
              <div class="flex items-center gap-3">
                <div v-if="form.image_url" class="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                  <img :src="form.image_url" alt="Logo preview" class="w-full h-full object-cover" />
                </div>
                <label class="cursor-pointer inline-flex items-center gap-2 bg-white/10 hover:bg-white/15 text-white px-3 py-2 rounded-xl text-xs font-medium border border-white/10 transition-colors">
                  <Upload class="w-3.5 h-3.5 text-[#00D4FF]" />
                  <span>{{ isUploading ? 'Subiendo...' : (form.image_url ? 'Cambiar logo' : 'Subir logo PNG/SVG') }}</span>
                  <input type="file" accept="image/*" class="hidden" @change="handleFileUpload" :disabled="isUploading" />
                </label>
              </div>
            </div>

            <p v-if="modalError" class="text-xs text-red-400">{{ modalError }}</p>

            <div class="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
              <button
                type="button"
                @click="isModalOpen = false"
                class="px-4 py-2 rounded-xl text-xs text-neutral-400 hover:text-white"
              >
                Cancelar
              </button>
              <button
                type="submit"
                :disabled="isSubmitting || !form.name || !form.url"
                class="inline-flex items-center gap-2 bg-[#00D4FF] hover:bg-[#00D4FF]/90 text-black font-bold uppercase tracking-wider text-xs px-5 py-2.5 rounded-xl transition-all disabled:opacity-50"
              >
                <Loader2 v-if="isSubmitting" class="w-3.5 h-3.5 animate-spin" />
                <span>{{ isSubmitting ? 'Guardando...' : 'Guardar Afiliado' }}</span>
              </button>
            </div>
          </form>

        </div>
      </div>
    </Transition>

  </div>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
