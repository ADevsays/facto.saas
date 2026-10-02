<script setup lang="ts">
import { ref, computed } from 'vue'
import GlobalBreadcrumb from '~/ui/components/GlobalBreadcrumb.vue'
import SocialLinks from '~/ui/components/SocialLinks.vue'
import IncognitoIcon from '~/ui/components/IncognitoIcon.vue'
import SaasGemCard from '../components/SaasGemCard.vue'

import es from '../locales/es.json'
import en from '../locales/en.json'

const props = defineProps<{
  data?: any
  pending?: boolean
}>()

const { t } = useLanguage({ es, en })
const route = useRoute()
const slug = computed(() => route.params.slug as string)
const localePath = useLocalePath()

const { data: fetchedData, pending: localPending } = props.data 
  ? { data: ref(props.data), pending: ref(false) } 
  : await useLazyFetch<any>(() => `/api/founder/${slug.value}`)

const isPending = computed(() => {
  if (props.pending !== undefined) return props.pending
  return !props.data && localPending.value
})

const profileData = computed(() => props.data || fetchedData.value)
const founder = computed(() => profileData.value?.founder)
const startups = computed(() => profileData.value?.startups || [])
const hasPublicRevenue = computed(() => profileData.value?.hasPublicRevenue)
const totalRevenueFormatted = computed(() => profileData.value?.totalRevenueFormatted)

const fromSlug = computed(() => {
  if (route.query.from && typeof route.query.from === 'string') {
    return route.query.from
  }
  if (import.meta.client && typeof document !== 'undefined' && document.referrer) {
    try {
      const refUrl = new URL(document.referrer)
      const match = refUrl.pathname.match(/\/saas\/([^/?#]+)/)
      if (match && match[1] && match[1] !== 'pais' && match[1] !== 'categoria') {
        return match[1]
      }
    } catch {}
  }
  return undefined
})

const fromStartup = computed(() => {
  if (!fromSlug.value) return null
  return startups.value.find((s: any) => s.slug === fromSlug.value || s.id === fromSlug.value)
})

const breadcrumbItems = computed(() => {
  const items: Array<{ label: string; to?: string }> = [
    { label: 'saas', to: localePath('/saas') }
  ]

  if (fromSlug.value) {
    const startupLabel = fromStartup.value?.name || fromSlug.value.replace(/-/g, ' ')
    items.push({ label: startupLabel, to: localePath(`/saas/${fromSlug.value}`) })
  }

  items.push({ label: founder.value?.name || t.value?.founder_profile?.founder_fallback || 'Founder' })
  return items
})

useAppSeo({
  title: () => (founder.value?.name 
    ? (t.value?.founder_profile?.seo_title?.replace('{name}', founder.value.name) || `${founder.value.name} - Perfil Founder | Facto`)
    : (t.value?.founder_profile?.seo_title_fallback || 'Perfil Founder | Facto')),
  description: () => (founder.value?.bio || (t.value?.founder_profile?.seo_description?.replace('{name}', founder.value?.name || 'este founder') || 'Portafolio y startups creadas por este founder en Facto.'))
})
</script>

<template>
  <main class="min-h-screen bg-[#030305] text-white relative isolate pt-14 pb-20 px-6 flex flex-col items-center overflow-x-clip">
    <div class="absolute inset-0 z-[-1] pointer-events-none flex justify-center items-start pt-20 overflow-hidden">
      <div class="w-[80vw] h-[40vw] max-w-[800px] max-h-[400px] bg-[#00D4FF]/5 rounded-full blur-[120px] opacity-40"></div>
    </div>

    <div class="w-full max-w-5xl flex justify-start mb-8">
      <GlobalBreadcrumb :items="breadcrumbItems" />
    </div>

    <div v-if="isPending" class="w-full max-w-5xl flex flex-col gap-8 animate-pulse">
      <div class="h-48 rounded-3xl bg-white/[0.02] border border-white/5"></div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div v-for="i in 2" :key="i" class="h-40 rounded-3xl bg-white/[0.02] border border-white/5"></div>
      </div>
    </div>

    <div v-else-if="founder" class="w-full max-w-5xl flex flex-col gap-12">
      <!-- Profile Header / Bio Card -->
      <section class="rounded-3xl border border-white/10 bg-surface-elevated p-8 md:p-10 relative overflow-hidden flex flex-col md:flex-row items-center md:items-start gap-8 shadow-xl">
        <div class="w-24 h-24 md:w-28 md:h-28 rounded-full bg-white/5 border border-white/10 overflow-hidden flex items-center justify-center shrink-0 shadow-inner">
          <img 
            v-if="founder.avatarUrl" 
            :src="founder.avatarUrl" 
            :alt="founder.name" 
            class="w-full h-full object-cover"
          />
          <span v-else class="font-serif text-3xl md:text-4xl text-neutral-300 font-bold">
            {{ founder.name ? founder.name.slice(0, 1).toUpperCase() : 'F' }}
          </span>
        </div>

        <div class="flex-1 flex flex-col items-center md:items-start text-center md:text-left">
          <div class="flex items-center gap-3 mb-2">
            <span class="text-[10px] font-sans font-medium tracking-[0.2em] text-[#00D4FF] uppercase">
              {{ t.founder_profile.badge }}
            </span>
          </div>
          
          <h1 class="font-serif text-3xl md:text-4xl font-normal text-white mb-4">
            {{ founder.name }}
          </h1>

          <p v-if="founder.bio" class="font-sans text-neutral-300 text-sm md:text-base max-w-2xl font-light leading-relaxed mb-6 italic">
            "{{ founder.bio }}"
          </p>

          <SocialLinks :socials="founder.socials" />
        </div>

        <div class="flex md:flex-col items-center md:items-end justify-between w-full md:w-auto pt-6 md:pt-0 border-t md:border-t-0 border-white/5 gap-4">
          <div>
            <span class="text-[10px] font-sans font-medium tracking-[0.2em] text-[#00D4FF] uppercase block md:text-right mb-1">
              {{ t.founder_profile.total_revenue }}
            </span>
            <span class="font-serif text-2xl md:text-3xl font-normal text-white tracking-tight block md:text-right">
              <template v-if="hasPublicRevenue && totalRevenueFormatted && totalRevenueFormatted !== '—'">
                {{ totalRevenueFormatted }}
              </template>
              <IncognitoIcon v-else class="w-6 h-6 text-neutral-500 inline-block md:ml-auto" />
            </span>
          </div>
          <span class="text-xs font-sans text-neutral-400 font-light">
            {{ startups.length }} {{ startups.length === 1 ? t.founder_profile.saas_single : t.founder_profile.saas_plural }}
          </span>
        </div>
      </section>

      <!-- Portafolio de SaaS Grid -->
      <section class="flex flex-col gap-6">
        <div class="flex items-center justify-between border-b border-white/10 pb-4">
          <h2 class="font-serif text-xl md:text-2xl font-normal text-white tracking-tight">
            {{ t.founder_profile.portfolio_title }}
          </h2>
          <span class="text-xs font-sans text-neutral-400 font-light">
            {{ startups.length }} {{ t.founder_profile.in_total }}
          </span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <SaasGemCard 
            v-for="(saas, idx) in startups" 
            :key="saas.id"
            :saas="saas"
            :index="Number(idx)"
          />
        </div>
      </section>
    </div>
  </main>
</template>
