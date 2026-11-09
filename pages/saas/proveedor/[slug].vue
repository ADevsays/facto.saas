<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'nuxt/app'
import { useSaasViewMeta } from '~/composables/useSaasViewMeta'
import SaasListView from '~/modules/visuals/views/SaasListView.vue'

defineI18nRoute({
  paths: {
    es: '/saas/proveedor/[slug]',
    en: '/saas/provider/[slug]'
  }
})

const route = useRoute()
const slug = computed(() => String(route.params.slug || '').toLowerCase())
const supportedProviders = new Set(['stripe', 'mercadopago', 'whop', 'conekta', 'epayco', 'polar', 'dodo', 'paddle', 'revenuecat'])
if (!supportedProviders.has(slug.value)) {
  throw createError({ statusCode: 404, statusMessage: 'Payment provider not found' })
}

const { locale } = useI18n()
const { getProviderMeta } = useSaasViewMeta()
const providerMeta = computed(() => getProviderMeta(slug.value, locale.value))

useAppSeo({
  title: () => providerMeta.value.seoTitle,
  description: () => providerMeta.value.seoDescription
})
</script>

<template>
  <SaasListView />
</template>
