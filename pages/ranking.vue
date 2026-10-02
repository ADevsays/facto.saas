<script setup lang="ts">
import GlobalBreadcrumb from '~/ui/components/GlobalBreadcrumb.vue'
import RankingView from '~/modules/ranking/views/RankingView.vue'
import { useAppSchema } from '~/composables/useAppSchema'

import es from '~/modules/ranking/locales/es.json'
import en from '~/modules/ranking/locales/en.json'

defineI18nRoute({
  paths: {
    es: '/ranking',
    en: '/ranking'
  }
})

const { t } = useLanguage({ es, en })
const { defineWebSite } = useAppSchema()

defineWebSite({
  name: 'Facto - Ranking Global de Startups SaaS',
  description: 'Explora el ranking oficial y verificado de las mejores startups SaaS ordenadas por MRR y facturación real.',
})

useAppSeo({
  title: () => t.value?.page?.seo_title || 'Ranking Global de Startups SaaS por MRR | Facto',
  description: () => t.value?.page?.seo_description || 'Descubre las startups SaaS más exitosas de Iberoamérica y el mundo. Métricas reales de facturación, MRR verificado y fundadores.',
  imagePath: '/og-ranking.png',
})
</script>

<template>
  <main class="min-h-screen bg-[#030305] text-white overflow-x-clip relative isolate flex flex-col items-center pt-14 pb-20 px-6">
    <!-- Background glow -->
    <div class="absolute inset-0 z-[-1] pointer-events-none flex items-center justify-center">
      <div class="w-[80vw] h-[80vw] max-w-[800px] max-h-[800px] bg-[#00D4FF]/5 rounded-full blur-[120px] opacity-40"></div>
    </div>

    <div class="w-full max-w-5xl mb-6">
      <GlobalBreadcrumb :items="[{ label: t?.page?.breadcrumb || 'Ranking' }]" />
    </div>

    <div class="w-full max-w-5xl flex flex-col gap-8">
      <!-- Header Area replicating /saas style -->
      <header class="pt-3 pb-2 flex flex-col gap-3">
        <h1 class="font-serif text-3xl sm:text-4xl lg:text-[38px] xl:text-[42px] font-normal leading-tight tracking-tight text-white min-w-0 flex-1 break-words whitespace-normal">
          {{ t?.page?.title_start }} <span class="facto-effect">{{ t?.page?.title_highlight }}</span>
        </h1>
        <p class="font-sans font-extralight text-sm text-neutral-400 max-w-lg leading-relaxed">
          {{ t?.page?.description }}
        </p>
      </header>

      <!-- Full Top 100 Ranking Table -->
      <RankingView :limit="100" :show-view-all="false" :hide-title="true" />
    </div>
  </main>
</template>

<style scoped>
.facto-effect {
  background: linear-gradient(120deg, rgba(255,255,255,0) 30%, rgba(255,255,255,0.8) 50%, rgba(255,255,255,0) 70%);
  background-size: 200% auto;
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: rgba(0, 212, 255, 0.3);
  filter: drop-shadow(0 0 15px rgba(0, 212, 255, 0.4));
  animation: shine 12s ease-in-out infinite;
  display: inline-block;
}

@keyframes shine {
  0%   { background-position: -100% 0; }
  100% { background-position: 100% 0; }
}
</style>
