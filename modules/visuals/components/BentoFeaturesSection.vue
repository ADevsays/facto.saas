<script setup lang="ts">
import { ref, computed } from 'vue'
import BentoGithubHeatmap from './BentoGithubHeatmap.vue'
import BentoCard from './BentoCard.vue'
import TechBadge from '~/ui/components/TechBadge.vue'
import SocialLinks from '~/ui/components/SocialLinks.vue'
import FaqItem from '~/ui/components/FaqItem.vue'
import { getFounderSlug } from '~/utils/founder'
import es from '../locales/es.json'
import en from '../locales/en.json'

const { t } = useLanguage({ es, en })
const localePath = useLocalePath()

const props = defineProps<{
  saas: {
    founderId?: string | null
    founderName?: string | null
    founderAvatar?: string | null
    founderBio?: string | null
    founderSocials?: { twitterUrl?: string; linkedinUrl?: string; instagramUrl?: string } | null
    valueProposition?: string | null
    problemSolved?: string | null
    techStack?: string[]
    acquisitionChannels?: string[]
    faq?: { question: string; answer: string }[]
    githubRepo?: string | null
  }
}>()

const openFaqIndex = ref<number | null>(null)

function toggleFaq(idx: number) {
  openFaqIndex.value = openFaqIndex.value === idx ? null : idx
}

const hasBentoCards = computed(() => {
  return !!(
    props.saas.valueProposition ||
    props.saas.problemSolved ||
    (props.saas.techStack && props.saas.techStack.length > 0) ||
    (props.saas.acquisitionChannels && props.saas.acquisitionChannels.length > 0) ||
    props.saas.githubRepo
  )
})

const route = useRoute()

const founderLink = computed(() => {
  const slug = getFounderSlug(props.saas.founderName)
  if (!slug) return ''
  const currentSaasSlug = (route.params.slug as string) || ''
  const base = localePath(`/founder/${slug}`)
  return currentSaasSlug ? `${base}?from=${encodeURIComponent(currentSaasSlug)}` : base
})
</script>

<template>
  <div class="w-full max-w-5xl mx-auto mt-12 flex flex-col gap-12">
    
    <!-- Symmetrical Bento Grid -->
    <section v-if="hasBentoCards" class="w-full">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
        
        <!-- Card 1: Propuesta de Valor -->
        <BentoCard v-if="saas.valueProposition" :title="t.profile.bento.value_prop_title">
          <template #icon>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-neutral-400">
              <path d="m12 3-1.912 5.885L4 10.8l5.885 1.912L12 21l1.912-5.885L20 13.2l-5.885-1.912Z"/>
            </svg>
          </template>
          <p class="font-serif text-lg md:text-xl text-white font-normal leading-relaxed">
            &quot;{{ saas.valueProposition }}&quot;
          </p>
        </BentoCard>

        <!-- Card 2: Problema que Resuelve -->
        <BentoCard v-if="saas.problemSolved" :title="t.profile.bento.problem_title">
          <template #icon>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-neutral-400">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          </template>
          <p class="font-sans text-sm md:text-base text-neutral-300 font-light leading-relaxed">
            {{ saas.problemSolved }}
          </p>
        </BentoCard>

        <!-- Card 3: Tech Stack -->
        <BentoCard v-if="saas.techStack && saas.techStack.length > 0" :title="t.profile.bento.tech_stack_title">
          <template #icon>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-neutral-400">
              <polyline points="16 18 22 12 16 6"/>
              <polyline points="8 6 2 12 8 18"/>
            </svg>
          </template>
          <div class="flex flex-wrap gap-2">
            <TechBadge 
              v-for="tech in saas.techStack" 
              :key="tech" 
              :tech="tech" 
            />
          </div>
        </BentoCard>

        <!-- Card 4: Canales de Adquisición -->
        <BentoCard v-if="saas.acquisitionChannels && saas.acquisitionChannels.length > 0" :title="t.profile.bento.acquisition_title">
          <template #icon>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-neutral-400">
              <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/>
              <polyline points="16 7 22 7 22 13"/>
            </svg>
          </template>
          <div class="flex flex-wrap gap-2">
            <span 
              v-for="ch in saas.acquisitionChannels" 
              :key="ch" 
              class="px-3.5 py-1.5 rounded-xl text-xs font-sans font-light bg-cyan-500/10 border border-cyan-500/20 text-cyan-300"
            >
              {{ ch }}
            </span>
          </div>
        </BentoCard>

        <!-- Card 5: GitHub Repo Activity -->
        <div 
          v-if="saas.githubRepo" 
          class="p-6 md:p-8 rounded-3xl border border-white/10 bg-surface-elevated hover:bg-surface-elevated-hover hover:border-white/20 transition-all duration-300 md:col-span-2 shadow-lg"
        >
          <BentoGithubHeatmap :repo="saas.githubRepo" />
        </div>
        
      </div>
    </section>

    <!-- Founder Bio Card -->
    <section v-if="saas.founderBio || saas.founderName" class="w-full">
      <div class="w-full p-6 md:p-8 rounded-3xl border border-white/10 bg-surface-elevated hover:border-white/20 transition-all duration-300 flex flex-col items-center text-center relative overflow-hidden shadow-lg">

        <NuxtLink 
          :to="founderLink"
          :aria-label="saas.founderName || 'Perfil del fundador'"
          class="w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden shrink-0 border-2 border-white/20 bg-black flex items-center justify-center shadow-md mb-4 transition-transform hover:scale-105"
        >
          <img v-if="saas.founderAvatar" :src="saas.founderAvatar" :alt="saas.founderName || 'Founder'" class="w-full h-full object-cover" />
          <span v-else class="font-serif font-bold text-white text-xl">{{ saas.founderName?.charAt(0)?.toUpperCase() || 'F' }}</span>
        </NuxtLink>

        <NuxtLink 
          :to="founderLink"
          class="group"
        >
          <h3 class="font-serif text-xl md:text-2xl text-white font-medium group-hover:text-[#00D4FF] transition-colors">
            {{ saas.founderName || 'Fundador' }}
          </h3>
        </NuxtLink>

        <span class="text-[9px] font-sans font-medium tracking-[0.2em] text-neutral-400 uppercase mt-1 mb-4">
          {{ t.profile.bento.creator_label || 'Creador del proyecto' }}
        </span>

        <p v-if="saas.founderBio" class="font-sans text-sm md:text-base text-neutral-300 font-extralight italic leading-relaxed max-w-lg">
          &quot;{{ saas.founderBio }}&quot;
        </p>

        <SocialLinks :socials="saas.founderSocials" class="mt-5" />
      </div>
    </section>

    <!-- FAQ Section (Positioned below founder) -->
    <section v-if="saas.faq && saas.faq.length > 0" class="w-full pt-2">
      <div class="text-center mb-8">
        <h2 class="text-white font-serif italic text-2xl md:text-3xl tracking-tight">
          {{ t.profile.bento.faq_title || 'Preguntas frecuentes' }}
        </h2>
        <div class="w-12 h-[1px] bg-[#00D4FF]/40 mx-auto mt-3"></div>
      </div>

      <div>
        <FaqItem 
          v-for="(faq, index) in saas.faq" 
          :key="index" 
          :question="faq.question" 
          :answer="faq.answer" 
          :is-open="openFaqIndex === index"
          @toggle="toggleFaq(index)"
        />
      </div>
    </section>
  </div>
</template>
