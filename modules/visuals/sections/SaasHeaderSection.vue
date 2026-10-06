<script setup lang="ts">
import { ROUTES } from '~/utils/routes'
import { computed } from 'vue'
import { getGemColor } from '~/ui/const/gems'
import { getCategoryDisplayName } from '~/utils/categories'
import SaasLogo from '~/ui/components/SaasLogo.vue'
import ShareModal from '../components/ShareModal.vue'
import { useShareModal } from '../composables/useShareModal'
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'

import es from '../locales/es.json'
import en from '../locales/en.json'
const { t, locale } = useLanguage({ es, en })
const localePath = useLocalePath()

const props = defineProps<{
  saas: {
    name: string | null
    logoUrl: string | null
    websiteUrl: string | null
    description: string | null
    categories?: { name: string; slug: string }[]
    views?: number
    allTimeRevenue?: string
    mrr?: number | null
    currency?: string
  }
  isVerifiedOwner?: boolean
}>()

const emit = defineEmits<{
  edit: []
}>()

const gemColor = computed(() => {
  const slug = props.saas.categories?.[0]?.slug
  return getGemColor(slug)
})

const trackedWebsiteUrl = computed(() => {
  if (!props.saas.websiteUrl) return null
  try {
    const url = new URL(props.saas.websiteUrl)
    url.searchParams.set('ref', 'facto')
    url.searchParams.set('utm_source', 'factosaas.com')
    url.searchParams.set('utm_medium', 'ranking')
    return url.toString()
  } catch (e) {
    return props.saas.websiteUrl
  }
})

const { openShare } = useShareModal()
const route = useRoute()

const handleShare = () => {
  if (!props.saas.name) return
  const slug = route.params.slug as string
  openShare({
    name: props.saas.name,
    slug,
    logoUrl: props.saas.logoUrl,
    views: props.saas.views,
    allTimeRevenue: props.saas.allTimeRevenue,
    mrr: props.saas.mrr,
    currency: props.saas.currency
  })
}
</script>

<template>
  <div class="flex flex-col max-w-5xl mx-auto mb-14 z-10 w-full">
    <!-- Row container -->
    <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 md:gap-4 mb-6 w-full">
      
      <!-- Logo and Title Group -->
      <div class="flex flex-row items-center gap-3 md:gap-4">
        <SaasLogo
          :src="saas.logoUrl"
          :alt="saas.name || 'SaaS Logo'"
          :initial="saas.name?.charAt(0)?.toUpperCase() || '?'"
          size="xl"
          rounded="xl"
          :gem-color="gemColor"
          class="shadow-xl"
          :websiteUrl="saas.websiteUrl"
          :priority="true"
        />

        <h1 class="font-serif text-[5.5vw] md:text-[2.25rem] leading-none tracking-tight text-left">
          {{ saas.name || t.profile.header.anonymous }}
        </h1>
      </div>

      <!-- Buttons -->
      <div class="flex items-center gap-3">
        <NuxtLink 
          v-if="isVerifiedOwner"
          :to="localePath(`/dashboard/saas/${route.params.slug}`)" 
          class="shrink-0 group relative inline-flex items-center gap-2 md:gap-2.5 bg-white/[0.04] text-neutral-300 hover:text-white border border-white/20 hover:border-white/50 font-bold uppercase tracking-widest text-[10px] md:text-xs rounded-full px-3.5 py-2 md:px-4.5 md:py-2.5 transition-all duration-700 hover:scale-[1.03] animate-particle-assemble overflow-hidden"
        >
          <span class="particle-spark particle-1"></span>
          <span class="particle-spark particle-2"></span>
          <span class="particle-spark particle-3"></span>
          <span class="particle-spark particle-4"></span>
          <span class="particle-spark particle-5"></span>
          <span class="particle-spark particle-6"></span>

          <span class="relative z-10">{{ t.profile.header.edit }}</span>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="relative z-10 text-neutral-400 group-hover:text-white transition-colors duration-300">
            <path d="M12 20h9"></path>
            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
          </svg>
        </NuxtLink>

        <button v-if="saas.name" @click="handleShare" class="shrink-0 group relative inline-flex items-center gap-2 md:gap-3 bg-black text-white border border-white/20 font-bold uppercase tracking-widest text-[10px] md:text-xs rounded-full px-3.5 py-2 md:px-4.5 md:py-2.5 transition-all duration-700 hover:scale-[1.03] hover:border-white/50 hover:bg-white/5">
          {{ t.profile.header.share }}
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="transition-transform duration-500 group-hover:-translate-y-0.5">
            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
            <polyline points="16 6 12 2 8 6"></polyline>
            <line x1="12" y1="2" x2="12" y2="15"></line>
          </svg>
        </button>
        <a v-if="trackedWebsiteUrl" :href="trackedWebsiteUrl" target="_blank" rel="noopener noreferrer" class="shrink-0 group relative inline-flex items-center gap-2 md:gap-3 bg-white text-black font-bold uppercase tracking-widest text-[10px] md:text-xs rounded-full px-3.5 py-2 md:px-4.5 md:py-2.5 transition-all duration-700 hover:scale-[1.03]" style="box-shadow: 0 0 15px rgba(255, 255, 255, 0.5), 0 0 30px rgba(0, 212, 255, 0.3)">
          {{ t.profile.header.visit }}
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="transition-transform duration-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
            <polyline points="15 3 21 3 21 9"></polyline>
            <line x1="10" y1="14" x2="21" y2="3"></line>
          </svg>
        </a>
      </div>
    </div>

    <!-- Description -->
    <p class="font-sans text-neutral-400 font-extralight tracking-[0.08em] max-w-3xl text-sm md:text-base text-left px-2 md:px-0 whitespace-pre-line mb-6">
      {{ saas.description || t.profile.header.default_desc }}
    </p>

    <!-- Categories Pills -->
    <div v-if="saas.categories && saas.categories.length > 0" class="flex flex-wrap items-center gap-2 px-2 md:px-0">
      <NuxtLink 
        v-for="cat in saas.categories" 
        :key="cat.slug"
        :to="localePath(`${ROUTES.CATEGORY}/${cat.slug}`)"
        class="text-[10px] uppercase tracking-widest font-sans font-medium px-3 py-1 rounded-full border border-white/10 bg-white/[0.03] text-neutral-300 hover:text-white hover:border-[#00D4FF]/50 transition-colors"
      >
        {{ getCategoryDisplayName(cat.slug, cat.name, locale) }}
      </NuxtLink>
    </div>

    <ShareModal />
  </div>
