<script setup lang="ts">
import { ref, watch } from 'vue'
import {
  Pin,
  CircleOff,
  Target,
  RotateCcw,
  Loader2,
  X
} from 'lucide-vue-next'
import { useAddAdModal } from '../composables/useAddAdModal'
import { useAdsSlots } from '../composables/useAdsSlots'
import { useAdCheckout } from '../composables/useAdCheckout'
import { useAdSetupForm } from '../composables/useAdSetupForm'
import { useLanguage } from '~/composables/useLanguage'

import AddAdSlotDropdown from './AddAdSlotDropdown.vue'
import AddAdBidControls from './AddAdBidControls.vue'
import AddAdSetupForm from './AddAdSetupForm.vue'
import AddAdSuccessState from './AddAdSuccessState.vue'

import es from '../locales/es.json'
import en from '../locales/en.json'

const route = useRoute()
const router = useRouter()
const localePath = useLocalePath()
const { t } = useLanguage({ es, en })

const { isOpen, mode, selectedSlot, targetPrice, targetAdName, setupToken, close, openForSetup } = useAddAdModal()
const { slots, refresh: refreshSlots } = useAdsSlots()

const isSlotDropdownOpen = ref(false)

const {
  customBid,
  minPrice,
  allSlotsList,
  currentSlotData,
  isSlotAvailable,
  isCreatingCheckout,
  checkoutError,
  selectSlot,
  decrementBid,
  incrementBid,
  setPreset,
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
  step,
  email,
  isValidatingToken,
  isChecking,
  isSubmitting,
  setupSuccess,
  setupError,
  isUploadingImage,
  uploadError,
  form,
  resetSetup,
  validateToken,
  checkEmail,
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

function onSelectSlot(pos: number) {
  selectSlot(pos)
  isSlotDropdownOpen.value = false
}

function handleCheckEmail() {
  checkEmail(t.value.modal?.setup?.no_payment_found)
}

function handleSubmitSetup() {
  const qPrice = Number(route.query.price)
  const setupPrice = (qPrice && !isNaN(qPrice)) ? qPrice : undefined
  submitSetup(setupPrice)
}

watch(isOpen, async (val) => {
  if (typeof document !== 'undefined') {
    document.body.style.overflow = val ? 'hidden' : ''
  }
  if (val) {
    isSlotDropdownOpen.value = false
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
      const tokenToValidate = setupToken.value || (typeof route.query.token === 'string' ? route.query.token : null)
      if (tokenToValidate) {
        await validateToken(tokenToValidate)
      }
    }
  } else {
    resetSetup()
    targetPrice.value = null
    targetAdName.value = null
    isSlotDropdownOpen.value = false
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
        class="relative w-full max-w-[490px] bg-[#0c0c10] border border-white/10 rounded-3xl overflow-hidden shadow-[0_30px_100px_rgba(0,0,0,0.85)] flex flex-col max-h-[92vh] pointer-events-auto"
        @click="isSlotDropdownOpen = false"
      >
        <!-- Header -->
        <div class="px-6 pt-6 pb-2 sm:px-8 sm:pt-7 flex items-start justify-between">
          <div class="flex flex-col gap-1 pr-3 min-w-0">
            <h2 class="font-serif text-xl sm:text-2xl md:text-[25px] text-white tracking-tight leading-tight whitespace-nowrap truncate">
              {{ mode === 'setup' ? t.modal.setup.title : t.modal.sale.title }}
            </h2>
            <p class="text-[10px] font-sans font-bold text-[#00D4FF] tracking-[0.15em] uppercase">
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
        <div class="flex-1 overflow-y-auto px-6 pb-6 sm:px-8 sm:pb-8 pt-3 flex flex-col gap-5 custom-scrollbar">

          <!-- SALE MODE -->
          <template v-if="mode === 'sale'">
            <!-- 3 Features List -->
            <div class="flex flex-col gap-2.5">
              <div class="flex items-center gap-3">
                <div class="w-7 h-7 rounded-lg bg-[#00D4FF]/10 text-[#00D4FF] flex items-center justify-center shrink-0 border border-[#00D4FF]/20">
                  <Pin class="w-3.5 h-3.5" />
                </div>
                <p class="text-xs sm:text-[13px] text-neutral-300 leading-snug">
                  <strong class="text-white font-medium">{{ t.modal.sale.benefit_1_title }}</strong> · {{ t.modal.sale.benefit_1_desc }}
                </p>
              </div>

              <div class="flex items-center gap-3">
                <div class="w-7 h-7 rounded-lg bg-[#00D4FF]/10 text-[#00D4FF] flex items-center justify-center shrink-0 border border-[#00D4FF]/20">
                  <CircleOff class="w-3.5 h-3.5" />
                </div>
                <p class="text-xs sm:text-[13px] text-neutral-300 leading-snug">
                  <strong class="text-white font-medium">{{ t.modal.sale.benefit_2_title }}</strong> · {{ t.modal.sale.benefit_2_desc }}
                </p>
              </div>

              <div class="flex items-center gap-3">
                <div class="w-7 h-7 rounded-lg bg-[#00D4FF]/10 text-[#00D4FF] flex items-center justify-center shrink-0 border border-[#00D4FF]/20">
                  <Target class="w-3.5 h-3.5" />
                </div>
                <p class="text-xs sm:text-[13px] text-neutral-300 leading-snug">
                  <strong class="text-white font-medium">{{ t.modal.sale.benefit_3_title }}</strong> · {{ t.modal.sale.benefit_3_desc }}
                </p>
              </div>
            </div>

            <!-- Slot Selection Dropdown -->
            <AddAdSlotDropdown
              :selected-slot="selectedSlot"
              :all-slots-list="allSlotsList"
              :is-slot-available="isSlotAvailable"
              :min-price="minPrice"
              :target-ad-name="targetAdName"
              :current-slot-data="currentSlotData"
              :is-open="isSlotDropdownOpen"
              @select-slot="onSelectSlot"
              @toggle="isSlotDropdownOpen = !isSlotDropdownOpen"
            />

            <!-- Custom Bid Controls -->
            <AddAdBidControls
              :custom-bid="customBid"
              :min-price="minPrice"
              @update:custom-bid="customBid = $event"
              @decrement="decrementBid"
              @increment="incrementBid"
              @preset="setPreset"
            />

            <!-- Guarantee Note -->
            <div class="flex items-start gap-2.5 py-0.5 text-xs text-neutral-400 leading-relaxed">
              <RotateCcw class="w-4 h-4 text-[#00D4FF] shrink-0 mt-0.5" />
              <span>
                <strong class="text-neutral-200">{{ t.modal.sale.guarantee_strong }}</strong> {{ t.modal.sale.guarantee_text }}
              </span>
            </div>

            <p v-if="checkoutError" class="text-red-400 text-xs px-1">{{ checkoutError }}</p>

            <!-- Main CTA Button -->
            <button
              type="button"
              @click="startCheckout"
              :disabled="isCreatingCheckout"
              class="w-full group inline-flex items-center justify-center gap-2.5 bg-white text-black font-bold uppercase tracking-[0.12em] text-xs sm:text-sm py-4 rounded-xl transition-all duration-300 hover:bg-neutral-100 hover:scale-[1.01] active:scale-[0.99] shadow-xl hover:shadow-[#00D4FF]/20 disabled:opacity-50 cursor-pointer"
            >
              <Loader2 v-if="isCreatingCheckout" class="w-4 h-4 animate-spin" />
              <span>
                {{ isCreatingCheckout ? t.modal.sale.generating_checkout : t.modal.sale.bid_cta.replace('{price}', String(customBid)).replace('{slot}', String(selectedSlot)) }}
              </span>
            </button>

            <!-- Bottom Setup Link -->
            <div class="flex justify-center -mt-1">
              <button
                type="button"
                @click="openForSetup(selectedSlot)"
                class="text-xs text-neutral-500 hover:text-neutral-300 transition-colors underline decoration-white/20 underline-offset-4 cursor-pointer"
              >
                {{ t.modal.sale.already_paid }}
              </button>
            </div>
          </template>

          <!-- SETUP MODE -->
          <template v-else>
            <AddAdSuccessState v-if="setupSuccess" :selected-slot="selectedSlot" />
            <AddAdSetupForm
              v-else
              :step="step"
              :email="email"
              :selected-slot="selectedSlot"
              :is-validating-token="isValidatingToken"
              :is-checking="isChecking"
              :is-submitting="isSubmitting"
              :is-uploading-image="isUploadingImage"
              :upload-error="uploadError"
              :error-msg="setupError"
              :form="form"
              @update:email="email = $event"
              @check-email="handleCheckEmail"
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
</style>
