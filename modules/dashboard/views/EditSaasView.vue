<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useLanguage } from '~/composables/useLanguage'
import { useFounderSession } from '~/composables/useFounderSession'
import { useDashboardStartup } from '../composables/useDashboardStartup'
import DashboardHeader from '../components/DashboardHeader.vue'
import DashboardSidebar from '../components/DashboardSidebar.vue'
import VisibilityToggleCard from '../components/VisibilityToggleCard.vue'
import EditSaasSkeleton from '../components/EditSaasSkeleton.vue'
import EditSaasBasicCard from '../components/EditSaasBasicCard.vue'
import EditSaasBentoCard from '../components/EditSaasBentoCard.vue'
import EditSaasGithubCard from '../components/EditSaasGithubCard.vue'
import EditSaasFaqCard from '../components/EditSaasFaqCard.vue'
import EditSaasToast from '../components/EditSaasToast.vue'
import es from '../locales/es.json'
import en from '../locales/en.json'

const { t } = useLanguage({ es, en })
const route = useRoute()
const slug = computed(() => route.params.slug as string)

const { founder, startups, checkSession } = useFounderSession()
const {
  loading,
  saving,
  savedSuccess,
  errorMessage,
  name,
  logoUrl,
  logoFileBase64,
  websiteUrl,
  description,
  categorySlugs,
  countrySlug,
  isHidden,
  mrr,
  provider,
  apiKey,
  detectedMrr,
  isMpConnecting,
  openMpAuth,
  problemSolved,
  valueProposition,
  acquisitionChannels,
  newChannel,
  techStack,
  githubRepo,
  testingGithub,
  githubStatus,
  githubMessage,
  faqList,
  hasBentoData,
  hasGithubData,
  hasFaqData,
  loadStartup,
  addChannel,
  removeChannel,
  addFaq,
  removeFaq,
  toggleVisibility,
  testGithubRepo,
  saveStartup
} = useDashboardStartup()

onMounted(async () => {
  await checkSession()
  if (slug.value) {
    await loadStartup(slug.value)
  }
})
</script>

<template>
  <div class="min-h-screen bg-[#030305] text-white flex flex-col selection:bg-cyan-500/30 relative isolate">
    <div class="w-full max-w-7xl mx-auto px-6 md:px-12 flex flex-col flex-1">
      
      <!-- Top Navigation Header -->
      <DashboardHeader
        :preview-slug="slug"
        :saving="saving"
        :saved-success="savedSuccess"
        :show-save-button="!loading"
        :avatar-url="founder?.avatar_url"
        :founder-email="founder?.email"
        :founder-name="founder?.name"
        @save="saveStartup"
      />

      <!-- Main Workspace (Sidebar + Form Content) -->
      <div class="flex-1 flex flex-col md:flex-row py-6 md:py-10 gap-6 md:gap-10">
        <DashboardSidebar
          current-section="saas"
          :current-slug="slug"
          :startups-count="startups.length"
        />

        <main class="flex-1 w-full max-w-4xl space-y-10">
          <EditSaasSkeleton v-if="loading" />

          <div v-else class="space-y-10 animate-fade-in">
            <!-- Inline Notifications -->
            <div v-if="savedSuccess" class="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm font-sans flex items-center gap-3 animate-fade-in">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
              <span>{{ t.messages?.changes_saved || 'Cambios guardados correctamente.' }}</span>
            </div>

            <div v-if="errorMessage" class="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm font-sans flex items-center gap-3 animate-fade-in">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
              <span>{{ errorMessage }}</span>
            </div>

            <!-- Title & Subtitle -->
            <div class="space-y-2">
              <h1 class="font-serif text-2xl md:text-3xl leading-tight tracking-tight text-left">
                {{ t.sections.saas_title }}
              </h1>
              <p class="font-sans text-neutral-400 font-extralight tracking-[0.08em] text-sm md:text-base text-left">
                {{ t.sections.saas_subtitle }}
              </p>
            </div>

            <!-- Form Stack: Modular Cards -->
            <div class="space-y-10">
              <!-- Block 1: Basic Identity & Core Info -->
              <EditSaasBasicCard
                v-model:name="name"
                v-model:category-slugs="categorySlugs"
                v-model:logo-file-base64="logoFileBase64"
                v-model:logo-url="logoUrl"
                v-model:description="description"
                v-model:website-url="websiteUrl"
                v-model:country-slug="countrySlug"
                v-model:provider="provider"
                v-model:api-key="apiKey"
                :mrr="mrr"
                :detected-mrr="detectedMrr"
                :is-mp-connecting="isMpConnecting"
                :open-mp-auth="openMpAuth"
              />

              <!-- Block 2: Value Proposition & Growth -->
              <EditSaasBentoCard
                v-model:problem-solved="problemSolved"
                v-model:value-proposition="valueProposition"
                v-model:acquisition-channels="acquisitionChannels"
                v-model:new-channel="newChannel"
                v-model:tech-stack="techStack"
                :has-bento-data="hasBentoData"
                @add-channel="addChannel"
                @remove-channel="removeChannel"
              />

              <!-- Block 3: GitHub Activity Sync -->
              <EditSaasGithubCard
                v-model:github-repo="githubRepo"
                :testing-github="testingGithub"
                :github-status="githubStatus"
                :github-message="githubMessage"
                :has-github-data="hasGithubData"
                @test="testGithubRepo"
              />

              <!-- Block 4: Frequently Asked Questions -->
              <EditSaasFaqCard
                v-model:faq-list="faqList"
                :has-faq-data="hasFaqData"
                @add-faq="addFaq"
                @remove-faq="removeFaq"
              />

              <!-- Block 5: Visibility Toggle Card (Hide vs Show) -->
              <VisibilityToggleCard
                :is-hidden="isHidden"
                :saving="saving"
                @toggle="toggleVisibility"
              />
            </div>
          </div>
        </main>
      </div>
    </div>

    <!-- Floating Success Toast Notification -->
    <EditSaasToast 
      v-model="savedSuccess" 
      :message="t.messages?.changes_saved" 
    />
  </div>
</template>
