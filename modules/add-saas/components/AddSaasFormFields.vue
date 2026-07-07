<script setup lang="ts">
import CategorySelect from '~/ui/components/CategorySelect.vue'
import CountrySelect from '~/ui/components/CountrySelect.vue'
import AddSaasInput from './AddSaasInput.vue'

const props = defineProps<{
  form: {
    id?: string
    name: string
    websiteUrl: string
    founderEmail: string
    categorySlugs: string[]
    countrySlug: string
    logoUrl?: string
    logoFileBase64?: string
    startupType?: string
  }
}>()

import { ref, watch } from 'vue'

const initialEmail = ref('')
const fileInput = ref<HTMLInputElement | null>(null)

watch(() => props.form.founderEmail, (newVal) => {
  if (!initialEmail.value && newVal) {
    initialEmail.value = newVal
  }
}, { immediate: true })

function triggerFileInput() {
  fileInput.value?.click()
}

function handleFileSelect(event: Event) {
  const target = event.target as HTMLInputElement
  if (!target.files?.length) return
  const file = target.files[0]
  if (!file.type.startsWith('image/')) return

  const reader = new FileReader()
  reader.onload = (e) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const MAX_WIDTH = 256
      const MAX_HEIGHT = 256
      let width = img.width
      let height = img.height

      if (width > height) {
        if (width > MAX_WIDTH) {
          height *= MAX_WIDTH / width
          width = MAX_WIDTH
        }
      } else {
        if (height > MAX_HEIGHT) {
          width *= MAX_HEIGHT / height
          height = MAX_HEIGHT
        }
      }
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')
      ctx?.drawImage(img, 0, 0, width, height)
      props.form.logoFileBase64 = canvas.toDataURL('image/webp', 0.8)
    }
    img.src = e.target?.result as string
  }
  reader.readAsDataURL(file)
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
      <AddSaasInput
        v-model="form.name"
        label="Nombre del SaaS"
        placeholder="Mi Startup"
        required
      />
      <AddSaasInput
        v-model="form.websiteUrl"
        label="Web URL"
        type="url"
        placeholder="https://..."
      />
    </div>

    <!-- Update Mode Fields -->
    <div v-if="form.id" class="flex flex-col gap-6">
      <div class="flex flex-col gap-2">
        <label class="text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-neutral-500">Logo</label>
        <div 
          class="w-full bg-white/[0.03] border border-dashed border-white/20 rounded-xl p-4 flex items-center gap-4 cursor-pointer hover:bg-white/[0.05] hover:border-[#00D4FF]/50 transition-all group"
          @click="triggerFileInput"
        >
          <input 
            type="file" 
            ref="fileInput" 
            accept="image/*" 
            class="hidden" 
            @change="handleFileSelect"
          />
          <div class="relative w-12 h-12 rounded-lg bg-black/50 border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
            <svg class="absolute w-5 h-5 text-neutral-500 group-hover:text-[#00D4FF] transition-colors z-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            <img 
              v-if="form.logoFileBase64 || form.logoUrl" 
              :key="form.logoFileBase64 || form.logoUrl"
              :src="form.logoFileBase64 || form.logoUrl" 
              class="w-full h-full object-cover relative z-10 transition-opacity duration-300" 
              @error="(e) => (e.target as HTMLImageElement).style.opacity = '0'"
            />
          </div>
          <div class="flex flex-col">
            <span class="text-sm text-white font-medium group-hover:text-[#00D4FF] transition-colors">
              {{ form.logoFileBase64 ? 'Logo actualizado' : (form.logoUrl ? 'Cambiar logo' : 'Subir imagen') }}
            </span>
            <span class="text-[10px] text-neutral-500 uppercase tracking-wider">
              {{ form.logoFileBase64 ? 'Listo para guardar' : 'Recomendado: 256x256' }}
            </span>
          </div>
        </div>
      </div>
      
      <div class="flex flex-col gap-2">
        <label class="text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-neutral-500">Descripción Corta</label>
        <textarea
          v-model="form.startupType"
          placeholder="Plataforma de IA para..."
          class="w-full bg-white/[0.07] border border-white/20 rounded-xl px-4 py-4 text-white text-sm font-sans font-light placeholder:text-neutral-500 focus:outline-none focus:border-[#00D4FF]/70 focus:bg-white/[0.1] transition-all duration-300 resize-none h-24 custom-scrollbar"
        ></textarea>
      </div>
    </div>

    <div class="flex gap-4 items-end">
      <div class="flex flex-col gap-2 flex-1">
        <label class="text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-neutral-500">Categorías *</label>
        <CategorySelect v-model="form.categorySlugs" />
      </div>

      <div class="flex flex-col gap-2 shrink-0">
        <label class="text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-neutral-500 text-center">País</label>
        <CountrySelect v-model="form.countrySlug" />
      </div>
    </div>

    <AddSaasInput
      v-model="form.founderEmail"
      label="Email (Privado)"
      type="email"
      placeholder="hola@tuweb.com"
      required
      tooltip="Con este email podrás reclamar y verificar la autoría de esta startup más adelante."
    />
    <Transition name="fade">
      <p v-if="form.id && initialEmail && form.founderEmail !== initialEmail" class="text-[10px] text-amber-400 bg-amber-400/10 p-2.5 rounded-xl border border-amber-400/20 leading-relaxed -mt-2">
        ⚠️ Atención: Si cambias tu email perderás el acceso actual a esta pantalla. Tendrás que volver a verificar tu identidad con el nuevo correo para poder gestionar la startup en el futuro.
      </p>
    </Transition>
  </div>
</template>
