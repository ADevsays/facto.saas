<script setup lang="ts">
import { ref, nextTick, onUnmounted } from 'vue'
import { useLoginModal } from '~/composables/useLoginModal'
import { useFounderSession } from '~/composables/useFounderSession'

const { isOpen, close } = useLoginModal()
const { checkSession, startups } = useFounderSession()
const router = useRouter()
const localePath = useLocalePath()
const { t } = useI18n()

const step = ref<'email' | 'otp'>('email')
const email = ref('')
const loading = ref(false)
const error = ref('')
let errorTimer: ReturnType<typeof setTimeout> | null = null

const otpDigits = ref<string[]>(['', '', '', '', '', ''])
const otpRefs = ref<HTMLInputElement[]>([])
const resendCountdown = ref(0)
let resendTimer: ReturnType<typeof setInterval> | null = null

function showError(msg: string) {
  error.value = msg
  if (errorTimer) clearTimeout(errorTimer)
  errorTimer = setTimeout(() => {
    error.value = ''
  }, 4000)
}

function startResendCountdown() {
  resendCountdown.value = 60
  if (resendTimer) clearInterval(resendTimer)
  resendTimer = setInterval(() => {
    resendCountdown.value--
    if (resendCountdown.value <= 0 && resendTimer) {
      clearInterval(resendTimer)
      resendTimer = null
    }
  }, 1000)
}

onUnmounted(() => {
  if (resendTimer) clearInterval(resendTimer)
  if (errorTimer) clearTimeout(errorTimer)
})

function handleClose() {
  close()
  setTimeout(() => {
    step.value = 'email'
    email.value = ''
    otpDigits.value = ['', '', '', '', '', '']
    error.value = ''
  }, 300)
}

async function handleSendOtp() {
  if (!email.value.trim()) {
    showError(t('auth.err_email'))
    return
  }
  loading.value = true
  error.value = ''
  try {
    await $fetch('/api/auth/send-otp', {
      method: 'POST',
      body: { email: email.value.trim().toLowerCase() }
    })
    step.value = 'otp'
    startResendCountdown()
    nextTick(() => {
      otpRefs.value[0]?.focus()
    })
  } catch (err: any) {
    showError(err.data?.message || err.message || t('auth.err_send'))
  } finally {
    loading.value = false
  }
}

function onOtpInput(index: number, event: Event) {
  const target = event.target as HTMLInputElement
  const val = target.value.replace(/\D/g, '')

  if (val.length > 1) {
    const chars = val.split('').slice(0, 6)
    chars.forEach((c, i) => {
      if (index + i < 6) otpDigits.value[index + i] = c
    })
    const nextIdx = Math.min(index + chars.length, 5)
    otpRefs.value[nextIdx]?.focus()
  } else {
    otpDigits.value[index] = val
    if (val && index < 5) {
      otpRefs.value[index + 1]?.focus()
    }
  }

  if (otpDigits.value.every(d => d !== '')) {
    submitOtp()
  }
}

function onOtpKeydown(index: number, event: KeyboardEvent) {
  if (event.key === 'Backspace' && !otpDigits.value[index] && index > 0) {
    otpRefs.value[index - 1]?.focus()
  }
}

