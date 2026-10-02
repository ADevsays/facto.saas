<script setup lang="ts">
import { onMounted } from 'vue'
import { useLanguage } from '~/composables/useLanguage'
import { useFounderSession } from '~/composables/useFounderSession'
import { useAddSaasModal } from '~/composables/useAddSaasModal'
import DashboardHeader from '../components/DashboardHeader.vue'
import DashboardSidebar from '../components/DashboardSidebar.vue'
import es from '../locales/es.json'
import en from '../locales/en.json'

const { t } = useLanguage({ es, en })
const localePath = useLocalePath()
const router = useRouter()
const { open: openAddMrrModal } = useAddSaasModal()
const { founder, startups, checkSession } = useFounderSession()

function selectStartup(targetSlug: string) {
  router.push(localePath(`/dashboard/saas/${targetSlug}`))
}

onMounted(async () => {
  await checkSession()
})
</script>

<template>
  <div class="min-h-screen bg-[#030305] text-white flex flex-col selection:bg-cyan-500/30 relative isolate">
    <!-- Centered Content Wrapper (Constrained to max-w-7xl) -->
    <div class="w-full max-w-7xl mx-auto px-6 md:px-12 flex flex-col flex-1">
      
      <!-- Top Navigation Header -->
      <DashboardHeader
        :show-save-button="false"
        :avatar-url="founder?.avatar_url"
        :founder-email="founder?.email"
        :founder-name="founder?.name"
      />

      <!-- Main Workspace (Sidebar + Startups Grid) -->
      <div class="flex-1 flex flex-col md:flex-row py-6 md:py-10 gap-6 md:gap-10">
        <!-- Sidebar Navigation -->
        <DashboardSidebar
          current-section="startups"
          :current-slug="startups[0]?.slug"
          :startups-count="startups.length"
        />

        <!-- Main Content Area -->
        <main class="flex-1 w-full max-w-5xl space-y-10">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div class="space-y-2">
              <h1 class="font-serif text-2xl md:text-3xl leading-tight tracking-tight text-left">
                {{ t.sections.startups_title }}
              </h1>
              <p class="font-sans text-neutral-400 font-extralight tracking-[0.08em] text-sm md:text-base text-left">
                {{ t.sections.startups_subtitle }}
              </p>
            </div>

            <!-- Add Startup Modal Button -->
            <button
              @click="openAddMrrModal()"
              class="self-start sm:self-auto shrink-0 inline-flex items-center gap-2 bg-white text-black font-bold uppercase tracking-widest text-[10px] md:text-xs rounded-full px-4 py-2 md:px-5 md:py-2.5 transition-all duration-700 hover:scale-[1.03]"
              style="box-shadow: 0 0 15px rgba(255, 255, 255, 0.4), 0 0 25px rgba(0, 212, 255, 0.2)"
            >
              <span>{{ t.sidebar.add_startup }}</span>
            </button>
          </div>

          <!-- Startups Card Grid (Wider 2-column cards) -->
          <div v-if="startups.length > 0" class="grid grid-cols-1 md:grid-cols-2 gap-8 pt-2">
            <NuxtLink
              v-for="s in startups"
              :key="s.id"
              :to="localePath(`/dashboard/saas/${s.slug}`)"
              class="border border-white/10 bg-white/[0.02] hover:border-white/25 hover:bg-white/[0.05] rounded-3xl p-8 flex flex-col justify-between cursor-pointer transition-all duration-300 group relative shadow-lg"
            >
              <div class="space-y-5">
                <div class="flex items-center justify-between">
                  <div class="w-14 h-14 rounded-2xl bg-black border border-white/10 overflow-hidden flex items-center justify-center shadow-md">
                    <img v-if="s.logo_url" :src="s.logo_url" class="w-full h-full object-cover" />
                    <span v-else class="font-serif text-lg font-bold text-white">{{ s.name?.charAt(0) || 'S' }}</span>
                  </div>

                  <span
                    class="text-[9px] font-mono uppercase tracking-widest px-3 py-1 rounded-full border bg-white/5 text-neutral-400 border-white/10"
                  >
                    {{ t.startups_grid?.manage_badge || 'Gestionar' }}
                  </span>
                </div>

                <div>
                  <h3 class="font-serif text-xl text-white font-normal group-hover:text-[#00D4FF] transition-colors truncate">
                    {{ s.name || s.slug }}
                  </h3>
                  <p class="font-sans text-xs text-neutral-400 font-extralight tracking-wide line-clamp-2 mt-1.5">
                    {{ s.startup_type || s.description || 'No description available' }}
                  </p>
                </div>
              </div>

              <div class="pt-5 mt-5 border-t border-white/5 flex flex-wrap items-center justify-between gap-2 text-xs">
                <span class="font-mono text-neutral-500 text-[10px] truncate max-w-[160px]">/saas/{{ s.slug }}</span>
                <span class="text-neutral-400 group-hover:text-white flex items-center gap-1.5 transition-colors text-xs font-sans shrink-0">
                  <span>{{ t.startups_grid?.manage_badge || 'Gestionar' }}</span>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14"></path><path d="M12 5l7 7-7 7"></path></svg>
                </span>
              </div>
            </NuxtLink>
          </div>

          <div v-else class="py-20 text-center border border-dashed border-white/10 rounded-3xl space-y-4">
            <p class="text-neutral-400 text-sm font-sans font-light">{{ t.startups_grid?.no_startups || 'No tienes ninguna startup registrada.' }}</p>
            <button @click="openAddMrrModal()" class="inline-block text-xs text-[#00D4FF] uppercase tracking-widest hover:underline">
              {{ t.startups_grid?.add_first || 'Registra tu primera startup' }} →
            </button>
          </div>
        </main>
      </div>
    </div>
  </div>
</template>
