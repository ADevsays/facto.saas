<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useInvoices } from '../composables/useInvoices'
import { INVOICE_SEO_FAQS as INVOICE_SEO_FAQS_ES } from '../const/seoContent.es'
import { INVOICE_SEO_FAQS as INVOICE_SEO_FAQS_EN } from '../const/seoContent.en'
import InvoiceEditor from '../components/InvoiceEditor.vue'
import InvoiceHistory from '../components/InvoiceHistory.vue'
import InvoicePreviewModal from '../components/InvoicePreviewModal.vue'
import InvoiceSettingsModal from '../components/InvoiceSettingsModal.vue'
import MrrInput from '~/modules/input-mrr/components/MrrInput.vue'
import SeoContentSection from '../components/SeoContentSection.vue'
import GlobalBreadcrumb from '~/ui/components/GlobalBreadcrumb.vue'
import es from '../locales/es.json'
import en from '../locales/en.json'

const route = useRoute()
const router = useRouter()
const localePath = useLocalePath()
const { t, language } = useLanguage({ es, en })
const invoiceFaqs = computed(() => language.value === 'es' ? INVOICE_SEO_FAQS_ES : INVOICE_SEO_FAQS_EN)

const {
  data,
  previewInvoice,
  toastMessage,
  handleSaveInvoice,
  handleDeleteInvoice,
  handleSettingsSave,
} = useInvoices()

const showSettings = ref(false)

const isEditorMode = computed(() => !!route.query.nueva || !!route.query.edit)
const editId = computed(() => route.query.edit as string | undefined)
const isNew = computed(() => !!route.query.nueva)

const editingInvoice = computed(() => {
  if (!editId.value) return null
  return data.value.invoices.find(i => i.id === editId.value) || null
})

const goToList = () => router.push(localePath('/herramientas/generador-de-facturas'))
const goToNew = () => router.push({ query: { nueva: '1' } })
const goToEdit = (id: string) => router.push({ query: { edit: id } })

const onSave = (invoice: any) => {
  handleSaveInvoice(invoice)
  goToList()
}

const onSettingsSave = (payload: any) => {
  handleSettingsSave(payload)
  showSettings.value = false
}

useAppSeo({
  title: () => t.value.seo.title,
  description: () => t.value.seo.description,
  robots: 'index, follow, max-snippet:160, max-image-preview:large',
})

const schemaSoftware = computed(() => ({
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: t.value.schema.name,
  operatingSystem: 'All',
  applicationCategory: 'BusinessApplication',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD', availability: 'https://schema.org/InStock' },
  description: t.value.schema.description,
  creator: { '@type': 'Organization', name: 'Facto', url: 'https://www.factosaas.com' },
  url: 'https://www.factosaas.com/herramientas/generador-de-facturas',
}))

const schemaBreadcrumb = computed(() => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Inicio', item: 'https://www.factosaas.com' },
    { '@type': 'ListItem', position: 2, name: t.value.breadcrumb.tools, item: 'https://www.factosaas.com/herramientas' },
    { '@type': 'ListItem', position: 3, name: t.value.schema.name, item: 'https://www.factosaas.com/herramientas/generador-de-facturas' },
  ]
}))

const schemaFaq = computed(() => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: invoiceFaqs.value.map(faq => ({
    '@type': 'Question',
    name: faq.question,
    acceptedAnswer: { '@type': 'Answer', text: faq.answer }
  }))
}))

useHead({
  script: [
    { type: 'application/ld+json', innerHTML: () => JSON.stringify(schemaSoftware.value) },
    { type: 'application/ld+json', innerHTML: () => JSON.stringify(schemaBreadcrumb.value) },
    { type: 'application/ld+json', innerHTML: () => JSON.stringify(schemaFaq.value) }
  ]
})
</script>