async function submitOtp() {
  const code = otpDigits.value.join('')
  if (code.length < 6) {
    showError(t('auth.err_code_length'))
    return
  }

  loading.value = true
  error.value = ''
  try {
    await $fetch('/api/auth/verify-otp', {
      method: 'POST',
      body: {
        email: email.value.trim().toLowerCase(),
        code
      }
    })

    await checkSession(true)
    handleClose()
    if (startups.value.length > 0) {
      router.push(localePath(`/dashboard/saas/${startups.value[0].slug}`))
    } else {
      router.push(localePath('/dashboard/startups'))
    }
  } catch (err: any) {
    showError(err.data?.message || err.message || t('auth.err_invalid_code'))
    otpDigits.value = ['', '', '', '', '', '']
    nextTick(() => {
      otpRefs.value[0]?.focus()
    })
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div>
    <Transition name="backdrop">
      <div v-if="isOpen" class="fixed inset-0 z-[95] bg-black/80 backdrop-blur-md" @click="handleClose" />
    </Transition>

    <Transition name="fade">
      <div v-if="isOpen" class="fixed inset-0 z-[100] flex items-center justify-center p-4 pointer-events-none" @click.self="handleClose">
        <div class="relative w-full max-w-[440px] bg-[#0c0c10] border border-white/10 rounded-3xl p-6 md:p-8 shadow-[0_30px_100px_rgba(0,0,0,0.85)] flex flex-col pointer-events-auto">
          <!-- Close button -->
          <button
            @click="handleClose"
            class="absolute top-5 right-5 text-neutral-400 hover:text-white p-1 rounded-full hover:bg-white/5 transition-colors cursor-pointer"
          >
            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>

          <!-- Step 1: Email -->
          <div v-if="step === 'email'" class="flex flex-col">
            <div class="mb-6">
              <span class="text-[10px] font-mono tracking-widest text-[#00D4FF] uppercase block mb-1.5">
                {{ t('auth.badge') }}
              </span>
              <h2 class="font-serif text-2xl text-white font-medium">
                {{ t('auth.title') }}
              </h2>
              <p class="text-xs text-neutral-400 mt-1.5 leading-relaxed font-light">
                {{ t('auth.desc') }}
              </p>
            </div>

            <form @submit.prevent="handleSendOtp" class="space-y-4">
              <div>
                <label class="block text-xs text-neutral-300 font-medium mb-2">
                  {{ t('auth.email_label') }}
                </label>
                <input
                  v-model="email"
                  type="email"
                  required
                  :placeholder="t('auth.email_placeholder')"
                  class="w-full px-4 py-3 rounded-2xl bg-white/[0.03] border border-white/10 text-white placeholder-neutral-500 text-sm focus:outline-none focus:border-[#00D4FF]/60 focus:bg-white/[0.05] transition-all"
                />
              </div>

              <div v-if="error" class="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400">
                {{ error }}
              </div>

              <button
                type="submit"
                :disabled="loading"
                class="w-full py-3 px-4 rounded-2xl bg-white text-black font-medium text-sm hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.2)] disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
              >
                <span v-if="loading" class="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
                <span>{{ loading ? t('auth.sending_code') : t('auth.send_code') }}</span>
              </button>
            </form>
          </div>

          <!-- Step 2: OTP -->
          <div v-else class="flex flex-col">
            <div class="mb-6">
              <span class="text-[10px] font-mono tracking-widest text-[#00D4FF] uppercase block mb-1.5">
                {{ t('auth.otp_badge') }}
              </span>
              <h2 class="font-serif text-2xl text-white font-medium">
                {{ t('auth.otp_title') }}
              </h2>
              <p class="text-xs text-neutral-400 mt-1.5 leading-relaxed font-light">
                {{ t('auth.otp_desc') }}
                <strong class="text-white font-medium">{{ email }}</strong>.
              </p>
            </div>

            <div class="space-y-5">
              <div class="flex justify-between gap-2">
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
                  class="w-11 h-13 text-center text-lg font-mono font-bold text-[#00D4FF] rounded-2xl bg-white/[0.03] border border-white/10 focus:outline-none focus:border-[#00D4FF] focus:bg-[#00D4FF]/5 transition-all"
                />
              </div>

              <div v-if="error" class="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400">
                {{ error }}
              </div>

              <button
                @click="submitOtp"
                :disabled="loading"
                class="w-full py-3 px-4 rounded-2xl bg-white text-black font-medium text-sm hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.2)] disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
              >
                <span v-if="loading" class="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
                <span>{{ loading ? t('auth.verifying') : t('auth.verify_btn') }}</span>
              </button>

              <div class="flex items-center justify-between text-xs pt-2">
                <button
                  type="button"
                  @click="step = 'email'"
                  class="text-neutral-400 hover:text-white transition-colors cursor-pointer"
                >
                  {{ t('auth.change_email') }}
                </button>
                <button
                  type="button"
                  :disabled="resendCountdown > 0 || loading"
                  @click="handleSendOtp"
                  class="text-neutral-400 hover:text-[#00D4FF] disabled:opacity-40 disabled:hover:text-neutral-400 transition-colors cursor-pointer"
                >
                  {{ resendCountdown > 0 ? t('auth.resend_in', { seconds: resendCountdown }) : t('auth.resend_code') }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.backdrop-enter-active,
.backdrop-leave-active {
  transition: opacity 0.3s ease;
}
.backdrop-enter-from,
.backdrop-leave-to {
  opacity: 0;
}

.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: scale(0.96) translateY(8px);
}
</style>
