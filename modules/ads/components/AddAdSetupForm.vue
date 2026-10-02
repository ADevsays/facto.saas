<script setup lang="ts">
import { Loader2, Upload } from 'lucide-vue-next'
import AdCard from './AdCard.vue'
import { useLanguage } from '~/composables/useLanguage'
import es from '../locales/es.json'
import en from '../locales/en.json'

const { t } = useLanguage({ es, en })

const props = defineProps<{
  step: number
  email: string
  selectedSlot: number
  isValidatingToken: boolean
  isChecking: boolean
  isSubmitting: boolean
  isUploadingImage: boolean
  uploadError: string
  errorMsg: string
  form: {
    name: string
    description: string
    url: string
    image_url: string
  }
}>()

const emit = defineEmits<{
  (e: 'update:email', val: string): void
  (e: 'check-email'): void
  (e: 'upload-file', file: File): void
  (e: 'submit-setup'): void
}>()

function onFileChange(e: Event) {
  const target = e.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    emit('upload-file', target.files[0])
    target.value = ''
  }
}
</script>

<template>
  <div class="flex flex-col gap-5">
    <!-- Validating token state -->
    <div v-if="isValidatingToken" class="flex flex-col items-center justify-center py-12 gap-3">
      <Loader2 class="w-8 h-8 text-[#00D4FF] animate-spin" />
      <p class="text-sm font-sans font-medium text-white">{{ t.modal.setup.validating_title }}</p>
      <p class="text-xs text-neutral-400 font-light">{{ t.modal.setup.validating_desc }}</p>
    </div>

    <!-- Step 1: Verify Email -->
    <template v-else-if="step === 1">
      <p class="text-sm font-sans font-light text-neutral-400">
        {{ t.modal.setup.step1_desc }}
      </p>

      <div class="flex flex-col gap-1.5">
        <label class="text-xs font-bold text-neutral-300 uppercase tracking-widest">{{ t.modal.setup.step1_email_label }}</label>
        <input
          :value="email"
          @input="emit('update:email', ($event.target as HTMLInputElement).value)"
          type="email"
          :placeholder="t.modal.setup.step1_email_placeholder"
          class="bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#00D4FF]/50 transition-colors"
          @keydown.enter="emit('check-email')"
        />
      </div>

      <p v-if="errorMsg" class="text-red-400 text-xs">{{ errorMsg }}</p>

      <button
        type="button"
        @click="emit('check-email')"
        :disabled="isChecking || !email"
        class="bg-white text-black font-bold uppercase tracking-widest text-[11px] px-6 py-3.5 rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-transform disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
      >
        <Loader2 v-if="isChecking" class="w-4 h-4 animate-spin" />
        {{ isChecking ? t.modal.setup.step1_verifying : t.modal.setup.step1_continue }}
      </button>
    </template>

    <!-- Step 2: Ad Data -->
    <template v-else>
      <!-- Live Preview in Marquee -->
      <div class="space-y-1.5">
        <label class="block text-[10px] font-sans font-medium uppercase tracking-[0.2em] text-neutral-400">
          Vista previa en la marquesina
        </label>
        <div class="p-3 sm:p-4 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-center overflow-x-auto">
          <AdCard
            :name="form.name || 'Nombre de tu producto'"
            :description="form.description || 'Breve descripción que verán miles de fundadores...'"
            :url="form.url || 'https://tusaas.com'"
            :image_url="form.image_url"
            :position="selectedSlot"
            class="pointer-events-none shrink-0"
          />
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div class="flex flex-col gap-1">
          <div class="flex items-center justify-between">
            <label class="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">{{ t.modal.setup.verified_email_label }}</label>
            <span class="text-[9px] font-mono text-emerald-400 font-medium">{{ t.modal.setup.verified_tag }}</span>
          </div>
          <input :value="email" disabled class="bg-white/5 border border-white/5 rounded-xl px-3 py-2 text-neutral-300 text-xs outline-none" />
        </div>

        <div class="flex flex-col gap-1">
          <label class="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">{{ t.modal.setup.assigned_slot_label }}</label>
          <input :value="t.modal.setup.slot_prefix.replace('{slot}', String(selectedSlot))" disabled class="bg-white/5 border border-white/5 rounded-xl px-3 py-2 text-[#00D4FF] font-bold text-xs outline-none" />
        </div>
      </div>

      <div class="flex flex-col gap-1.5">
        <label class="text-xs font-bold text-neutral-300 uppercase tracking-widest">{{ t.modal.setup.name_label }}</label>
        <input
          v-model="form.name"
          type="text"
          :placeholder="t.modal.setup.name_placeholder"
          class="bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-[#00D4FF]/50 transition-colors"
        />
      </div>

      <div class="flex flex-col gap-1.5">
        <label class="text-xs font-bold text-neutral-300 uppercase tracking-widest">{{ t.modal.setup.pitch_label }}</label>
        <input
          v-model="form.description"
          type="text"
          :placeholder="t.modal.setup.pitch_placeholder"
          class="bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-[#00D4FF]/50 transition-colors"
        />
      </div>

      <div class="flex flex-col gap-1.5">
        <label class="text-xs font-bold text-neutral-300 uppercase tracking-widest">{{ t.modal.setup.url_label }}</label>
        <input
          v-model="form.url"
          type="url"
          placeholder="https://tusaas.com"
          class="bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-[#00D4FF]/50 transition-colors"
        />
      </div>

      <!-- Logo Upload -->
      <div class="flex flex-col gap-1.5">
        <label class="text-xs font-bold text-neutral-300 uppercase tracking-widest">{{ t.modal.setup.logo_label }}</label>
        <div class="flex items-center gap-3">
          <div v-if="form.image_url" class="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
            <img :src="form.image_url" alt="Logo preview" class="w-full h-full object-cover" />
          </div>
          <label class="cursor-pointer inline-flex items-center gap-2 bg-white/10 hover:bg-white/15 text-white px-4 py-2.5 rounded-xl text-xs font-medium border border-white/10 transition-colors">
            <Upload class="w-3.5 h-3.5 text-[#00D4FF]" />
            <span>{{ isUploadingImage ? t.modal.setup.logo_uploading : (form.image_url ? t.modal.setup.logo_change : t.modal.setup.logo_upload) }}</span>
            <input type="file" accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml,image/gif,image/x-icon" class="hidden" @change="onFileChange" :disabled="isUploadingImage" />
          </label>
        </div>
        <p v-if="uploadError" class="text-xs text-red-400 mt-1">{{ uploadError }}</p>
      </div>

      <p v-if="errorMsg" class="text-red-400 text-xs">{{ errorMsg }}</p>

      <button
        type="button"
        @click="emit('submit-setup')"
        :disabled="isSubmitting || !form.name || !form.url"
        class="bg-[#00D4FF] text-black font-bold uppercase tracking-widest text-[11px] px-6 py-3.5 rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-transform disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
      >
        <Loader2 v-if="isSubmitting" class="w-4 h-4 animate-spin" />
        {{ isSubmitting ? t.modal.setup.activating : t.modal.setup.activate_btn.replace('{slot}', String(selectedSlot)) }}
      </button>
    </template>
  </div>
</template>