</template>

<style scoped>
@keyframes particleAssemble {
  0% {
    opacity: 0;
    filter: blur(8px);
    transform: scale(0.8) translateY(3px);
    box-shadow: 0 0 20px rgba(255, 255, 255, 0.4), inset 0 0 10px rgba(255, 255, 255, 0.3);
  }
  60% {
    opacity: 0.95;
    filter: blur(1.5px);
    transform: scale(1.02) translateY(-0.5px);
    box-shadow: 0 0 12px rgba(255, 255, 255, 0.2);
  }
  100% {
    opacity: 1;
    filter: blur(0);
    transform: scale(1) translateY(0);
    box-shadow: none;
  }
}

.animate-particle-assemble {
  animation: particleAssemble 0.38s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

.particle-spark {
  position: absolute;
  width: 2.5px;
  height: 2.5px;
  border-radius: 9999px;
  background: white;
  pointer-events: none;
  opacity: 0;
}

@keyframes flyInSpark1 {
  0% { opacity: 0; transform: translate(-20px, -12px) scale(1.8); filter: blur(1px); }
  50% { opacity: 1; }
  100% { opacity: 0; transform: translate(6px, 3px) scale(0); }
}

@keyframes flyInSpark2 {
  0% { opacity: 0; transform: translate(22px, -10px) scale(2); filter: blur(1px); }
  50% { opacity: 1; }
  100% { opacity: 0; transform: translate(-6px, 2px) scale(0); }
}

@keyframes flyInSpark3 {
  0% { opacity: 0; transform: translate(-16px, 16px) scale(1.6); filter: blur(1px); }
  50% { opacity: 1; }
  100% { opacity: 0; transform: translate(4px, -2px) scale(0); }
}

@keyframes flyInSpark4 {
  0% { opacity: 0; transform: translate(18px, 14px) scale(1.8); filter: blur(1px); }
  50% { opacity: 1; }
  100% { opacity: 0; transform: translate(-5px, -3px) scale(0); }
}

@keyframes flyInSpark5 {
  0% { opacity: 0; transform: translate(0px, -18px) scale(1.8); }
  50% { opacity: 1; }
  100% { opacity: 0; transform: translate(0px, 2px) scale(0); }
}

@keyframes flyInSpark6 {
  0% { opacity: 0; transform: translate(0px, 18px) scale(1.8); }
  50% { opacity: 1; }
  100% { opacity: 0; transform: translate(0px, -2px) scale(0); }
}

.particle-1 { top: 20%; left: 15%; animation: flyInSpark1 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
.particle-2 { top: 20%; right: 15%; animation: flyInSpark2 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
.particle-3 { bottom: 20%; left: 20%; animation: flyInSpark3 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
.particle-4 { bottom: 20%; right: 20%; animation: flyInSpark4 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
.particle-5 { top: 10%; left: 50%; animation: flyInSpark5 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
.particle-6 { bottom: 10%; left: 50%; animation: flyInSpark6 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
</style>
