<script setup lang="ts">
import { ref } from 'vue'
import { useAddSaasModal } from '~/composables/useAddSaasModal'
import SaasBreadcrumb from '../components/SaasBreadcrumb.vue'
import SaasHeaderSection from '../sections/SaasHeaderSection.vue'
import SaasMetricsSection from '../sections/SaasMetricsSection.vue'
import SaasRevenueChart from '../components/SaasRevenueChart.vue'
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
const claimIntent = ref<'founder' | 'mrr'>('founder')

function handleClaimFounder() {
  if (props.saas.hasFounderEmail) {
    claimIntent.value = 'founder'
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
  if (props.saas.hasFounderEmail) {
    claimIntent.value = 'mrr'
    showClaimModal.value = true
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

    <!-- Claim Founder & MRR Modal -->
    <ClaimFounderModal
      :saas-id="saas.id"
      :saas-name="saas.name"
      :current-founder-name="saas.founderName"
      :founder-email="saas.founderEmail ?? null"
      :intent="claimIntent"
      @close="handleClaimClose"
      @claimed="handleClaimed"
      @edit-startup="handleEditStartup"
    />
  </main>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.backdrop-leave-active { transition: opacity 0.3s ease; }
.backdrop-leave-to { opacity: 0; }
</style>
