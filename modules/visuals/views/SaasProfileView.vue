<script setup lang="ts">
import { ref } from 'vue'
import { useAddSaasModal } from '~/composables/useAddSaasModal'
import SaasBreadcrumb from '../components/SaasBreadcrumb.vue'
import SaasHeaderSection from '../sections/SaasHeaderSection.vue'
import SaasMetricsSection from '../sections/SaasMetricsSection.vue'
import SaasRevenueChart from '../components/SaasRevenueChart.vue'
import InputMrrView from '~/modules/input-mrr/views/InputMrrView.vue'
import MoreStartupsSection from '../sections/MoreStartupsSection.vue'
import ClaimFounderModal from '../components/ClaimFounderModal.vue'
import { ShieldCheck } from 'lucide-vue-next'

interface Props {
  saas: {
    id: string
    name: string | null
    logoUrl: string | null
    websiteUrl: string | null
    description: string | null
    mrr: number | null
    currency: string
    founderName: string | null
    hasFounderEmail?: boolean
    publishedAt: string
    views: number
    allTimeRevenue?: string
    country?: string
    countryFlag?: string
    history?: any
    categories?: { name: string; slug: string }[]
    provider?: string
    founderSocials?: { twitterUrl?: string; linkedinUrl?: string; instagramUrl?: string } | null
    lastSyncedAt?: number | null
  }
}

const props = defineProps<Props>()
const route = useRoute()
const { open: openSaasModal } = useAddSaasModal()

const showClaimModal = useState('claim-founder-modal-open', () => false)
const showVerifyModal = ref(false)
const verifyEmail = ref('')
const verifyError = ref('')
const verifying = ref(false)

function handleClaimFounder() {
  if (props.saas.hasFounderEmail) {
    showClaimModal.value = true
  }
}

function handleClaimClose() {
  showClaimModal.value = false
}

function handleClaimed(founder: { name: string; countrySlug: string }) {
  showClaimModal.value = false
  refreshNuxtData()
}

function handleEditStartup(saasData: any) {
  showClaimModal.value = false
  openSaasModal({
    id: props.saas.id,
    name: props.saas.name,
    websiteUrl: props.saas.websiteUrl,
    founderName: props.saas.founderName,
    categorySlugs: props.saas.categories?.map(c => c.slug) || [],
    logoUrl: props.saas.logoUrl,
    startupType: props.saas.description,
    ...saasData
  }, true, true) // isEditMode = true, fromClaim = true
}

async function handleClaim() {
  showVerifyModal.value = true
  verifyEmail.value = ''
  verifyError.value = ''
}

async function submitVerify() {
  if (!verifyEmail.value.trim()) return
  verifying.value = true
  verifyError.value = ''

  try {
    const res = await $fetch<any>('/api/saas/verify-owner', {
      method: 'POST',
      body: {
        slug: route.params.slug,
        email: verifyEmail.value.trim()
      }
    })

    if (res.verified && res.saasData) {
      showVerifyModal.value = false
      openSaasModal(res.saasData)
    } else {
      verifyError.value = res.message || 'El email no coincide.'
    }
  } catch (e: any) {
    verifyError.value = e.data?.message || 'Error al verificar. Inténtalo de nuevo.'
  } finally {
    verifying.value = false
  }
}
</script>

<template>
  <main class="min-h-screen bg-[#030305] text-white overflow-x-clip relative isolate flex flex-col items-center pt-14 pb-20 px-6">
    <div class="absolute inset-0 z-[-1] pointer-events-none flex items-center justify-center">
      <div class="w-[80vw] h-[80vw] max-w-[800px] max-h-[800px] bg-[#00D4FF]/5 rounded-full blur-[120px] opacity-50"></div>
    </div>

    <SaasBreadcrumb :name="saas.name" />
    <SaasHeaderSection :saas="saas" />
    <SaasMetricsSection :saas="saas" @claim-founder="handleClaimFounder" />
    <SaasRevenueChart :mrr="saas.mrr" :currency="saas.currency" :history="saas.history" :provider="saas.provider" :last-synced-at="saas.lastSyncedAt" :founder-name="saas.founderName" @claim="handleClaim" @claim-founder="handleClaimFounder" />
    <MoreStartupsSection :current-saas-id="saas.id" />

    <div class="w-full max-w-5xl mx-auto mt-16 mb-8 relative z-10">
      <div class="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
    </div>

    <div class="w-full max-w-5xl mx-auto mt-16 mb-8 relative z-10">
      <InputMrrView/>
    </div>

    <!-- Claim Founder Modal -->
    <ClaimFounderModal
      :saas-id="saas.id"
      :saas-name="saas.name"
      :current-founder-name="saas.founderName"
      @close="handleClaimClose"
      @claimed="handleClaimed"
      @edit-startup="handleEditStartup"
    />

    <!-- Legacy Verify Owner Mini-Modal -->
    <Transition name="backdrop">
      <div v-if="showVerifyModal" class="fixed inset-0 z-[90] bg-black/80 backdrop-blur-md" @click="showVerifyModal = false" />
    </Transition>

    <Transition name="fade">
      <div v-if="showVerifyModal" class="fixed inset-0 z-[100] flex items-center justify-center p-4 pointer-events-none">
        <div class="relative w-full max-w-sm bg-[#0c0c10] border border-white/10 rounded-2xl p-7 pointer-events-auto shadow-[0_30px_100px_rgba(0,0,0,0.8)]">
          <button @click="showVerifyModal = false" class="absolute top-4 right-4 text-neutral-500 hover:text-white transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>

          <div class="flex items-center gap-3 mb-5">
            <div class="w-10 h-10 rounded-full bg-[#00D4FF]/10 border border-[#00D4FF]/20 flex items-center justify-center">
              <ShieldCheck class="w-5 h-5 text-[#00D4FF]" />
            </div>
            <div>
              <h3 class="font-serif text-lg text-white tracking-tight">Verifica tu identidad</h3>
              <p class="text-[10px] font-sans font-light text-neutral-500 tracking-wide">Ingresa el email privado del founder</p>
            </div>
          </div>

          <div class="flex flex-col gap-3">
            <input
              v-model="verifyEmail"
              type="email"
              placeholder="founder@startup.com"
              class="w-full bg-white/[0.07] border border-white/20 rounded-xl px-4 py-3.5 text-white text-sm font-sans font-light placeholder:text-neutral-500 focus:outline-none focus:border-[#00D4FF]/70 transition-all duration-300"
              @keydown.enter="submitVerify"
            />

            <p v-if="verifyError" class="text-xs text-red-400 font-sans font-light">{{ verifyError }}</p>

            <button
              @click="submitVerify"
              :disabled="verifying || !verifyEmail.trim()"
              class="w-full bg-white text-black font-bold uppercase tracking-widest text-[10px] px-6 py-3.5 rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-transform disabled:opacity-50 disabled:hover:scale-100"
            >
              {{ verifying ? 'Verificando...' : 'Verificar' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </main>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.backdrop-leave-active { transition: opacity 0.3s ease; }
.backdrop-leave-to { opacity: 0; }
</style>
