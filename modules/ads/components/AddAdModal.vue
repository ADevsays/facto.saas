<script setup lang="ts">
import { nextTick, ref, watch } from 'vue'
import { Users, ScanSearch, TicketCheck, Loader2, X } from 'lucide-vue-next'
import { useAddAdModal } from '../composables/useAddAdModal'
import { useAdsSlots } from '../composables/useAdsSlots'
import { useAdCheckout } from '../composables/useAdCheckout'
import { useAdSetupForm } from '../composables/useAdSetupForm'
import { useLanguage } from '~/composables/useLanguage'
import { useOtpModal } from '~/composables/useOtpModal'
import { useFounderSession } from '~/composables/useFounderSession'

import AddAdBidControls from './AddAdBidControls.vue'
import AddAdSetupForm from './AddAdSetupForm.vue'
import AddAdSuccessState from './AddAdSuccessState.vue'

import es from '../locales/es.json'
import en from '../locales/en.json'

const route = useRoute()
const router = useRouter()
const localePath = useLocalePath()
const { t } = useLanguage({ es, en })
const { open: openOtpModal } = useOtpModal()
const { founder, checkSession } = useFounderSession()

const { isOpen, mode, selectedSlot, targetPrice, targetAdName, setupToken, verifiedEmail, close, openForSetup } = useAddAdModal()
const { slots, refresh: refreshSlots, freeSlotsCount } = useAdsSlots()
const animatedSlot = ref<number | null>(null)
let selectionAnimationTimer: ReturnType<typeof setTimeout> | undefined

const {
  customBid,
  minPrice,
  allSlotsList,
  isSlotAvailable,
  isCreatingCheckout,
  checkoutError,
  selectSlot,
  decrementBid,
  incrementBid,
  syncBidWithMin,
  startCheckout
} = useAdCheckout({
  selectedSlot,
  targetPrice,
  targetAdName,
  slots,
  onCheckoutSuccess: () => close()
})

const {
  email,
  isValidatingToken,
  isSubmitting,
  setupSuccess,
  setupError,
  isUploadingImage,
  uploadError,
  form,
  resetSetup,
  validateToken,
  handleFileUpload,
  submitSetup
} = useAdSetupForm({
  selectedSlot,
  onSuccess: () => {
    setTimeout(() => {
      close()
      resetSetup()
      router.push(localePath('/dashboard/ads'))
    }, 2000)
  }
})

async function onSelectSlot(pos: number) {
  selectSlot(pos)
  animatedSlot.value = null
  await nextTick()
  animatedSlot.value = pos
  if (selectionAnimationTimer) clearTimeout(selectionAnimationTimer)
  selectionAnimationTimer = setTimeout(() => {
    animatedSlot.value = null
  }, 360)
}

function handleSubmitSetup() {
  const qPrice = Number(route.query.price)
  const setupPrice = (qPrice && !isNaN(qPrice)) ? qPrice : undefined
  submitSetup(setupPrice)
}

function startAdSetupFlow(slot = selectedSlot.value) {
  const currentEmail = verifiedEmail.value || founder.value?.email
  if (currentEmail) {
    email.value = currentEmail
    openForSetup(slot, setupToken.value, currentEmail)
    return
  }

  close()
  openOtpModal({
    mode: 'ad_setup',
    title: t.value.modal.setup.title,
    badge: t.value.modal.setup.subtitle,
    description: t.value.modal.setup.step1_desc,
    emailLabel: t.value.modal.setup.step1_email_label,
    emailPlaceholder: t.value.modal.setup.step1_email_placeholder,
    submitButtonText: t.value.modal.setup.step1_continue || 'Continuar',
    beforeSendOtp: async (emailToVerify) => {
      const res = await $fetch<any>('/api/ads/session', {
        params: {
          email: emailToVerify.trim().toLowerCase(),
          token: setupToken.value || undefined
        }
      })
      if (!res?.ok) {
        throw new Error(t.value.modal.setup.no_payment_found || 'No se encontró un pago activo para este correo.')
      }
    },
    onSuccess: async ({ email: verified }) => {
      verifiedEmail.value = verified
      email.value = verified
      openForSetup(slot, setupToken.value, verified)
    }
  })
}

