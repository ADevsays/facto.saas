<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { X, Upload, Loader2, ExternalLink } from 'lucide-vue-next'
import AdCard from './AdCard.vue'
import type { Ad } from '../types'

const props = defineProps<{
  modelValue: boolean
  ad: Ad | null
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'saved', ad: Ad): void
}>()

const name = ref('')
const description = ref('')
const url = ref('')
const imageUrl = ref('')

const isSubmitting = ref(false)
const isUploading = ref(false)
const errorMessage = ref('')

watch(
  () => props.ad,
  (newAd) => {
    if (newAd) {
      name.value = newAd.name || ''
      description.value = newAd.description || ''
      url.value = newAd.url || ''
      imageUrl.value = newAd.image_url || ''
      errorMessage.value = ''
    }
  },
  { immediate: true }
)

function closeModal() {
  emit('update:modelValue', false)
}

async function handleFileUpload(e: Event) {
  const target = e.target as HTMLInputElement
  if (!target.files || target.files.length === 0) return
  const file = target.files[0]

  const allowedExts = ['png', 'jpg', 'jpeg', 'webp', 'svg', 'gif', 'ico']
  const fileExt = (file.name.split('.').pop() || '').toLowerCase()

  if (!file.type.startsWith('image/') && !allowedExts.includes(fileExt)) {
    errorMessage.value = `El formato ".${fileExt || 'desconocido'}" no es compatible. Por favor sube una imagen en formato PNG, JPG, WEBP o SVG.`
    target.value = ''
    return
  }

  const MAX_SIZE = 5 * 1024 * 1024
  if (file.size > MAX_SIZE) {
    errorMessage.value = 'El archivo supera el tamaño máximo permitido de 5 MB.'
    target.value = ''
    return
  }

  const formData = new FormData()
  formData.append('file', file)

  isUploading.value = true
  errorMessage.value = ''

  try {
    const res = await $fetch<{ imageUrl: string }>('/api/ads/upload', {
      method: 'POST',
      body: formData
    })
    if (res?.imageUrl) {
      imageUrl.value = res.imageUrl
    }
  } catch (err: any) {
    errorMessage.value = err.data?.message || err.data?.statusMessage || 'Error al procesar la imagen. Verifica que sea un archivo válido.'
  } finally {
    isUploading.value = false
    target.value = ''
  }
}