<template>
  <div class="min-h-screen bg-[#030305] text-white flex flex-col items-center pt-14 relative isolate overflow-x-clip">
    <div class="absolute inset-0 pointer-events-none -z-10 flex justify-center">
      <div class="absolute top-[-10%] w-[1000px] h-[600px] bg-[#00D4FF]/[0.03] blur-[150px] rounded-full"></div>
    </div>

    <div class="w-full max-w-[1100px] px-6 z-10 relative flex flex-col items-center pb-32">

      <!-- ═══ VISTA: LISTA ═══ -->
      <template v-if="!isEditorMode">
        <!-- Breadcrumb -->
        <div class="w-full mb-4">
          <GlobalBreadcrumb :items="[{ label: t.breadcrumb.tools, to: '/herramientas' }, { label: t.breadcrumb.invoiceGenerator }]" />
        </div>

        <!-- Hero -->
        <div class="text-center mb-16 max-w-3xl mx-auto pt-4 w-full">
          <div class="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border border-white/10 bg-white/[0.04] font-sans text-[10px] font-medium tracking-[0.2em] uppercase text-white/55 mb-7">
            <span class="w-1.5 h-1.5 rounded-full bg-[#00D4FF] shadow-[0_0_8px_#00D4FF] animate-pulse"></span>
            {{ t.hero.badge }}
          </div>
          <h1 class="font-serif text-[clamp(2.8rem,7vw,5.5rem)] font-bold leading-[0.9] tracking-[-0.04em] text-white m-0 mb-6">
            {{ t.hero.title1 }} <span class="outline-text">{{ t.hero.title2 }}</span>
          </h1>
          <p class="font-sans text-[15px] font-light text-white/50 max-w-[520px] mx-auto leading-[1.7] tracking-[0.01em] mb-8">
            {{ t.hero.description }}
          </p>
          <button
            type="button"
            @click="showSettings = true"
            class="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-white/10 bg-white/[0.04] hover:bg-white/[0.07] text-[11px] font-medium uppercase tracking-[0.15em] text-white/50 hover:text-white/80 transition-all duration-200 cursor-pointer"
          >
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {{ t.hero.yourData }}
          </button>
        </div>

        <InvoiceHistory
          :invoices="data.invoices"
          :currency="data.currency"
          :hasProfile="!!data.profile.name"
          @select="inv => goToEdit(inv.id)"
          @delete="handleDeleteInvoice"
          @new="goToNew"
          @setup="showSettings = true"
        />

        <SeoContentSection />

        <div class="w-full max-w-[700px] mx-auto mt-12 mb-4 flex flex-col items-center gap-4">
          <p class="text-[10px] font-sans font-extralight tracking-[0.2em] text-white/40 uppercase text-center">{{ t.mrr.prompt }}</p>
          <MrrInput class="w-full" />
        </div>
      </template>

      <!-- ═══ VISTA: EDITOR ═══ -->
      <template v-else>
        <!-- Breadcrumb con back -->
        <div class="w-full mb-8">
          <GlobalBreadcrumb :items="[
            { label: t.breadcrumb.tools },
            { label: t.breadcrumb.invoiceGenerator, to: localePath('/herramientas/generador-de-facturas') },
            { label: isNew ? t.breadcrumb.newInvoice : t.breadcrumb.editInvoice }
          ]" />
        </div>

        <InvoiceEditor
          :invoice="editingInvoice"
          :profile="data.profile"
          :currency="data.currency"
          :taxRate="data.taxRate"
          :nextNumber="data.nextNumber"
          @save="onSave"
          @preview="(inv) => previewInvoice = inv"
          @cancel="goToList"
        />
      </template>
    </div>

    <!-- Toast -->
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="opacity-0 translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 translate-y-2"
    >
      <div
        v-if="toastMessage"
        class="fixed bottom-8 right-6 z-50 bg-[#00D4FF] text-black font-bold text-[11px] uppercase tracking-wider px-5 py-3 rounded-full shadow-[0_0_25px_rgba(0,212,255,0.6)] flex items-center gap-2"
      >
        <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
        </svg>
        {{ toastMessage }}
      </div>
    </Transition>

    <!-- Modals -->
    <InvoicePreviewModal
      v-if="previewInvoice"
      :invoice="previewInvoice"
      :profile="data.profile"
      @close="previewInvoice = null"
    />
    <InvoiceSettingsModal
      v-if="showSettings"
      :profile="data.profile"
      :currency="data.currency"
      :taxRate="data.taxRate"
      @save="onSettingsSave"
      @close="showSettings = false"
    />
  </div>
</template>

<style>
.outline-text {
  background: linear-gradient(
    120deg,
    rgba(255, 255, 255, 0) 30%,
    rgba(255, 255, 255, 0.8) 50%,
    rgba(255, 255, 255, 0) 70%
  );
  background-size: 200% auto;
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: rgba(0, 212, 255, 0.3);
  filter: drop-shadow(0 0 15px rgba(0, 212, 255, 0.4));
  animation: shine 5s ease-in-out infinite;
  display: inline-block;
}

@keyframes shine {
  0% { background-position: -100% 0; }
  100% { background-position: 100% 0; }
}
</style>
