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
  getCachedData: (key, nuxtApp) => nuxtApp.payload.data[key] ?? nuxtApp.static.data[key],
  onResponseError: ({ response }) => {
    if (import.meta.server) setResponseStatus(useRequestEvent()!, response.status)
  }
})
const { data: saas, error } = asyncData

// `useLazyFetch` may populate its error after setup has returned. Track it
// reactively during SSR so the friendly error screen also has an honest HTTP
// status, without turning navigation into a blocking fetch.
watchEffect(() => {
  if (!import.meta.server || !error.value) return
  const status = Number((error.value as any).statusCode || (error.value as any).status || 404)
  setResponseStatus(useRequestEvent()!, status >= 400 ? status : 404)
})

// useLazyFetch can retain the previous result while its reactive key changes.
// Never render that old profile under the new route: it hides the skeleton and
// makes the transition look broken until the new request resolves.
const profileSaas = computed(() => {
  return saas.value?.slug === slug.value ? saas.value : null
})

const saasForSeo = computed(() => profileSaas.value)


const { defineSaasProfile } = useAppSchema()

watchEffect(() => {
  if (profileSaas.value) {
    defineSaasProfile(profileSaas.value)
  }
})

const revenueDisplay = computed(() => {
  if (saasForSeo.value?.allTimeRevenue) return String(saasForSeo.value.allTimeRevenue)
  if (saasForSeo.value?.mrr) return `$${Number(saasForSeo.value.mrr).toLocaleString()}`
  return '$0'
})

const viewsDisplay = computed(() => Number(saasForSeo.value?.views || 0).toLocaleString())

const categoryForSeo = computed(() => saasForSeo.value?.category || (locale.value === 'en' ? 'SaaS' : 'SaaS'))
const countryForSeo = computed(() => {
  const country = saasForSeo.value?.country
  return country && country !== 'Global' ? country : null
})
const currentYear = new Date().getFullYear()

useAppSeo({
  title: () => {
    if (!saasForSeo.value?.name) return 'Facto'
    const name = saasForSeo.value.name
    if (locale.value === 'en') {
      return countryForSeo.value
        ? `${name} — ${categoryForSeo.value} Software for ${countryForSeo.value} ${currentYear} | Facto`
        : `${name} — ${categoryForSeo.value} Software ${currentYear} | Facto`
    }
    return countryForSeo.value
      ? `${name} — Software de ${categoryForSeo.value} para ${countryForSeo.value} ${currentYear} | Facto`
      : `${name} — Software de ${categoryForSeo.value} ${currentYear} | Facto`
  },
  description: () => {
    const name = saasForSeo.value?.name || (locale.value === 'en' ? 'this SaaS' : 'este SaaS')
    return locale.value === 'en'
      ? `Learn what ${name} does, a ${categoryForSeo.value} SaaS. Explore its profile, founder, country and public metrics.`
      : `Descubre qué hace ${name}, un SaaS de ${categoryForSeo.value}. Conoce su perfil, fundador, país y métricas públicas.`
  },
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

function resolveOgLogoUrl(logoUrl?: string | null, websiteUrl?: string | null): string {
  const raw = String(logoUrl || '').trim()
  const clean = raw.toLowerCase().split('?')[0]
  const isGeneratedFallback = clean.endsWith('.ico') || raw.includes('google.com/s2/favicons') || raw.includes('googleusercontent.com/s2/favicons') || raw.includes('icons.duckduckgo.com/ip3/') || raw.includes('icon.horse/icon/')

  if (!isGeneratedFallback && raw) return raw

  if (websiteUrl) {
    try {
      const hostname = new URL(websiteUrl.startsWith('http') ? websiteUrl : `https://${websiteUrl}`).hostname
      return `https://t0.gstatic.com/faviconV2?client=SOCIAL&drop_404_icon=true&type=FAVICON&size=128&fallback_opts=TYPE,SIZE&url=https://${hostname}`
    } catch {
      // Keep the OG safe when a legacy website URL is malformed.
    }
  }

  return raw
}

if (import.meta.server && profileSaas.value) {
  const serverSaas = profileSaas.value
  const isMilestoneView = route.query.h === 'mile' && serverSaas.latestMilestone

  if (isMilestoneView) {
    defineOgImageComponent('VisitsMilestone', {
      name: String(serverSaas.name || 'SaaS'),
      logoUrl: resolveOgLogoUrl(serverSaas.logoUrl, serverSaas.websiteUrl),
      milestone: serverSaas.latestMilestone,
      revenue: String(revenueDisplay.value),
      views: String(viewsDisplay.value),
      category: String(serverSaas.categories?.[0]?.name || 'Software'),
      categorySlug: String(serverSaas.categories?.[0]?.slug || 'software')
    })
  } else {
    defineOgImageComponent('SaasProfile', {
      name: String(serverSaas.name || 'SaaS'),
      logoUrl: resolveOgLogoUrl(serverSaas.logoUrl, serverSaas.websiteUrl),
      revenue: String(revenueDisplay.value),
      views: String(viewsDisplay.value),
      category: String(serverSaas.categories?.[0]?.name || 'Software'),
      categorySlug: String(serverSaas.categories?.[0]?.slug || 'software')
    })
  }
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