async function handleSubmit() {
  if (!props.ad) return
  errorMessage.value = ''

  if (!name.value.trim()) {
    errorMessage.value = 'El nombre de la startup o producto es obligatorio.'
    return
  }

  if (!url.value.trim()) {
    errorMessage.value = 'La URL de destino es obligatoria.'
    return
  }

  isSubmitting.value = true

  try {
    const res = await $fetch<{ ok: boolean; ad: Ad }>('/api/ads/update', {
      method: 'POST',
      body: {
        id: props.ad.id,
        name: name.value.trim(),
        description: description.value.trim(),
        url: url.value.trim(),
        image_url: imageUrl.value.trim()
      }
    })

    if (res?.ok && res.ad) {
      await refreshNuxtData('ads-slots-list')
      emit('saved', res.ad)
      closeModal()
    }
  } catch (err: any) {
    errorMessage.value = err.data?.statusMessage || err.message || 'Error al actualizar el anuncio.'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div
    v-if="modelValue"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md transition-opacity duration-300 animate-fade-in"
    @click.self="closeModal"
  >
    <div
      class="bg-[#0B0D13] border border-white/15 rounded-3xl w-full max-w-xl max-h-[90vh] overflow-y-auto custom-scrollbar shadow-2xl flex flex-col relative animate-scale-up"
    >
      <!-- Header -->
      <div class="flex items-center justify-between p-6 border-b border-white/10 sticky top-0 bg-[#0B0D13]/90 backdrop-blur-md z-10">
        <div class="space-y-1">
          <div class="flex items-center gap-2">
            <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono uppercase bg-[#00D4FF]/10 text-[#00D4FF] border border-[#00D4FF]/20">
              Puesto #{{ ad?.position || '—' }}
            </span>
            <span class="text-[10px] font-mono text-neutral-400">
              ${{ ad?.price || 1 }} USD
            </span>
          </div>
          <h2 class="font-serif text-xl md:text-2xl text-white font-medium tracking-tight">
            Editar Anuncio
          </h2>
        </div>

        <button
          @click="closeModal"
          class="w-8 h-8 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 flex items-center justify-center text-neutral-400 hover:text-white transition-colors cursor-pointer"
        >
          <X class="w-4 h-4" />
        </button>
      </div>

      <!-- Form Body -->
      <form @submit.prevent="handleSubmit" class="p-6 space-y-5 flex-1">
        <!-- Live Preview Box -->
        <div class="space-y-2">
          <label class="block text-[10px] font-sans font-medium uppercase tracking-[0.2em] text-neutral-400">
            Vista previa en la marquesina
          </label>
          <div class="p-4 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-center overflow-x-auto">
            <AdCard
              :name="name || 'Nombre de tu producto'"
              :description="description || 'Breve descripción que verán miles de fundadores...'"
              :url="url || 'https://tusaas.com'"
              :image_url="imageUrl"
              :position="ad?.position"
              class="pointer-events-none shrink-0"
            />
          </div>
        </div>

        <!-- Name Input -->
        <div class="space-y-1.5">
          <label class="block text-[10px] font-sans font-medium uppercase tracking-[0.2em] text-neutral-300">
            Nombre del producto o startup *
          </label>
          <input
            v-model="name"
            type="text"
            placeholder="Ej. Facto"
            class="w-full bg-surface-dark border border-white/15 rounded-xl px-4 py-3 text-white text-sm font-sans focus:outline-none focus:border-[#00D4FF]/60 transition-colors placeholder:text-neutral-500"
          />
        </div>

        <!-- URL Input -->
        <div class="space-y-1.5">
          <label class="block text-[10px] font-sans font-medium uppercase tracking-[0.2em] text-neutral-300">
            URL de destino *
          </label>
          <input
            v-model="url"
            type="url"
            placeholder="https://tuproducto.com"
            class="w-full bg-surface-dark border border-white/15 rounded-xl px-4 py-3 text-white text-sm font-sans focus:outline-none focus:border-[#00D4FF]/60 transition-colors placeholder:text-neutral-500"
          />
        </div>

        <!-- Description Input -->
        <div class="space-y-1.5">
          <div class="flex items-center justify-between">
            <label class="block text-[10px] font-sans font-medium uppercase tracking-[0.2em] text-neutral-300">
              Pitch o descripción breve
            </label>
            <span class="text-[10px] font-mono text-neutral-500">
              {{ description.length }}/120
            </span>
          </div>
          <input
            v-model="description"
            type="text"
            maxlength="120"
            placeholder="Ej. El directorio líder para startups bootstrapped en español."
            class="w-full bg-surface-dark border border-white/15 rounded-xl px-4 py-3 text-white text-sm font-sans focus:outline-none focus:border-[#00D4FF]/60 transition-colors placeholder:text-neutral-500"
          />
        </div>

        <!-- Logo / Image URL & Upload -->
        <div class="space-y-1.5">
          <label class="block text-[10px] font-sans font-medium uppercase tracking-[0.2em] text-neutral-300">
            Logo o icono (URL o subir archivo)
          </label>
          <div class="flex items-center gap-3">
            <input
              v-model="imageUrl"
              type="text"
              placeholder="https://tuproducto.com/logo.png"
              class="flex-1 min-w-0 bg-surface-dark border border-white/15 rounded-xl px-4 py-3 text-white text-sm font-sans focus:outline-none focus:border-[#00D4FF]/60 transition-colors placeholder:text-neutral-500"
            />
            <label class="shrink-0 inline-flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/15 px-4 py-3 rounded-xl text-xs font-sans text-neutral-300 hover:text-white cursor-pointer transition-colors">
              <Loader2 v-if="isUploading" class="w-4 h-4 animate-spin text-[#00D4FF]" />
              <Upload v-else class="w-4 h-4" />
              <span>Subir</span>
              <input type="file" accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml,image/gif,image/x-icon" class="hidden" @change="handleFileUpload" />
            </label>
          </div>
        </div>

        <!-- Error Alert -->
        <div v-if="errorMessage" class="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-sans">
          {{ errorMessage }}
        </div>

        <!-- Footer Actions -->
        <div class="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
          <button
            type="button"
            @click="closeModal"
            class="px-5 py-2.5 rounded-xl border border-white/10 hover:border-white/20 text-neutral-400 hover:text-white text-xs font-sans transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="submit"
            :disabled="isSubmitting || !name.trim() || !url.trim()"
            class="inline-flex items-center gap-2 bg-white text-black font-bold uppercase tracking-widest text-[11px] rounded-xl px-6 py-2.5 transition-all shadow-[0_0_15px_rgba(255,255,255,0.25)] enabled:hover:scale-[1.02] enabled:hover:shadow-[0_0_20px_rgba(0,212,255,0.3)] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <Loader2 v-if="isSubmitting" class="w-3.5 h-3.5 animate-spin" />
            <span>{{ isSubmitting ? 'Guardando...' : 'Guardar cambios' }}</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
