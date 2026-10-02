<script setup lang="ts">
import { ref, computed, nextTick, onUnmounted, watch } from 'vue'
import CountrySelect from '~/ui/components/CountrySelect.vue'
import AddSaasProviderSelection from '~/modules/add-saas/components/AddSaasProviderSelection.vue'
import AddSaasConnectionArea from '~/modules/add-saas/components/AddSaasConnectionArea.vue'
import { useFounderSession } from '~/composables/useFounderSession'
import { useMercadoPagoAuth } from '~/modules/add-saas/composables/useMercadoPagoAuth'

import es from '../locales/es.json'
import en from '../locales/en.json'
const { t } = useLanguage({ es, en })
const { checkSession, isAuthenticated, founder, startups, isOwnerOf } = useFounderSession()

const props = defineProps<{
  saasId: string
  saasName: string | null
  currentFounderName: string | null
  founderEmail: string | null
  intent?: 'founder' | 'mrr'
}>()

const emit = defineEmits<{
  close: []
  claimed: [founder: { name: string; countrySlug: string }]
  'edit-startup': [saasData: any]
}>()

const showClaimModal = useState('claim-founder-modal-open', () => false)

type Step = 'email' | 'otp' | 'edit'

const step = ref<Step>('email')
const email = ref('')
const loading = ref(false)
const error = ref('')
let errorTimer: ReturnType<typeof setTimeout> | null = null

function showError(msg: string) {
  error.value = msg
  if (errorTimer) clearTimeout(errorTimer)
  errorTimer = setTimeout(() => {
    error.value = ''
  }, 4000)
}

const otpDigits = ref<string[]>(['', '', '', '', '', ''])
const otpRefs = ref<HTMLInputElement[]>([])
const resendCountdown = ref(0)
let resendTimer: ReturnType<typeof setInterval> | null = null
const showLostAccessInfo = ref(false)

const founderName = ref(props.currentFounderName || '')
const countrySlug = ref('')
const twitterUrl = ref('')
const linkedinUrl = ref('')
const instagramUrl = ref('')

const provider = ref<'whop' | 'stripe' | 'mercadopago' | 'none'>('stripe')
const apiKey = ref('')
const detectedMrr = ref<number | null>(null)

const { isMpConnecting, openMpAuth } = useMercadoPagoAuth((mrr) => {
  detectedMrr.value = mrr
  apiKey.value = 'MERCADO_PAGO_OAUTH_TOKEN'
})

const maskedEmail = computed(() => {
  if (!props.founderEmail) return null
  const [local, domain] = props.founderEmail.split('@')
  if (!domain) return props.founderEmail
  const visible = local.slice(0, 3)
  return `${visible}***@${domain}`
})

const otpCode = computed(() => otpDigits.value.join(''))

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

watch(() => [props.saasId, showClaimModal.value, isAuthenticated.value], checkLocalVerification, { immediate: true })

function checkLocalVerification() {
  if (import.meta.client && props.saasId && showClaimModal.value) {
    if (isAuthenticated.value) {
      const isOwner = isOwnerOf(props.founderEmail, props.saasId) || startups.value.some(s => s.id === props.saasId)
      if (isOwner) {
        emit('edit-startup', {})
        showClaimModal.value = false
        return
      }
      if (founder.value?.email) {
        email.value = founder.value.email
      }
    }

    try {
      const stored = localStorage.getItem(`facto_founder_verified_${props.saasId}`)
      if (stored) {
        const data = JSON.parse(stored)
        if (data.email && data.expires > Date.now()) {
          email.value = data.email
          step.value = 'edit'
        } else {
          localStorage.removeItem(`facto_founder_verified_${props.saasId}`)
          step.value = 'email'
        }
      }
    } catch (e) {}
  }
}

async function sendOtp() {
  if (!email.value) return
  loading.value = true
  error.value = ''
  try {
    await $fetch('/api/auth/send-otp', {
      method: 'POST',
      body: { email: email.value, saasId: props.saasId }
    })
    step.value = 'otp'
    startResendCountdown()
    await nextTick()
    otpRefs.value[0]?.focus()
  } catch (e: any) {
    showError(e?.data?.message || t.value.profile.claim_modal.err_send)
  } finally {
    loading.value = false
  }
}

