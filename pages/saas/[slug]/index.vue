<script setup lang="ts">
import { useRoute } from 'nuxt/app'
import SaasProfileView from '~/modules/visuals/views/SaasProfileView.vue'
import SaasProfileSkeleton from '~/modules/visuals/components/SaasProfileSkeleton.vue'
import { computed, watchEffect } from 'vue'
import { useAppSchema } from '~/composables/useAppSchema'

const route = useRoute()
const slug = computed(() => route.params.slug as string)
const { t, locale } = useI18n()

definePageMeta({ pageTransition: false })

// Keep one lazy request as the source for SSR, hydration and SEO. This preserves
// the immediate skeleton during navigation without executing a second server
// request solely for metadata.
const asyncData = await useLazyFetch<any>(() => `/api/saas/${slug.value}`, {
  key: () => `saas-profile-${slug.value}`,
  server: true,
  getCachedData: (key, nuxtApp) => nuxtApp.payload.data[key] ?? nuxtApp.static.data[key]
})
const { data: saas, error } = asyncData

// useLazyFetch can retain the previous result while its reactive key changes.
// Never render that old profile under the new route: it hides the skeleton and
// makes the transition look broken until the new request resolves.
const profileSaas = computed(() => {
  return saas.value?.slug === slug.value ? saas.value : null
})

const saasForSeo = computed(() => profileSaas.value)


const { defineSaasProfile } = useAppSchema()
const { checkSession } = useFounderSession()

onMounted(() => {
  checkSession()
})

watchEffect(() => {
  if (profileSaas.value) {
    defineSaasProfile(profileSaas.value)
  }
})

function buildDescription(s: any): string {
  if (!s) return t('seo.saas_slug_desc_default')
  const isEn = locale.value === 'en'
  const name = s.name || (isEn ? 'this SaaS' : 'este SaaS')
  const rev = s.allTimeRevenue && s.allTimeRevenue !== '—'
    ? s.allTimeRevenue
    : (s.mrr ? (isEn ? `$${Number(s.mrr).toLocaleString()}/mo` : `$${Number(s.mrr).toLocaleString()}/mes`) : '$0')
  const visits = Number(s.views || 0).toLocaleString()
  if (isEn) {
    return `${name} on Facto: ${rev} billed and ${visits} real visits. Metrics and leaderboard publicly verified.`
  }
  return `${name} en Facto: ${rev} facturado y ${visits} visitas reales. Métricas y ranking verificados públicamente.`
}

const revenueDisplay = computed(() => {
  if (saasForSeo.value?.allTimeRevenue && saasForSeo.value.allTimeRevenue !== '—') {
    return String(saasForSeo.value.allTimeRevenue)
  }
  if (saasForSeo.value?.mrr) {
    return `$${Number(saasForSeo.value.mrr).toLocaleString()}`
  }
  return '$0'
})

const viewsDisplay = computed(() => {
  return Number(saasForSeo.value?.views || 0).toLocaleString()
})

useAppSeo({
  title: () => {
    if (!saasForSeo.value?.name) return 'Facto'
    if (locale.value === 'en') {
      return `${saasForSeo.value.name} — ${revenueDisplay.value} Billed & ${viewsDisplay.value} Visits | Facto`
    }
    return `${saasForSeo.value.name} — ${revenueDisplay.value} Facturado y ${viewsDisplay.value} Visitas | Facto`
  },
  description: () => buildDescription(saasForSeo.value),
  customOgImage: true,
})

useHead(() => {
  const logo = saasForSeo.value?.logoUrl
  if (!logo) return {}
  return {
    link: [
      {
        rel: 'preload',
        as: 'image',
        href: logo,
        fetchpriority: 'high'
      }
    ]
  }
})

const localePath = useLocalePath()

if (import.meta.server && profileSaas.value) {
  const serverSaas = profileSaas.value
  defineOgImageComponent('SaasProfile', {
    name: String(serverSaas.name || 'SaaS'),
    logoUrl: String(serverSaas.logoUrl || ''),
    revenue: String(revenueDisplay.value),
    views: String(viewsDisplay.value),
    category: String(serverSaas.categories?.[0]?.name || 'Software'),
    categorySlug: String(serverSaas.categories?.[0]?.slug || 'software')
  })
}
</script>

<template>
  <div class="profile-stage">
    <Transition name="profile-reveal">
      <SaasProfileSkeleton v-if="!profileSaas && !error" key="skeleton" />
      <div v-else-if="error" key="error" class="min-h-screen bg-[#030305] flex flex-col items-center justify-center gap-4">
         <span class="text-white/50 text-sm tracking-widest uppercase">{{ t('seo.saas_not_found') }}</span>
         <NuxtLink :to="localePath('/')" class="text-xs text-cyan-500 uppercase tracking-widest border border-cyan-500/30 rounded-full px-4 py-2 hover:bg-cyan-500/10 transition-colors">{{ t('seo.back_to_home') }}</NuxtLink>
      </div>
      <SaasProfileView v-else-if="profileSaas" :key="slug" :saas="profileSaas" />
    </Transition>
  </div>
</template>

<style scoped>
.profile-stage {
  position: relative;
  isolation: isolate;
}

.profile-reveal-enter-active {
  transition: opacity 420ms cubic-bezier(0.16, 1, 0.3, 1), transform 420ms cubic-bezier(0.16, 1, 0.3, 1);
}

.profile-reveal-leave-active {
  position: absolute;
  inset: 0;
  z-index: 1;
  width: 100%;
  pointer-events: none;
  transition: opacity 320ms cubic-bezier(0.16, 1, 0.3, 1), transform 320ms cubic-bezier(0.16, 1, 0.3, 1);
}

.profile-reveal-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.profile-reveal-leave-to {
  opacity: 0;
  transform: scale(0.992);
}

@media (prefers-reduced-motion: reduce) {
  .profile-reveal-enter-active,
  .profile-reveal-leave-active {
    transition: none;
  }
}
</style>
