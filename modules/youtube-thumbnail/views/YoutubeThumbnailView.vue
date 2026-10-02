<script setup lang="ts">
import { ref, computed } from 'vue'
import GlobalBreadcrumb from '~/ui/components/GlobalBreadcrumb.vue'
import ThumbnailDownloader from '../components/ThumbnailDownloader.vue'
import ThumbnailCard from '../components/ThumbnailCard.vue'
import ThumbnailPreviewModal from '../components/ThumbnailPreviewModal.vue'
import SeoContentSection from '../components/SeoContentSection.vue'
import MrrInput from '~/modules/input-mrr/components/MrrInput.vue'
import { useYoutubeThumbnail } from '../composables/useYoutubeThumbnail'
import { YOUTUBE_THUMBNAIL_FAQS as YOUTUBE_THUMBNAIL_FAQS_ES } from '../const/seoContent.es'
import { YOUTUBE_THUMBNAIL_FAQS as YOUTUBE_THUMBNAIL_FAQS_EN } from '../const/seoContent.en'
import type { ThumbnailOption } from '../types'
import es from '../locales/es.json'
import en from '../locales/en.json'

const { t, language } = useLanguage({ es, en })
const ytFaqs = computed(() => language.value === 'es' ? YOUTUBE_THUMBNAIL_FAQS_ES : YOUTUBE_THUMBNAIL_FAQS_EN)

const {
  inputUrl,
  errorMsg,
  currentVideo,
  recentSearches,
  hasResult,
  isDownloading,
  copiedStatus,
  processUrl,
  copyToClipboard,
  downloadImage,
  reset,
} = useYoutubeThumbnail()

const activePreviewUrl = ref<string | null>(null)
const showModal = ref(false)

const openPreview = (url: string) => {
  activePreviewUrl.value = url
  showModal.value = true
}

const closePreview = () => {
  showModal.value = false
  activePreviewUrl.value = null
}

const handleSelectRecent = (url: string) => {
  inputUrl.value = url
}

const handleDownload = (thumb: ThumbnailOption) => {
  if (!currentVideo.value) return
  const fileName = `yt-thumbnail-${currentVideo.value.videoId}-${thumb.quality}.jpg`
  downloadImage(thumb.url, fileName)
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
  applicationCategory: 'UtilitiesApplication',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD', availability: 'https://schema.org/InStock' },
  description: t.value.schema.description,
  creator: { '@type': 'Organization', name: 'Facto', url: 'https://www.factosaas.com' },
  url: 'https://www.factosaas.com/herramientas/descargar-miniaturas-youtube',
}))

const schemaBreadcrumb = computed(() => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Inicio', item: 'https://www.factosaas.com' },
    { '@type': 'ListItem', position: 2, name: t.value.breadcrumb.tools, item: 'https://www.factosaas.com/herramientas' },
    { '@type': 'ListItem', position: 3, name: t.value.schema.name, item: 'https://www.factosaas.com/herramientas/descargar-miniaturas-youtube' },
  ]
}))