async function resendOtp() {
  if (resendCountdown.value > 0) return
  loading.value = true
  error.value = ''
  try {
    await $fetch('/api/auth/send-otp', {
      method: 'POST',
      body: { email: email.value, saasId: props.saasId }
    })
    startResendCountdown()
    otpDigits.value = ['', '', '', '', '', '']
    await nextTick()
    otpRefs.value[0]?.focus()
  } catch (e: any) {
    showError(e?.data?.message || t.value.profile.claim_modal.err_resend)
  } finally {
    loading.value = false
  }
}

function handleOtpInput(index: number, event: Event) {
  const target = event.target as HTMLInputElement
  const value = target.value.replace(/\D/g, '')
  otpDigits.value[index] = value.slice(-1)

  if (value && index < 5) {
    otpRefs.value[index + 1]?.focus()
  }
}

function handleOtpKeydown(index: number, event: KeyboardEvent) {
  if (event.key === 'Backspace' && !otpDigits.value[index] && index > 0) {
    otpRefs.value[index - 1]?.focus()
  }
}

function handleOtpPaste(event: ClipboardEvent) {
  const pasted = event.clipboardData?.getData('text')?.replace(/\D/g, '') || ''
  if (pasted.length >= 6) {
    event.preventDefault()
    for (let i = 0; i < 6; i++) {
      otpDigits.value[i] = pasted[i] || ''
    }
    otpRefs.value[5]?.focus()
  }
}

async function verifyOtp() {
  if (otpCode.value.length !== 6) return
  loading.value = true
  error.value = ''
  try {
    await $fetch('/api/auth/verify-otp', {
      method: 'POST',
      body: { email: email.value, code: otpCode.value }
    })
    
    // Guardar verificación por 1 día (24h)
    if (import.meta.client) {
      localStorage.setItem(`facto_founder_verified_${props.saasId}`, JSON.stringify({
        email: email.value,
        expires: Date.now() + 15 * 24 * 60 * 60 * 1000 // 15 días
      }))
    }

    // Sincronizar la sesión del founder con la nueva cookie
    await checkSession(true)

    if (props.currentFounderName) {
      emit('edit-startup', {})
    } else {
      step.value = 'edit'
    }
  } catch (e: any) {
    const msg = e?.data?.message || ''
    if (msg.includes('expired')) showError(t.value.profile.claim_modal.err_expired)
    else if (msg.includes('invalid')) showError(t.value.profile.claim_modal.err_invalid)
    else showError(msg || t.value.profile.claim_modal.err_wrong)
    
    otpDigits.value = ['', '', '', '', '', '']
    nextTick(() => {
      otpRefs.value[0]?.focus()
    })
  } finally {
    loading.value = false
  }
}

async function saveFounder(isEditFlow = false): Promise<boolean> {
  if (props.intent === 'founder' && !founderName.value.trim()) {
    showError(t.value.profile.claim_modal.err_name)
    return false
  }
  if (props.intent === 'mrr' && !apiKey.value.trim()) {
    showError(t.value.profile.claim_modal.err_api)
    return false
  }
  
  loading.value = true
  try {
    await $fetch('/api/saas/claim', {
      method: 'POST',
      body: {
        saasId: props.saasId,
        email: email.value,
        intent: props.intent || 'founder',
        
        // Founder fields
        name: founderName.value.trim(),
        countrySlug: countrySlug.value,
        twitterUrl: twitterUrl.value || undefined,
        linkedinUrl: linkedinUrl.value || undefined,
        instagramUrl: instagramUrl.value || undefined,
        
        // MRR fields
        providerSlug: provider.value,
        providerKey: apiKey.value.trim()
      }
    })
    await checkSession(true)
    if (!isEditFlow) {
      emit('claimed', {
        name: founderName.value.trim(),
        countrySlug: countrySlug.value
      })
    }
    return true
  } catch (e: any) {
    showError(e?.data?.message || t.value.profile.claim_modal.err_save)
    return false
  } finally {
    loading.value = false
  }
}

