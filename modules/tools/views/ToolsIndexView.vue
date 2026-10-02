<script setup lang="ts">
import GlobalBreadcrumb from '~/ui/components/GlobalBreadcrumb.vue'
import MrrInput from '~/modules/input-mrr/components/MrrInput.vue'
import { TOOLS_LIST as TOOLS_LIST_ES } from '../const/toolsList.es'
import { TOOLS_LIST as TOOLS_LIST_EN } from '../const/toolsList.en'
import es from '../locales/es.json'
import en from '../locales/en.json'
import { computed } from 'vue'

const { t, language } = useLanguage({ es, en })
const toolsList = computed(() => language.value === 'es' ? TOOLS_LIST_ES : TOOLS_LIST_EN)

const localePath = useLocalePath()

useAppSeo({
  title: () => t.value.seo.title,
  description: () => t.value.seo.description,
  robots: 'index, follow, max-snippet:160, max-image-preview:large',
})

const schemaCollection = computed(() => ({
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: t.value.schema.name,
  description: t.value.schema.description,
  url: 'https://www.factosaas.com/herramientas',
  publisher: { '@type': 'Organization', name: 'Facto', url: 'https://www.factosaas.com' },
  hasPart: toolsList.value.map(tool => ({
    '@type': 'SoftwareApplication',
    name: tool.title,
    description: tool.description,
    url: `https://www.factosaas.com${tool.link}`,
    applicationCategory: 'BusinessApplication',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD', availability: 'https://schema.org/InStock' }
  }))
}))

const schemaBreadcrumb = computed(() => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: t.value.schema.home, item: 'https://www.factosaas.com' },
    { '@type': 'ListItem', position: 2, name: t.value.schema.tools, item: 'https://www.factosaas.com/herramientas' },
  ]
}))

useHead({
  script: [
    { type: 'application/ld+json', innerHTML: () => JSON.stringify(schemaCollection.value) },
    { type: 'application/ld+json', innerHTML: () => JSON.stringify(schemaBreadcrumb.value) },
  ]
})
</script>

