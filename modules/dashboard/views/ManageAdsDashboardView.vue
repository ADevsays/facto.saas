<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useFounderSession } from '~/composables/useFounderSession'
import { useLanguage } from '~/composables/useLanguage'
import { useAdPreferences } from '~/composables/useAdPreferences'
import { useAddAdModal } from '~/composables/useAddAdModal'
import DashboardSidebar from '../components/DashboardSidebar.vue'
import DashboardHeader from '../components/DashboardHeader.vue'
import AdsMarqueeCard from '../components/AdsMarqueeCard.vue'
import AdsEmptyState from '../components/AdsEmptyState.vue'
import AdsVerifyEmailCard from '../components/AdsVerifyEmailCard.vue'
import EditAdModal from '~/modules/ads/components/EditAdModal.vue'
import es from '../locales/es.json'
import en from '../locales/en.json'
import type { Ad } from '~/modules/ads/types'

const route = useRoute()
const { t } = useLanguage({ es, en })
const { founder, startups, checkSession } = useFounderSession()
const { hideAds, canHideAds, setHideAds, unlockAdFree, checkPreferences } = useAdPreferences()
const { openForSetup, openBuy } = useAddAdModal()

const loading = ref(true)
const isVerifying = ref(false)
const adsList = ref<Ad[]>([])
const activeEmail = ref('')
const toastMessage = ref('')

const isEditModalOpen = ref(false)
const selectedAdToEdit = ref<Ad | null>(null)

function handleEditAd(ad: Ad) {
  selectedAdToEdit.value = ad
  isEditModalOpen.value = true
}

function handleAdUpdated(updatedAd: Ad) {
  const idx = adsList.value.findIndex(a => a.id === updatedAd.id)
  if (idx !== -1) {
    adsList.value[idx] = { ...adsList.value[idx], ...updatedAd }
  } else {
    adsList.value.unshift(updatedAd)
  }
  showToast('Anuncio actualizado correctamente.')
}

async function fetchMyAds(customEmail?: string) {
  loading.value = true
  try {
    const emailToUse = customEmail || founder.value?.email
    const params = emailToUse ? { email: emailToUse } : undefined
    const data = await $fetch<{ authenticated: boolean; email: string; ads: Ad[]; canHideAds: boolean; isAdFree: boolean; hasPaidAds: boolean }>('/api/ads/my-ads', {
      params
    })
    if (data) {
      adsList.value = data.ads || []
      activeEmail.value = data.email || ''
      if (data.canHideAds) {
        await checkPreferences(true)
      }
    }
  } catch {
    adsList.value = []
  } finally {
    loading.value = false
  }
}

async function handleVerifyAlternateEmail(emailToVerify: string) {
  isVerifying.value = true
  try {
    await fetchMyAds(emailToVerify)
    if (adsList.value.length > 0) {
      showToast(`¡Sincronizado! Se encontraron ${adsList.value.length} anuncios para ${emailToVerify}.`)
    } else {
      showToast(`No se encontraron compras activas para ${emailToVerify}.`)
    }
  } finally {
    isVerifying.value = false
  }
}

function handleToggleAds() {
  setHideAds(!hideAds.value)
  showToast(hideAds.value ? (t.value.ads?.toast_hidden || '') : (t.value.ads?.toast_visible || ''))
}

function showToast(msg: string) {
  toastMessage.value = msg
  setTimeout(() => {
    toastMessage.value = ''
  }, 4000)
}

onMounted(async () => {
  await checkSession()
  await checkPreferences()
  await fetchMyAds()

  // Handle return from ad purchase setup
  if (route.query.ad_setup === 'true') {
    const slot = route.query.slot ? Number(route.query.slot) : undefined
    const token = typeof route.query.token === 'string' ? route.query.token : undefined
    openForSetup(slot, token)

    if (typeof window !== 'undefined') {
      window.history.replaceState({}, document.title, window.location.pathname)
    }
  }

  // Handle return from ad-free purchase
  if (route.query.ad_free_success === 'true') {
    const token = typeof route.query.token === 'string' ? route.query.token : undefined
    if (token) {
      try {
        await $fetch('/api/ads/ad-free-verify', {
          method: 'POST',
          body: {
            token,
            email: founder.value?.email || activeEmail.value
          }
        })
        unlockAdFree(token)
        showToast(t.value.ads?.toast_ad_free_success || '')
      } catch {}
    }
    if (typeof window !== 'undefined') {
      window.history.replaceState({}, document.title, window.location.pathname)
    }
  }
})
</script>

