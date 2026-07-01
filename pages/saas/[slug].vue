<script setup lang="ts">
import { useRoute } from 'nuxt/app'
import SaasProfileView from '~/modules/visuals/views/SaasProfileView.vue'
import SaasProfileSkeleton from '~/modules/visuals/components/SaasProfileSkeleton.vue'
import { computed } from 'vue'

import { useAppSchema } from '~/composables/useAppSchema'

const route = useRoute()
const slug = route.params.slug as string

const { data: saas, error, pending } = await useFetch<any>(`/api/saas/${slug}`, {
  lazy: import.meta.client
})

const { defineSaasProfile } = useAppSchema()
watchEffect(() => {
  if (saas.value) {
    defineSaasProfile(saas.value)
  }
})

useSeoMeta({
  title: () => saas.value?.name ? `${saas.value.name} - MRR, Ingresos y Análisis | Facto` : 'SaaS Profile | Facto',
  description: () => {
    if (!saas.value) return 'Descubre los ingresos, historial financiero y métricas clave de este SaaS verificado en Facto.'
    const name = saas.value.name || 'este SaaS'
    const category = saas.value.categories?.[0]?.name || 'Software'
    return saas.value.description || `Descubre cuánto gana ${name}, su MRR exacto y métricas clave. El análisis completo de esta startup de ${category} verificada en Facto.`
  }
})

if (import.meta.server) {
  defineOgImageComponent('SaasProfile', {
    name: String(saas.value?.name || 'SaaS'),
    logoUrl: String(saas.value?.logoUrl || ''),
    mrr: Number(saas.value?.mrr || 0),
    category: String(saas.value?.categories?.[0]?.name || 'SaaS'),
    categorySlug: String(saas.value?.categories?.[0]?.slug || '')
  })
}
</script>

<template>
  <div>
    <SaasProfileSkeleton v-if="pending" />
    <div v-else-if="error || !saas" class="min-h-screen bg-[#030305] flex flex-col items-center justify-center gap-4">
       <span class="text-white/50 text-sm tracking-widest uppercase">SaaS no encontrado</span>
       <NuxtLink to="/" class="text-xs text-cyan-500 uppercase tracking-widest border border-cyan-500/30 rounded-full px-4 py-2 hover:bg-cyan-500/10 transition-colors">Volver al inicio</NuxtLink>
    </div>
    <SaasProfileView v-else :saas="saas" />
  </div>
</template>
