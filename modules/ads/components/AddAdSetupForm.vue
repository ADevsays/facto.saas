<script setup lang="ts">
import { Loader2, Upload } from 'lucide-vue-next'
import AdCard from './AdCard.vue'
import { useLanguage } from '~/composables/useLanguage'
import es from '../locales/es.json'
import en from '../locales/en.json'

const { t } = useLanguage({ es, en })

const props = withDefaults(defineProps<{
  step: number
  subStep?: 'email' | 'otp'
  email: string
  selectedSlot: number
  isValidatingToken: boolean
  isChecking?: boolean
  isSendingOtp?: boolean
  isVerifyingOtp?: boolean
  otpDigits?: string[]
  resendCountdown?: number
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
}>(), {
  subStep: 'email',
  isChecking: false,
  isSendingOtp: false,
  isVerifyingOtp: false,
  otpDigits: () => ['', '', '', '', '', ''],
  resendCountdown: 0
})

const emit = defineEmits<{
  (e: 'update:email', val: string): void
  (e: 'check-email'): void
  (e: 'send-otp'): void
  (e: 'verify-otp'): void
  (e: 'back-to-email'): void
  (e: 'upload-file', file: File): void
  (e: 'submit-setup'): void
}>()

const otpRefs = ref<HTMLInputElement[]>([])

function onOtpInput(index: number, event: Event) {
  const target = event.target as HTMLInputElement
  const val = target.value.replace(/\D/g, '')

  if (props.otpDigits) {
    if (val.length > 1) {
      const chars = val.split('').slice(0, 6)
      chars.forEach((c, i) => {
        if (index + i < 6) props.otpDigits[index + i] = c
      })
      const nextIdx = Math.min(index + chars.length, 5)
      otpRefs.value[nextIdx]?.focus()
    } else {
      props.otpDigits[index] = val
      if (val && index < 5) {
        otpRefs.value[index + 1]?.focus()
      }
    }

    if (props.otpDigits.every(d => d !== '')) {
      emit('verify-otp')
    }
  }
}

function onOtpKeydown(index: number, event: KeyboardEvent) {
  if (props.otpDigits && event.key === 'Backspace' && !props.otpDigits[index] && index > 0) {
    otpRefs.value[index - 1]?.focus()
  }
}

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

    <!-- Step 1: Verify Email / OTP -->
    <template v-else-if="step === 1">
      <!-- Sub-step 1A: Enter Email -->
      <div v-if="subStep === 'email'" class="flex flex-col gap-4">
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
            @keydown.enter="emit('send-otp')"
          />
        </div>

        <p v-if="errorMsg" class="text-red-400 text-xs">{{ errorMsg }}</p>

        <button
          type="button"
          @click="emit('send-otp')"
          :disabled="isSendingOtp || !email"
          class="bg-white text-black font-bold uppercase tracking-widest text-[11px] px-6 py-3.5 rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-transform disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(255,255,255,0.15)]"
        >
          <Loader2 v-if="isSendingOtp" class="w-4 h-4 animate-spin" />
          {{ isSendingOtp ? 'Enviando código...' : 'Continuar y recibir código' }}
        </button>
      </div>

      <!-- Sub-step 1B: Enter 6-digit OTP -->
      <div v-else class="flex flex-col gap-4">
        <div class="space-y-1">
          <span class="text-[10px] font-mono tracking-widest text-[#00D4FF] uppercase block">
            Verificación de seguridad
          </span>
          <p class="text-xs text-neutral-300 leading-relaxed font-light">
            Hemos enviado un código único de 6 dígitos a <strong class="text-white font-medium">{{ email }}</strong>.
          </p>
        </div>

        <div class="flex justify-between gap-2 py-1">
          <input
            v-for="(_, idx) in otpDigits"
            :key="idx"
            :ref="(el) => { if (el) otpRefs[idx] = el as HTMLInputElement }"
            v-model="otpDigits[idx]"
            type="text"
            maxlength="1"
            inputmode="numeric"
            @input="onOtpInput(idx, $event)"
            @keydown="onOtpKeydown(idx, $event)"
            class="w-11 h-12 text-center text-lg font-mono font-bold text-[#00D4FF] rounded-xl bg-white/[0.03] border border-white/10 focus:outline-none focus:border-[#00D4FF] focus:bg-[#00D4FF]/5 transition-all"
          />
        </div>

        <p v-if="errorMsg" class="text-red-400 text-xs">{{ errorMsg }}</p>

        <button
          type="button"
          @click="emit('verify-otp')"
          :disabled="isVerifyingOtp || otpDigits.join('').length < 6"
          class="bg-[#00D4FF] text-black font-bold uppercase tracking-widest text-[11px] px-6 py-3.5 rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-transform disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(0,212,255,0.2)]"
        >
          <Loader2 v-if="isVerifyingOtp" class="w-4 h-4 animate-spin" />
          {{ isVerifyingOtp ? 'Verificando código...' : 'Verificar y configurar anuncio' }}
        </button>

        <div class="flex items-center justify-between text-xs pt-1">
          <button
            type="button"
            @click="emit('back-to-email')"
            class="text-neutral-400 hover:text-white transition-colors cursor-pointer"
          >
            Cambiar correo
          </button>
          <button
            type="button"
            :disabled="resendCountdown > 0 || isSendingOtp"
            @click="emit('send-otp')"
            class="text-neutral-400 hover:text-[#00D4FF] disabled:opacity-40 disabled:hover:text-neutral-400 transition-colors cursor-pointer"
          >
            {{ resendCountdown > 0 ? `Reenviar en ${resendCountdown}s` : 'Reenviar código' }}
          </button>
        </div>
      </div>
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
          <input
            v-if="!email"
            :value="email"
            @input="emit('update:email', ($event.target as HTMLInputElement).value)"
            type="email"
            placeholder="Introduce tu correo"
            class="bg-black/50 border border-[#00D4FF]/40 focus:border-[#00D4FF] rounded-xl px-3 py-2 text-white text-xs outline-none"
          />
          <input
            v-else
            :value="email"
            disabled
            class="bg-white/5 border border-white/5 rounded-xl px-3 py-2 text-neutral-300 text-xs outline-none"
          />
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
        :disabled="isSubmitting || !form.name || !form.url || !email"
        class="bg-[#00D4FF] text-black font-bold uppercase tracking-widest text-[11px] px-6 py-3.5 rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-transform disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
      >
        <Loader2 v-if="isSubmitting" class="w-4 h-4 animate-spin" />
        {{ isSubmitting ? t.modal.setup.activating : t.modal.setup.activate_btn.replace('{slot}', String(selectedSlot)) }}
      </button>
    </template>
  </div>
</template>