function handleEditStartup() {
  emit('edit-startup', {
    id: props.saasId,
    name: props.saasName,
    founderName: founderName.value,
    founderEmail: email.value || props.founderEmail,
    countrySlug: countrySlug.value,
    twitterUrl: twitterUrl.value,
    linkedinUrl: linkedinUrl.value,
    instagramUrl: instagramUrl.value
  })
}
</script>

<template>
  <Transition name="backdrop">
    <div
      v-show="showClaimModal"
      class="fixed inset-0 z-[90] bg-black/80 backdrop-blur-md"
      @click="emit('close')"
    />
  </Transition>

  <Transition name="fade">
    <div
      v-show="showClaimModal"
      class="fixed inset-0 z-[100] flex items-center justify-center p-4"
      @click.self="emit('close')"
    >
      <div class="relative w-full max-w-md bg-[#0c0c10] border border-white/10 rounded-2xl overflow-hidden shadow-[0_30px_100px_rgba(0,0,0,0.8)] pointer-events-auto">
        <button
          v-if="step === 'otp'"
          class="absolute top-4 left-4 z-10 text-neutral-500 hover:text-white transition-colors"
          @click="step = 'email'"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>

        <button
          class="absolute top-4 right-4 z-10 text-neutral-500 hover:text-white transition-colors"
          @click="emit('close')"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <path d="M18 6L6 18" /><path d="M6 6l12 12" />
          </svg>
        </button>

        <div class="px-8 pt-8 pb-6">
          <!-- Step 1: Email -->
          <div v-if="step === 'email'">
            <h2 class="text-2xl font-serif text-white font-semibold mb-1">
              {{ intent === 'mrr' ? t.profile.claim_modal.verify_mrr : (currentFounderName ? t.profile.claim_modal.verify_identity : t.profile.claim_modal.claim_startup) }}
            </h2>
            <p class="text-sm font-sans font-light text-neutral-400 mb-6">{{ t.profile.claim_modal.verify_desc }}</p>

            <div v-if="maskedEmail" class="mb-4">
              <p class="text-[11px] font-sans font-medium uppercase tracking-[0.2em] text-neutral-300 mb-2">{{ t.profile.claim_modal.registered_email }}</p>
              <p class="text-sm font-sans font-light text-neutral-500">{{ maskedEmail }}</p>
            </div>

            <label class="text-[11px] font-sans font-medium uppercase tracking-[0.2em] text-neutral-300 block mb-2">{{ t.profile.claim_modal.your_email }}</label>
            <div class="relative mb-6">
              <input
                v-model="email"
                type="email"
                :placeholder="t.profile.claim_modal.email_placeholder"
                class="w-full bg-white/[0.07] border border-white/20 rounded-xl px-4 py-4 text-white text-sm font-sans font-light placeholder:text-neutral-500 focus:outline-none focus:border-[#00D4FF]/70 focus:bg-white/[0.1] transition-all duration-300"
                @input="error = ''"
                @keydown.enter="sendOtp"
              />
              <p class="absolute -bottom-5 left-1/2 -translate-x-1/2 w-full text-center text-[11px] text-[#00D4FF] font-sans font-light transition-opacity duration-300 pointer-events-none" :class="error ? 'opacity-100' : 'opacity-0'">
                {{ error }}
              </p>
            </div>

            <button
              :disabled="!email || loading"
              class="w-full bg-white text-black font-bold uppercase tracking-widest text-xs rounded-full py-3.5 transition-all duration-700 hover:scale-[1.03] disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100"
              :class="{ 'claim-btn-glow': email && !loading }"
              @click="sendOtp"
            >
              <span v-if="loading">{{ t.profile.claim_modal.sending }}</span>
              <span v-else>{{ t.profile.claim_modal.send_code }}</span>
            </button>
          </div>

          <!-- Step 2: OTP -->
          <div v-if="step === 'otp'">
            <h2 class="text-2xl font-serif text-white font-semibold mb-1">{{ t.profile.claim_modal.enter_code }}</h2>
            <p class="text-sm font-sans font-light text-neutral-400 mb-6">{{ t.profile.claim_modal.code_sent }}</p>

            <div class="relative flex justify-center gap-2.5 mb-6" @paste="handleOtpPaste">
              <input
                v-for="(_, i) in 6"
                :key="i"
                :ref="(el) => { if (el) otpRefs[i] = el as HTMLInputElement }"
                :value="otpDigits[i]"
                type="text"
                inputmode="numeric"
                maxlength="1"
                class="w-12 h-14 text-center text-xl font-bold bg-white/[0.07] border border-white/20 rounded-xl text-white focus:outline-none focus:border-[#00D4FF]/70 focus:bg-white/[0.1] transition-all duration-300"
                @input="handleOtpInput(i, $event)"
                @keydown="handleOtpKeydown(i, $event)"
              />
              <p class="absolute -bottom-5 left-1/2 -translate-x-1/2 w-full text-center text-[11px] text-[#00D4FF] font-sans font-light transition-opacity duration-300 pointer-events-none" :class="error ? 'opacity-100' : 'opacity-0'">
                {{ error }}
              </p>
            </div>

            <button
              :disabled="otpCode.length !== 6 || loading"
              class="w-full bg-white text-black font-bold uppercase tracking-widest text-xs rounded-full py-3.5 transition-all duration-700 hover:scale-[1.03] disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100"
              :class="{ 'claim-btn-glow': otpCode.length === 6 && !loading }"
              @click="verifyOtp"
            >
              <span v-if="loading">{{ t.profile.claim_modal.verifying }}</span>
              <span v-else>{{ t.profile.claim_modal.verify }}</span>
            </button>

            <div class="mt-5 text-center">
              <button
                :disabled="resendCountdown > 0"
                class="text-xs font-sans font-light transition-colors duration-300"
                :class="resendCountdown > 0 ? 'text-neutral-600 cursor-not-allowed' : 'text-[#00D4FF] hover:text-[#00D4FF]/80 cursor-pointer'"
                @click="resendOtp"
              >
                <template v-if="resendCountdown > 0">{{ t.profile.claim_modal.resend_wait.replace('{seconds}', resendCountdown.toString()) }}</template>
                <template v-else>{{ t.profile.claim_modal.resend_code }}</template>
              </button>
            </div>

            <div class="mt-4 text-center">
              <button
                class="text-[11px] font-sans font-light text-neutral-500 hover:text-neutral-300 transition-colors duration-300"
                @click="showLostAccessInfo = !showLostAccessInfo"
              >
                {{ t.profile.claim_modal.lost_access }}
              </button>
              <Transition name="fade">
                <div v-if="showLostAccessInfo" class="mt-3 bg-white/[0.04] border border-white/10 rounded-xl p-3.5">
                  <p class="text-[11px] font-sans font-light text-neutral-400 leading-relaxed" v-html="t.profile.claim_modal.lost_access_desc">
                  </p>
                </div>
              </Transition>
            </div>
          </div>

          <!-- Step 3: Edit Data -->
          <div v-if="step === 'edit'">
            <h2 class="text-2xl font-serif text-white font-semibold mb-1">
              {{ intent === 'mrr' ? t.profile.claim_modal.connect_mrr : t.profile.claim_modal.complete_profile }}
            </h2>
            <p class="text-sm font-sans font-light text-neutral-400 mb-6">
              {{ intent === 'mrr' ? t.profile.claim_modal.select_gateway : t.profile.claim_modal.data_public }}
            </p>

            <div v-if="intent === 'founder' || !intent" class="flex flex-col gap-5">
              <div class="flex gap-4 items-end">
                <div class="flex flex-col gap-2 flex-1">
                  <label class="text-[11px] font-sans font-medium uppercase tracking-[0.2em] text-neutral-300 block">{{ t.profile.claim_modal.name_label }}</label>
                  <input
                    v-model="founderName"
                    type="text"
                    :placeholder="t.profile.claim_modal.name_placeholder"
                    class="w-full bg-white/[0.07] border border-white/20 rounded-xl px-4 py-4 text-white text-sm font-sans font-light placeholder:text-neutral-500 focus:outline-none focus:border-[#00D4FF]/70 focus:bg-white/[0.1] transition-all duration-300"
                  />
                </div>

                <div class="flex flex-col gap-2 shrink-0">
                  <label class="text-[11px] font-sans font-medium uppercase tracking-[0.2em] text-neutral-300 block text-center">{{ t.profile.claim_modal.country_label }}</label>
                  <CountrySelect v-model="countrySlug" />
                </div>
              </div>

              <div>
                <label class="text-[11px] font-sans font-medium uppercase tracking-[0.2em] text-neutral-300 block mb-2">{{ t.profile.claim_modal.twitter_label }}</label>
                <input
                  v-model="twitterUrl"
                  type="url"
                  :placeholder="t.profile.claim_modal.twitter_placeholder"
                  class="w-full bg-white/[0.07] border border-white/20 rounded-xl px-4 py-4 text-white text-sm font-sans font-light placeholder:text-neutral-500 focus:outline-none focus:border-[#00D4FF]/70 focus:bg-white/[0.1] transition-all duration-300"
                />
              </div>

              <div>
                <label class="text-[11px] font-sans font-medium uppercase tracking-[0.2em] text-neutral-300 block mb-2">{{ t.profile.claim_modal.instagram_label }}</label>
                <input
                  v-model="instagramUrl"
                  type="url"
                  :placeholder="t.profile.claim_modal.instagram_placeholder"
                  class="w-full bg-white/[0.07] border border-white/20 rounded-xl px-4 py-4 text-white text-sm font-sans font-light placeholder:text-neutral-500 focus:outline-none focus:border-[#00D4FF]/70 focus:bg-white/[0.1] transition-all duration-300"
                />
              </div>

              <div class="mb-5 relative">
                <label class="text-[11px] font-sans font-medium uppercase tracking-[0.2em] text-neutral-300 block mb-2">{{ t.profile.claim_modal.linkedin_label }}</label>
                <input
                  v-model="linkedinUrl"
                  type="url"
                  :placeholder="t.profile.claim_modal.linkedin_placeholder"
                  class="w-full bg-white/[0.07] border border-white/20 rounded-xl px-4 py-4 text-white text-sm font-sans font-light placeholder:text-neutral-500 focus:outline-none focus:border-[#00D4FF]/70 focus:bg-white/[0.1] transition-all duration-300"
                />
                <p class="absolute -bottom-5 left-1/2 -translate-x-1/2 w-full text-center text-[11px] text-[#00D4FF] font-sans font-light transition-opacity duration-300 pointer-events-none" :class="error ? 'opacity-100' : 'opacity-0'">
                  {{ error }}
                </p>
              </div>
            </div>
            
            <div v-else-if="intent === 'mrr'" class="flex flex-col gap-5">
              <AddSaasProviderSelection v-model="provider" />
              <AddSaasConnectionArea 
                :provider="provider"
                :detected-mrr="detectedMrr"
                :is-mp-connecting="isMpConnecting"
                :open-mp-auth="openMpAuth"
                v-model:apiKey="apiKey"
              />
              <p class="absolute -bottom-5 left-1/2 -translate-x-1/2 w-full text-center text-[11px] text-[#00D4FF] font-sans font-light transition-opacity duration-300 pointer-events-none" :class="error ? 'opacity-100' : 'opacity-0'">
                {{ error }}
              </p>
            </div>

            <button
              :disabled="loading"
              class="w-full mt-6 bg-white text-black font-bold uppercase tracking-widest text-xs rounded-full py-3.5 transition-all duration-700 hover:scale-[1.03] disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100"
              :class="{ 'claim-btn-glow': !loading }"
              @click="() => saveFounder(false)"
            >
              <span v-if="loading">{{ t.profile.claim_modal.saving }}</span>
              <span v-else>{{ t.profile.claim_modal.save }}</span>
            </button>

            <div class="mt-5 text-center">
              <button
                class="text-[11px] font-sans font-light text-neutral-500 hover:text-[#00D4FF] transition-colors duration-300"
                @click="handleEditStartup"
              >
                {{ t.profile.claim_modal.change_data }}
              </button>
            </div>
          </div>
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

.claim-btn-glow:hover {
  box-shadow: 0 0 15px rgba(255, 255, 255, 0.5), 0 0 30px rgba(0, 212, 255, 0.3), 0 0 45px rgba(0, 212, 255, 0.1);
}
</style>
