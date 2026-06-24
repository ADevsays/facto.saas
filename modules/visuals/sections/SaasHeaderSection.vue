<script setup lang="ts">
import { ROUTES } from '~/utils/routes'
import { computed } from 'vue'
import { getGemColor } from '~/ui/const/gems'
import SaasLogo from '~/ui/components/SaasLogo.vue'
import ShareModal from '../components/ShareModal.vue'
import { useShareModal } from '../composables/useShareModal'
import { onMounted, ref } from 'vue'

const props = defineProps<{
  saas: {
    name: string | null
    logoUrl: string | null
    websiteUrl: string | null
    description: string | null
    categories?: { name: string; slug: string }[]
  }
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

import { useRoute } from 'vue-router'

const { openShare } = useShareModal()
const route = useRoute()

const handleShare = () => {
  if (!props.saas.name) return
  const slug = route.params.slug as string
  openShare(props.saas.name, slug)
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
        />

        <h1 class="font-serif text-[5.5vw] md:text-[2.25rem] leading-none tracking-tight text-left">
          {{ saas.name || '— Anónimo —' }}
        </h1>
      </div>

      <!-- Buttons -->
      <div class="flex items-center gap-3">
        <button v-if="saas.name" @click="handleShare" class="shrink-0 group relative inline-flex items-center gap-2 md:gap-3 bg-black text-white border border-white/20 font-bold uppercase tracking-widest text-[10px] md:text-xs rounded-full px-3.5 py-2 md:px-4.5 md:py-2.5 transition-all duration-700 hover:scale-[1.03] hover:border-white/50 hover:bg-white/5">
          Compartir
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="transition-transform duration-500 group-hover:-translate-y-0.5">
            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
            <polyline points="16 6 12 2 8 6"></polyline>
            <line x1="12" y1="2" x2="12" y2="15"></line>
          </svg>
        </button>
        <a v-if="trackedWebsiteUrl" :href="trackedWebsiteUrl" target="_blank" rel="noopener noreferrer" class="shrink-0 group relative inline-flex items-center gap-2 md:gap-3 bg-white text-black font-bold uppercase tracking-widest text-[10px] md:text-xs rounded-full px-3.5 py-2 md:px-4.5 md:py-2.5 transition-all duration-700 hover:scale-[1.03]" style="box-shadow: 0 0 15px rgba(255, 255, 255, 0.5), 0 0 30px rgba(0, 212, 255, 0.3)">
          Visitar
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
      {{ saas.description || 'Impulsando el futuro de la tecnología con soluciones innovadoras.' }}
    </p>

    <!-- Categories Pills -->
    <div v-if="saas.categories && saas.categories.length > 0" class="flex flex-wrap items-center gap-2 px-2 md:px-0">
      <NuxtLink 
        v-for="cat in saas.categories" 
        :key="cat.slug"
        :to="`${ROUTES.CATEGORY}/${cat.slug}`"
        class="text-[10px] uppercase tracking-widest font-sans font-medium px-3 py-1 rounded-full border border-white/10 bg-white/[0.03] text-neutral-300 hover:text-white hover:border-[#00D4FF]/50 transition-colors"
      >
        {{ cat.name }}
      </NuxtLink>
    </div>

    <ShareModal />
  </div>
</template>
