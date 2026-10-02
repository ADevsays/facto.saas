<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAddSaasModal } from '~/composables/useAddSaasModal'
import SaasBreadcrumb from '../components/SaasBreadcrumb.vue'
import SaasHeaderSection from '../sections/SaasHeaderSection.vue'
import SaasMetricsSection from '../sections/SaasMetricsSection.vue'
import SaasRevenueChart from '../components/SaasRevenueChart.vue'
import MoreStartupsSection from '../sections/MoreStartupsSection.vue'
import ClaimFounderModal from '../components/ClaimFounderModal.vue'
import InputMrrView from '../../input-mrr/views/InputMrrView.vue'
import BentoFeaturesSection from '../components/BentoFeaturesSection.vue'
import { useFounderSession } from '~/composables/useFounderSession'

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
    founderAvatar?: string | null
    founderBio?: string | null
    founderEmail?: string | null
    hasFounderEmail?: boolean
    publishedAt: string
    views: number
    allTimeRevenue?: string
    country?: string
    countrySlug?: string
    countryFlag?: string
    history?: any
    categories?: { name: string; slug: string }[]
    provider?: string
    founderSocials?: { twitterUrl?: string; linkedinUrl?: string; instagramUrl?: string } | null
    lastSyncedAt?: number | null
    valueProposition?: string | null
    problemSolved?: string | null
    techStack?: string[]
    acquisitionChannels?: string[]
    factoMessage?: string | null
    faq?: { question: string; answer: string }[]
    githubRepo?: string | null
  }
}

const props = defineProps<Props>()
const route = useRoute()
const router = useRouter()
const localePath = useLocalePath()
const { open: openSaasModal } = useAddSaasModal()
const { isOwnerOf, checkSession, isAuthenticated, startups } = useFounderSession()

const showClaimModal = useState('claim-founder-modal-open', () => false)
const claimIntent = ref<'founder' | 'mrr'>('founder')
const verifiedEmail = ref<string | null>(null)

const isVerifiedOwner = computed(() => {
  const currentSlug = (props.saas as any)?.slug || (route.params.slug as string)
  if (isOwnerOf(props.saas.founderEmail, props.saas.id)) return true
  if (currentSlug && isOwnerOf(props.saas.founderEmail, currentSlug)) return true
  if (isAuthenticated.value && startups.value.some(s => s.id === props.saas.id || (currentSlug && s.slug === currentSlug))) return true
  if (import.meta.client && verifiedEmail.value) return true
  return false
})

onMounted(async () => {
  await checkSession()
  if (isVerifiedOwner.value) return

  const stored = localStorage.getItem(`facto_founder_verified_${props.saas.id}`)
  if (stored) {
    try {
      const data = JSON.parse(stored)
      if (data.email && data.expires > Date.now()) {
        verifiedEmail.value = data.email
      } else {
        localStorage.removeItem(`facto_founder_verified_${props.saas.id}`)
      }
    } catch {}
  }
})

async function handleClaimFounder() {
  const slug = (route.params.slug as string) || (props.saas as any)?.slug
  if (!isAuthenticated.value) {
    await checkSession()
  }
  if (isVerifiedOwner.value || (isAuthenticated.value && startups.value.some(s => s.id === props.saas.id || s.slug === slug))) {
    router.push(localePath(`/dashboard/saas/${slug}`))
    return
  }
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
  const slug = (route.params.slug as string) || (props.saas as any)?.slug
  router.push(localePath(`/dashboard/saas/${slug}#mrr`))
}

function handleEditStartup(saasData: any) {
  showClaimModal.value = false
  const slug = (route.params.slug as string) || (props.saas as any)?.slug
  router.push(localePath(`/dashboard/saas/${slug}#mrr`))
}

async function handleClaim() {
  const slug = (route.params.slug as string) || (props.saas as any)?.slug
  if (!isAuthenticated.value) {
    await checkSession()
  }
  if (isVerifiedOwner.value || (isAuthenticated.value && startups.value.some(s => s.id === props.saas.id || s.slug === slug))) {
    router.push(localePath(`/dashboard/saas/${slug}#mrr`))
    return
  }
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
    <SaasHeaderSection :saas="saas" :is-verified-owner="isVerifiedOwner" @edit="handleClaimFounder" />
    <SaasMetricsSection :saas="saas" :is-verified-owner="isVerifiedOwner" @claim-founder="handleClaimFounder" />
    <SaasRevenueChart :mrr="saas.mrr" :currency="saas.currency" :history="saas.history" :provider="saas.provider" :last-synced-at="saas.lastSyncedAt" :founder-name="saas.founderName" :is-verified-owner="isVerifiedOwner" :views="saas.views" @claim="handleClaim" @claim-founder="handleClaimFounder" />
    
    <!-- Bento Features Section -->
    <BentoFeaturesSection :saas="saas" />

    <MoreStartupsSection :current-saas-id="saas.id" />

    <div class="w-full max-w-5xl mx-auto mt-4 relative z-10">
      <div class="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
    </div>

    <!-- Add MRR Component -->
    <div class="w-full max-w-5xl mx-auto mt-8 -mb-8 relative z-10">
      <InputMrrView />
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