<template>
  <div class="min-h-screen bg-[#030305] text-white selection:bg-cyan-500/30 flex flex-col font-sans">
    <!-- Toast Notification -->
    <Transition name="fade">
      <div
        v-if="toastMessage"
        class="fixed bottom-6 right-6 z-[999] px-4 py-3 rounded-2xl bg-surface-elevated border border-[#00D4FF]/40 text-white text-xs font-sans shadow-2xl backdrop-blur-md flex items-center gap-2.5"
      >
        <svg class="w-4 h-4 text-[#00D4FF]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
        <span>{{ toastMessage }}</span>
      </div>
    </Transition>

    <!-- Centered Content Wrapper (Constrained to max-w-7xl) -->
    <div class="w-full max-w-7xl mx-auto px-6 md:px-12 flex flex-col flex-1">
      <DashboardHeader
        :avatar-url="founder?.avatar_url"
        :founder-email="founder?.email"
        :founder-name="founder?.name"
        :show-save-button="false"
      />

      <!-- Main Workspace (Sidebar + Ads Content) -->
      <div class="flex-1 flex flex-col md:flex-row py-6 md:py-10 gap-6 md:gap-10">
        <!-- Sidebar Navigation -->
        <DashboardSidebar
          current-section="ads"
          :startups-count="startups.length"
        />

        <!-- Main Content Area -->
        <main class="flex-1 w-full max-w-5xl space-y-10">
          <!-- Top Title Row with Header Action Button -->
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div class="space-y-2">
              <h1 class="font-serif text-2xl md:text-3xl leading-tight tracking-tight text-left">
                {{ t.sections.ads_title }}
              </h1>
              <p class="font-sans text-neutral-400 font-extralight tracking-[0.08em] text-sm md:text-base text-left">
                {{ t.sections.ads_subtitle }}
              </p>
            </div>

            <!-- Header Action Button (Facto GlassButton) -->
            <button
              @click="openBuy()"
              class="shrink-0 group relative inline-flex items-center gap-2 bg-white text-black font-bold uppercase tracking-widest text-[10px] md:text-xs rounded-full px-4 py-2.5 md:px-5 md:py-2.5 transition-all duration-500 hover:scale-[1.03] shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(0,212,255,0.4)] cursor-pointer"
            >
              <span>+ {{ t.ads?.buy_slot_btn || 'Comprar un puesto' }}</span>
            </button>
          </div>

          <!-- Section: User's Purchased Ads -->
          <div class="space-y-4">
            <h2 class="font-serif text-xl md:text-2xl text-white font-medium tracking-tight">
              {{ t.ads?.your_ads_title }}
            </h2>

            <!-- Loading Skeleton -->
            <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div v-for="i in 2" :key="i" class="h-44 rounded-3xl bg-surface-elevated border border-white/5 animate-pulse"></div>
            </div>

            <!-- Ads List -->
            <div v-else-if="adsList.length > 0" class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AdsMarqueeCard
                v-for="ad in adsList"
                :key="ad.id"
                :ad="ad"
                @edit="handleEditAd"
                @reclaim="openBuy"
              />
            </div>

            <!-- Empty State -->
            <AdsEmptyState
              v-else
              @buy="openBuy()"
            />
          </div>

          <!-- Section: Whop Alternate Email Sync (Only shown if user has no ads) -->
          <AdsVerifyEmailCard
            v-if="!loading && adsList.length === 0"
            :loading="isVerifying"
            @verify="handleVerifyAlternateEmail"
          />
        </main>
      </div>
    </div>

    <!-- Edit Ad Modal -->
    <EditAdModal
      v-model="isEditModalOpen"
      :ad="selectedAdToEdit"
      @saved="handleAdUpdated"
    />
  </div>
</template>