<template>
  <div class="min-h-screen bg-[#030305] text-white flex flex-col items-center pt-14 relative isolate overflow-x-clip">

    <div class="absolute inset-0 pointer-events-none -z-10 flex justify-center">
      <div class="absolute top-[-10%] w-[1000px] h-[600px] bg-[#00D4FF]/[0.03] blur-[150px] rounded-full"></div>
    </div>

    <div class="w-full max-w-[1100px] px-6 z-10 relative flex flex-col items-center pb-16">

      <div class="w-full mb-4">
        <GlobalBreadcrumb :items="[{ label: t.breadcrumb.label }]" />
      </div>

      <!-- Hero Header -->
      <div class="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center mb-24 max-w-7xl mx-auto px-4 lg:px-8 pt-4 w-full">
        <!-- Left Side: Text and Input -->
        <div class="flex flex-col items-center text-center lg:items-start lg:text-left lg:col-span-8 xl:col-span-8">
          <h1 class="font-serif text-[clamp(2.5rem,4.5vw,4rem)] font-bold leading-[1.05] tracking-[-0.04em] text-white m-0 mb-6 w-full">
            {{ t.hero.title1 }} <br class="hidden lg:block" />
            <span class="outline-text inline-block mt-2">{{ t.hero.title2 }}</span>
          </h1>

          <p class="font-sans text-[16px] font-light text-white/50 leading-[1.7] tracking-[0.01em] mb-10 max-w-[550px] mx-auto lg:mx-0">
            {{ t.hero.description }}
          </p>

          <div class="w-full max-w-[500px] mx-auto lg:mx-0">
            <MrrInput />
          </div>
        </div>

        <!-- Right Side: Generated Image -->
        <div class="hidden relative w-full lg:flex justify-center lg:justify-end lg:col-span-4 xl:col-span-4">
          <div class="relative w-full max-w-[420px]">
            <!-- Background Glow -->
            <div class="absolute inset-0 bg-[#00D4FF]/20 blur-[100px] rounded-full"></div>
            
            <!-- Concentric Rings -->
            <div class="absolute inset-0 -z-10 flex items-center justify-center pointer-events-none">
              <svg class="w-[160%] h-[160%] opacity-[0.15] animate-[spin_120s_linear_infinite]" viewBox="0 0 200 200" fill="none">
                <circle cx="100" cy="100" r="55" stroke="#00D4FF" stroke-width="0.5" stroke-dasharray="1 3"/>
                <circle cx="100" cy="100" r="75" stroke="white" stroke-width="0.5" stroke-dasharray="1 4"/>
                <circle cx="100" cy="100" r="95" stroke="#00D4FF" stroke-width="0.5" stroke-dasharray="1 5"/>
              </svg>
            </div>

            <!-- Dot Grid Pattern -->
            <svg class="absolute -bottom-8 -left-8 w-24 h-24 opacity-20 -z-10 pointer-events-none" fill="none">
              <pattern id="dot-grid" x="0" y="0" width="12" height="12" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1" fill="white" />
              </pattern>
              <rect x="0" y="0" width="100%" height="100%" fill="url(#dot-grid)" />
            </svg>

            <!-- Glowing Particles -->
            <div class="absolute top-[15%] -right-4 w-1.5 h-1.5 bg-[#00D4FF] rounded-full shadow-[0_0_15px_3px_#00D4FF] animate-pulse pointer-events-none"></div>
            <div class="absolute bottom-[25%] -left-2 w-1.5 h-1.5 bg-[#00D4FF] rounded-full shadow-[0_0_12px_2px_#00D4FF] animate-pulse pointer-events-none" style="animation-delay: 1s"></div>
            <div class="absolute top-[40%] -left-8 w-1 h-1 bg-white/70 rounded-full shadow-[0_0_8px_1px_white] animate-pulse pointer-events-none" style="animation-delay: 2s"></div>

            <img 
              src="/tools-hero.webp?v=3" 
              :alt="t.hero.imgAlt" 
              class="relative z-10 w-full h-auto drop-shadow-[0_0_40px_rgba(0,212,255,0.2)] animate-float-subtle hover:scale-[1.02] transition-all duration-700" 
            />
          </div>
        </div>
      </div>

      <!-- Herramientas Bento Grid -->
      <div class="w-full max-w-7xl mx-auto mb-8 px-4 lg:px-8 mt-12">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 w-full">
          <NuxtLink
            v-for="(tool, i) in toolsList"
            :key="tool.id"
            :to="localePath(tool.link)"
            class="group flex items-center justify-between gap-4 bg-[#0A0A0C] border border-white/[0.04] hover:border-white/[0.1] rounded-2xl p-4 transition-all duration-300 hover:bg-white/[0.02] cursor-pointer"
          >
            <div class="flex items-center gap-4 min-w-0 flex-1">
              <!-- Icon Pill -->
              <div 
                class="w-12 h-12 shrink-0 rounded-xl flex items-center justify-center transition-transform duration-500 group-hover:scale-105"
                :class="{
                  'bg-[#00D4FF]/10 text-[#00D4FF] shadow-[inset_0_0_15px_rgba(0,212,255,0.15)]': i % 6 === 0,
                  'bg-[#A855F7]/10 text-[#A855F7] shadow-[inset_0_0_15px_rgba(168,85,247,0.15)]': i % 6 === 1,
                  'bg-[#F59E0B]/10 text-[#F59E0B] shadow-[inset_0_0_15px_rgba(245,158,11,0.15)]': i % 6 === 2,
                  'bg-[#10B981]/10 text-[#10B981] shadow-[inset_0_0_15px_rgba(16,185,129,0.15)]': i % 6 === 3,
                  'bg-[#EC4899]/10 text-[#EC4899] shadow-[inset_0_0_15px_rgba(236,72,153,0.15)]': i % 6 === 4,
                  'bg-[#EF4444]/10 text-[#EF4444] shadow-[inset_0_0_15px_rgba(239,68,68,0.15)]': i % 6 === 5,
                }"
              >
                <svg v-if="tool.id === 'youtube-downloader'" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
                </svg>
                <svg v-else-if="tool.id === 'saas-calculator'" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                <svg v-else class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              
              <!-- Content -->
              <div class="min-w-0 flex-1">
                <h3 class="font-sans text-[14px] font-semibold text-white/90 truncate group-hover:text-white transition-colors">{{ tool.title }}</h3>
                <p class="font-sans text-[12px] font-light text-white/40 truncate group-hover:text-white/60 transition-colors mt-0.5">{{ tool.description }}</p>
              </div>
            </div>

            <!-- Arrow -->
            <div class="shrink-0 text-white/20 group-hover:text-white/60 transition-colors group-hover:translate-x-1 duration-300 pr-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </div>
          </NuxtLink>
        </div>
      </div>
    </div>

  </div>
</template>

<style scoped>
.tool-row-glow {
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at -10% center, color-mix(in srgb, var(--glow-color) 8%, transparent) 0%, transparent 65%);
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.6s ease;
}

.tool-row:hover .tool-row-glow {
  opacity: 1;
}

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

@keyframes float {
  0% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-8px) rotate(-0.5deg); }
  100% { transform: translateY(0px) rotate(0deg); }
}

.animate-float-subtle {
  animation: float 7s ease-in-out infinite;
}
</style>