watch(isOpen, async (val) => {
  if (typeof document !== 'undefined') {
    document.body.style.overflow = val ? 'hidden' : ''
  }
  if (val) {
    syncBidWithMin()

    await refreshSlots()

    if (route.query.slot) {
      const qSlot = Number(route.query.slot)
      if (qSlot >= 1 && qSlot <= 20) {
        selectedSlot.value = qSlot
      }
    }

    syncBidWithMin()

    if (mode.value === 'setup') {
      if (!verifiedEmail.value && !founder.value) await checkSession()
      if (!isOpen.value) return
      const tokenToValidate = setupToken.value || (typeof route.query.token === 'string' ? route.query.token : null)
      if (tokenToValidate) {
        await validateToken(tokenToValidate)
      }
      if (verifiedEmail.value) {
        email.value = verifiedEmail.value
      } else if (founder.value?.email) {
        email.value = founder.value.email
      } else if (!email.value && !isValidatingToken.value) {
        startAdSetupFlow(selectedSlot.value)
      }
    }
  } else {
    resetSetup()
    targetPrice.value = null
    targetAdName.value = null
    syncBidWithMin()
  }
})

watch(minPrice, (newMin) => {
  if (customBid.value < newMin) {
    customBid.value = newMin
  }
})
</script>

<template>
  <Transition name="backdrop">
    <div v-if="isOpen" class="fixed inset-0 z-[90] bg-black/80 backdrop-blur-md" @click="close" />
  </Transition>

  <Transition name="fade">
    <div v-if="isOpen" class="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 pointer-events-none" @click.self="close">
      <div
        class="relative w-full max-w-[900px] lg:min-h-[800px] bg-[#0c0c10] border border-white/10 rounded-3xl overflow-hidden shadow-[0_30px_100px_rgba(0,0,0,0.85)] flex flex-col max-h-[96vh] pointer-events-auto"
      >
        <!-- Header -->
        <div class="px-6 pt-6 pb-2 sm:px-8 md:px-9 sm:pt-7 flex items-start justify-between">
          <div class="flex flex-col gap-1 pr-3 min-w-0">
            <h2 class="font-serif text-[30px] sm:text-[36px] md:text-[40px] text-white tracking-tight leading-[1.05] whitespace-nowrap truncate">
              {{ mode === 'setup' ? t.modal.setup.title : t.modal.sale.title }}
            </h2>
            <p class="text-[11px] sm:text-xs font-mono font-normal text-[#00D4FF] tracking-[0.04em]">
              {{ mode === 'setup' ? t.modal.setup.subtitle : t.modal.sale.subtitle }}
            </p>
          </div>
          <button
            type="button"
            @click="close"
            class="text-neutral-500 hover:text-white transition-colors p-1.5 -mr-2 -mt-1 rounded-lg hover:bg-white/5 shrink-0 cursor-pointer"
          >
            <X class="w-5 h-5" />
          </button>
        </div>

        <!-- Body -->
        <div class="flex-1 overflow-y-auto px-6 pb-6 sm:px-8 md:px-9 sm:pb-8 pt-3 flex flex-col gap-5 custom-scrollbar">

          <!-- SALE MODE -->
          <template v-if="mode === 'sale'">
            <div class="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_252px] gap-8 items-start font-mono text-[13px]">
              <div class="min-w-0 flex flex-col gap-5">
                <div class="grid grid-cols-3 gap-2.5 lg:gap-3">
                  <div class="min-h-[136px] rounded-2xl border border-white/10 bg-white/[0.035] px-2 py-4 flex flex-col items-center justify-center text-center gap-2">
                    <Users class="w-8 h-8 text-white" />
                    <strong class="text-white text-lg font-mono leading-tight">{{ t.modal.sale.audience_value }}</strong>
                    <span class="text-[10px] leading-tight text-neutral-400 font-mono">{{ t.modal.sale.audience_label }}</span>
                  </div>
                  <div class="min-h-[136px] rounded-2xl border border-white/10 bg-white/[0.035] px-2 py-4 flex flex-col items-center justify-center text-center gap-2 min-w-0">
                    <ScanSearch class="w-8 h-8 text-white" />
                    <strong class="max-w-full text-white text-sm sm:text-base font-mono leading-tight break-words">{{ t.modal.sale.intent_value }}</strong>
                    <span class="max-w-full text-[10px] leading-tight text-neutral-400 font-mono">{{ t.modal.sale.intent_label }}</span>
                  </div>
                  <div class="min-h-[136px] rounded-2xl border border-red-500/60 bg-red-500/[0.08] px-2 py-4 flex flex-col items-center justify-center text-center gap-2">
                    <TicketCheck class="w-8 h-8 text-red-400" />
                    <strong class="text-red-400 text-lg font-mono leading-tight">{{ t.modal.sale.spots_value.replace('{count}', String(freeSlotsCount)) }}</strong>
                    <span class="text-[10px] leading-tight text-neutral-400 font-mono">{{ t.modal.sale.spots_label }}</span>
                  </div>
                </div>

                <section class="border-t border-white/10 pt-1">
                  <h3 class="text-sm font-mono font-bold text-white mt-5 mb-2">{{ t.modal.sale.how_it_works_title }}</h3>
                  <p class="text-[13px] sm:text-sm text-neutral-400 leading-relaxed">{{ t.modal.sale.how_it_works_paragraph_1 }}</p>
                  <p class="text-[13px] sm:text-sm text-neutral-400 leading-relaxed mt-3">{{ t.modal.sale.how_it_works_paragraph_2 }}</p>
                </section>

                <AddAdBidControls
                  :custom-bid="customBid"
                  :min-price="minPrice"
                  @update:custom-bid="customBid = $event"
                  @decrement="decrementBid"
                  @increment="incrementBid"
                />

                <p class="text-[11px] text-neutral-500 leading-relaxed">{{ t.modal.sale.one_time_note }}</p>
                <p v-if="checkoutError" class="text-red-400 text-xs px-1">{{ checkoutError }}</p>

                <button
                  type="button"
                  @click="startCheckout"
                  :disabled="isCreatingCheckout"
                  class="w-full group inline-flex items-center justify-center gap-2.5 bg-white text-black font-bold uppercase tracking-[0.12em] text-xs sm:text-sm py-4 rounded-xl transition-all duration-300 hover:bg-neutral-100 hover:scale-[1.01] active:scale-[0.99] shadow-xl hover:shadow-[#00D4FF]/20 disabled:opacity-50 cursor-pointer"
                >
                  <Loader2 v-if="isCreatingCheckout" class="w-4 h-4 animate-spin" />
                  <span>
                    {{ isCreatingCheckout ? t.modal.sale.generating_checkout : (isSlotAvailable ? t.modal.sale.occupy_cta : t.modal.sale.outbid_cta).replace('{price}', String(customBid)).replace('{slot}', String(selectedSlot)) }}
                  </span>
                </button>

                <div class="flex justify-center -mt-1">
                  <button type="button" @click="startAdSetupFlow(selectedSlot)" class="text-xs text-neutral-500 hover:text-neutral-300 transition-colors underline decoration-white/20 underline-offset-4 cursor-pointer">
                    {{ t.modal.sale.already_paid }}
                  </button>
                </div>

              </div>

              <aside class="border-t lg:border-t-0 lg:border-l border-white/10 pt-5 lg:pt-0 lg:pl-5 min-w-0 flex flex-col">
                <h3 class="text-sm font-mono font-bold text-white mb-1">{{ t.modal.sale.slot_label }}</h3>
                <p class="text-xs text-neutral-500 leading-relaxed mb-3">{{ t.modal.sale.slot_help }}</p>
                <div class="h-[395px] overflow-y-auto rounded-xl border border-white/10 bg-[#08080b] p-1.5 custom-scrollbar">
                  <button
                    v-for="s in allSlotsList"
                    :key="s.position"
                    type="button"
                    @click="onSelectSlot(s.position)"
                    :class="[
                      'w-full grid grid-cols-[28px_minmax(0,1fr)_auto] items-center gap-2 rounded-lg px-2 py-2.5 text-left transition-colors duration-300 cursor-pointer text-xs',
                      animatedSlot === s.position ? 'slot-selection-pulse' : '',
                      s.position === selectedSlot ? 'border border-[#00D4FF]/50 bg-[#00D4FF]/10' : 'border border-transparent hover:bg-white/[0.06]'
                    ]"
                  >
                    <span :class="['font-mono text-[11px] font-bold', s.position === 1 ? 'text-[#FFD700]' : 'text-neutral-300']">#{{ s.position }}</span>
                    <span class="min-w-0">
                      <span class="block truncate text-xs text-neutral-200">{{ s.isAvailable ? t.modal.sale.status_free : (s.ad?.name || t.modal.occupied) }}</span>
                      <span class="block text-[10px] text-neutral-500">{{ s.isAvailable ? t.modal.sale.base_price : t.modal.sale.outbid_price }}</span>
                    </span>
                    <span :class="['font-mono text-[10px] shrink-0', s.isAvailable ? 'text-emerald-400' : 'text-amber-300']">${{ s.isAvailable ? s.currentPrice : s.nextPrice }}</span>
                  </button>
                </div>
                <div :class="['mt-3 rounded-xl border border-white/10 bg-white/[0.035] px-3 py-2.5 text-[11px] font-mono transition-all duration-300', animatedSlot === selectedSlot ? 'slot-selection-pulse' : '']">
                  <strong class="block text-white">{{ t.modal.setup.slot_prefix.replace('{slot}', String(selectedSlot)) }}</strong>
                  <span class="text-emerald-400">{{ isSlotAvailable ? t.modal.sale.status_free : t.modal.sale.status_auction }} · ${{ minPrice }} USD</span>
                </div>
              </aside>
            </div>

          </template>

          <!-- SETUP MODE -->
          <template v-else>
            <AddAdSuccessState v-if="setupSuccess" :selected-slot="selectedSlot" />
            <AddAdSetupForm
              v-else
              :email="email"
              :selected-slot="selectedSlot"
              :is-validating-token="isValidatingToken"
              :is-submitting="isSubmitting"
              :is-uploading-image="isUploadingImage"
              :upload-error="uploadError"
              :error-msg="setupError"
              :form="form"
              @update:email="email = $event"
              @change-email="startAdSetupFlow(selectedSlot)"
              @upload-file="handleFileUpload"
              @submit-setup="handleSubmitSetup"
            />
          </template>

        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.25s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.backdrop-enter-active, .backdrop-leave-active { transition: opacity 0.25s ease; }
.backdrop-enter-from, .backdrop-leave-to { opacity: 0; }

.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(0,212,255,0.3); }

.slot-selection-pulse {
  animation: slot-selection-pulse 360ms ease-out;
}

@keyframes slot-selection-pulse {
  0% { transform: scale(0.985); box-shadow: 0 0 0 rgba(0, 212, 255, 0); }
  55% { transform: scale(1.015); box-shadow: 0 0 18px rgba(0, 212, 255, 0.16); }
  100% { transform: scale(1); box-shadow: 0 0 0 rgba(0, 212, 255, 0); }
}
</style>
