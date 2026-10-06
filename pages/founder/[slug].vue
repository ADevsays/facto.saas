<script setup lang="ts">
import { useRoute } from 'nuxt/app'
import FounderPublicProfileView from '~/modules/visuals/views/FounderPublicProfileView.vue'
import es from '~/modules/visuals/locales/es.json'
import en from '~/modules/visuals/locales/en.json'

const route = useRoute()
const slug = computed(() => route.params.slug as string)
const { t } = useLanguage({ es, en })
const localePath = useLocalePath()

const { data, error, pending } = useLazyFetch<any>(() => `/api/founder/${slug.value}`, {
  key: `founder-profile-${route.params.slug}`
})

useAppSeo({
  title: () => data.value?.founder?.name 
    ? (t.value?.founder_profile?.seo_title?.replace('{name}', data.value.founder.name) || `${data.value.founder.name} — Founder Profile | Facto`)
    : (t.value?.founder_profile?.seo_title_fallback || 'Founder Profile | Facto'),
  description: () => data.value?.founder?.bio 
    ? data.value.founder.bio 
    : (t.value?.founder_profile?.seo_description_fallback || 'Discover startups and revenue from founders on Facto.')
})
</script>

<template>
  <div>
    <div v-if="error && !pending" class="min-h-screen bg-[#030305] flex flex-col items-center justify-center gap-4 text-center px-6">
      <span class="text-white/50 text-sm tracking-widest uppercase">{{ t.founder_profile.not_found }}</span>
      <NuxtLink :to="localePath('/')" class="text-xs text-cyan-500 uppercase tracking-widest border border-cyan-500/30 rounded-full px-4 py-2 hover:bg-cyan-500/10 transition-colors">
        {{ t.founder_profile.back_to_ranking }}
      </NuxtLink>
    </div>
    <FounderPublicProfileView v-else :data="data" :pending="pending" />
  </div>
</template>
