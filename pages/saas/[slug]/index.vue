<script setup lang="ts">
import { useRoute } from 'nuxt/app'
import SaasProfileView from '~/modules/visuals/views/SaasProfileView.vue'
import SaasProfileSkeleton from '~/modules/visuals/components/SaasProfileSkeleton.vue'
import { computed, watchEffect } from 'vue'
import { useAppSchema } from '~/composables/useAppSchema'

const route = useRoute()
const slug = computed(() => route.params.slug as string)
const { t, locale } = useI18n()

const { data: saas, error, pending } = useLazyFetch<any>(() => `/api/saas/${slug.value}`, {
  key: `saas-profile-${route.params.slug}`
})

const { defineSaasProfile } = useAppSchema()
const { checkSession } = useFounderSession()

onMounted(() => {
  checkSession()
})

watchEffect(() => {
  if (saas.value) {
    defineSaasProfile(saas.value)
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
  if (saas.value?.allTimeRevenue && saas.value.allTimeRevenue !== '—') {
    return String(saas.value.allTimeRevenue)
  }
  if (saas.value?.mrr) {
    return `$${Number(saas.value.mrr).toLocaleString()}`
  }
  return '$0'
})

const viewsDisplay = computed(() => {
  return Number(saas.value?.views || 0).toLocaleString()
})

useAppSeo({
  title: () => {
    if (!saas.value?.name) return 'Facto'
    if (locale.value === 'en') {
      return `${saas.value.name} — ${revenueDisplay.value} Billed & ${viewsDisplay.value} Visits | Facto`
    }
    return `${saas.value.name} — ${revenueDisplay.value} Facturado y ${viewsDisplay.value} Visitas | Facto`
  },
  description: () => buildDescription(saas.value),
})

const localePath = useLocalePath()

if (import.meta.server) {
  watchEffect(() => {
    defineOgImageComponent('SaasProfile', {
      name: String(saas.value?.name || 'SaaS'),
      logoUrl: String(saas.value?.logoUrl || ''),
      mrr: saas.value?.mrr ? Number(saas.value.mrr) : null,
      revenue: revenueDisplay.value,
      views: viewsDisplay.value,
      category: String(saas.value?.categories?.[0]?.name || 'Software'),
      categorySlug: String(saas.value?.categories?.[0]?.slug || 'software')
    })
  })
}
</script>

<template>
  <div>
    <SaasProfileSkeleton v-if="pending" />
    <div v-else-if="error || !saas" class="min-h-screen bg-[#030305] flex flex-col items-center justify-center gap-4">
       <span class="text-white/50 text-sm tracking-widest uppercase">{{ t('seo.saas_not_found') }}</span>
       <NuxtLink :to="localePath('/')" class="text-xs text-cyan-500 uppercase tracking-widest border border-cyan-500/30 rounded-full px-4 py-2 hover:bg-cyan-500/10 transition-colors">{{ t('seo.back_to_home') }}</NuxtLink>
    </div>
    <SaasProfileView v-else :saas="saas" />
  </div>
</template>