const schemaFaq = computed(() => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: ytFaqs.value.map(faq => ({
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
    
    <!-- Premium Ambient Glow -->
    <div class="absolute inset-0 pointer-events-none -z-10 flex justify-center">
      <div class="absolute top-[-10%] w-[1000px] h-[600px] bg-[#00D4FF]/[0.03] blur-[150px] rounded-full"></div>
    </div>

    <div class="w-full max-w-[1100px] px-6 z-10 relative flex flex-col items-center pb-32">
      
      <!-- Breadcrumb -->
      <div class="w-full mb-4">
        <GlobalBreadcrumb :items="[{ label: t.breadcrumb.tools, to: '/herramientas' }, { label: t.breadcrumb.thumbnails }]" />
      </div>

      <!-- Hero Header -->
      <div class="text-center mb-16 max-w-3xl mx-auto pt-4 w-full">
        <div class="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border border-white/10 bg-white/[0.04] font-sans text-[10px] font-medium tracking-[0.2em] uppercase text-white/55 mb-7">
          <span class="w-1.5 h-1.5 rounded-full bg-[#00D4FF] shadow-[0_0_8px_#00D4FF] animate-pulse"></span>
          {{ t.hero.badge }}
        </div>
        
        <h1 class="font-serif text-[clamp(2.8rem,7vw,5.5rem)] font-bold leading-[0.9] tracking-[-0.04em] text-white m-0 mb-6">
          {{ t.hero.title1 }} <span class="outline-text">{{ t.hero.title2 }}</span>
        </h1>
        
        <p class="font-sans text-[15px] font-light text-white/50 max-w-[520px] mx-auto leading-[1.7] tracking-[0.01em]">
          {{ t.hero.description }}
        </p>
      </div>

      <!-- Formulario Downloader (Carga instantánea) -->
      <ThumbnailDownloader
        v-model="inputUrl"
        :error-msg="errorMsg"
        :recent-searches="recentSearches"
        @select-recent="handleSelectRecent"
      />

      <!-- Sección de Resultados Simplificada -->
      <div v-if="hasResult && currentVideo" class="w-full max-w-3xl mx-auto mb-16 text-left">
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-white/10 mb-6">
          <div>
            <h2 class="text-xl font-serif font-bold text-white">{{ t.results.title }}</h2>
            <p class="text-xs text-white/50 font-light mt-1">{{ t.results.videoId }} <span class="font-mono text-[#00D4FF]">{{ currentVideo.videoId }}</span></p>
          </div>

          <div class="flex items-center gap-3">
            <a 
              :href="currentVideo.originalUrl" 
              target="_blank" 
              rel="noopener noreferrer"
              class="text-xs text-white/60 hover:text-white flex items-center gap-1 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10 transition-colors"
            >
              <span>{{ t.results.viewOriginal }}</span>
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>

            <button 
              @click="reset"
              class="text-xs text-white/60 hover:text-white bg-white/5 px-3 py-1.5 rounded-lg border border-white/10 transition-colors cursor-pointer"
            >
              {{ t.results.clear }}
            </button>
          </div>
        </div>

        <!-- Vista Destacada en Grande (MaxRes HD) -->
        <div v-if="currentVideo.thumbnails[0]" class="bg-[#0A0A0E] border border-white/10 rounded-2xl p-4 md:p-6 shadow-2xl relative group overflow-hidden mb-6">
          <div class="relative w-full overflow-hidden rounded-xl bg-black/40 aspect-video mb-6 border border-white/5">
            <img 
              :src="currentVideo.thumbnails[0].url" 
              :alt="`Miniatura YouTube ${currentVideo.videoId}`"
              class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.01]"
            />
            <button 
              @click="openPreview(currentVideo.thumbnails[0].url)"
              class="absolute top-3 right-3 bg-black/70 hover:bg-black text-white text-xs px-3 py-1.5 rounded-lg backdrop-blur-md border border-white/10 flex items-center gap-1.5 transition-all opacity-90 group-hover:opacity-100 cursor-pointer"
            >
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
              </svg>
              <span>{{ t.results.zoom }}</span>
            </button>
          </div>

          <!-- Botón de Descargar Principal -->
          <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <span class="text-xs font-semibold uppercase tracking-wider text-[#00D4FF] bg-[#00D4FF]/10 px-2.5 py-1 rounded-md border border-[#00D4FF]/20">
                {{ currentVideo.thumbnails[0].resolution }}
              </span>
            </div>

            <button 
              @click="handleDownload(currentVideo.thumbnails[0])"
              :disabled="isDownloading"
              class="w-full sm:w-auto bg-white text-black font-bold uppercase tracking-widest text-xs px-8 py-3.5 rounded-full transition-all duration-500 hover:scale-[1.03] hover:shadow-[0_0_20px_rgba(0,212,255,0.4)] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span>{{ isDownloading ? t.results.downloading : t.results.downloadMain }}</span>
            </button>
          </div>
        </div>

        <!-- Versión de Menor Calidad (Preview Secundaria en pequeño) -->
        <div v-if="currentVideo.thumbnails[3] || currentVideo.thumbnails[2]" class="bg-white/[0.02] border border-white/5 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div class="flex items-center gap-4">
            <img 
              :src="(currentVideo.thumbnails[3] || currentVideo.thumbnails[2]).url" 
              alt="Versión menor calidad"
              class="w-24 h-auto rounded-md border border-white/10 object-cover"
            />
            <div>
              <div class="text-xs font-medium text-white/80">{{ t.results.lightVersion }}</div>
              <div class="text-[11px] text-white/40 mt-0.5">{{ (currentVideo.thumbnails[3] || currentVideo.thumbnails[2]).resolution }}</div>
            </div>
          </div>

          <button 
            @click="handleDownload(currentVideo.thumbnails[3] || currentVideo.thumbnails[2])"
            class="text-xs text-white/70 hover:text-white bg-white/5 hover:bg-white/10 px-4 py-2 rounded-lg border border-white/10 transition-colors flex items-center gap-2 cursor-pointer"
          >
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span>{{ t.results.downloadLight }}</span>
          </button>
        </div>
      </div>

      <!-- Sección SEO & FAQs -->
      <SeoContentSection />

      <!-- Banner Saas Promotion replaced by MrrInput -->
      <div class="w-full max-w-[700px] mx-auto mt-12 mb-4 flex flex-col items-center gap-4">
        <p class="text-[10px] font-sans font-extralight tracking-[0.2em] text-white/40 uppercase text-center">{{ t.mrr.prompt }}</p>
        <MrrInput class="w-full" />
      </div>

    </div>

    <!-- Preview Modal -->
    <ThumbnailPreviewModal
      :show="showModal"
      :image-url="activePreviewUrl"
      @close="closePreview"
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
