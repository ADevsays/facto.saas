<script setup lang="ts">
import { onMounted } from 'vue'
import { useLanguage } from '~/composables/useLanguage'
import { useFounderSession } from '~/composables/useFounderSession'
import { useDashboardFounder } from '../composables/useDashboardFounder'
import DashboardHeader from '../components/DashboardHeader.vue'
import DashboardSidebar from '../components/DashboardSidebar.vue'
import CountrySelect from '~/ui/components/CountrySelect.vue'
import es from '../locales/es.json'
import en from '../locales/en.json'

const { t } = useLanguage({ es, en })
const { founder, startups, checkSession } = useFounderSession()
const {
  founderName,
  founderBio,
  founderAvatarUrl,
  founderAvatarBase64,
  founderCountrySlug,
  founderTwitterUrl,
  founderLinkedinUrl,
  founderInstagramUrl,
  isDraggingAvatar,
  avatarFileInput,
  saving,
  savedSuccess,
  errorMessage,
  syncFromSession,
  triggerAvatarInput,
  onAvatarFileChange,
  onAvatarDrop,
  saveFounderProfile
} = useDashboardFounder()

onMounted(async () => {
  await checkSession()
  syncFromSession()
})
</script>

<template>
  <div class="min-h-screen bg-[#030305] text-white flex flex-col selection:bg-cyan-500/30 relative isolate">
    <!-- Centered Content Wrapper (Constrained to max-w-7xl) -->
    <div class="w-full max-w-7xl mx-auto px-6 md:px-12 flex flex-col flex-1">
      
      <!-- Top Navigation Header -->
      <DashboardHeader
        :saving="saving"
        :saved-success="savedSuccess"
        :show-save-button="true"
        :avatar-url="founderAvatarBase64 || founder?.avatar_url"
        :founder-email="founder?.email"
        :founder-name="founderName || founder?.name"
        @save="saveFounderProfile"
      />

      <!-- Main Workspace (Sidebar + Form Content) -->
      <div class="flex-1 flex flex-col md:flex-row py-6 md:py-10 gap-6 md:gap-10">
        <!-- Sidebar Navigation -->
        <DashboardSidebar
          current-section="founder"
          :current-slug="startups[0]?.slug"
          :startups-count="startups.length"
        />

        <!-- Main Content Area -->
        <main class="flex-1 w-full max-w-4xl space-y-10">
          <!-- Notification Banners -->
          <div v-if="savedSuccess" class="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm font-sans flex items-center gap-3 animate-fade-in">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
            <span>{{ t.messages?.changes_saved || 'Perfil actualizado correctamente.' }}</span>
          </div>

          <div v-if="errorMessage" class="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm font-sans flex items-center gap-3 animate-fade-in">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
            <span>{{ errorMessage }}</span>
          </div>

          <!-- Section Title & Subtitle -->
          <div class="space-y-2">
            <h1 class="font-serif text-2xl md:text-3xl leading-tight tracking-tight text-left">
              {{ t.sections.founder_title }}
            </h1>
            <p class="font-sans text-neutral-400 font-extralight tracking-[0.08em] text-sm md:text-base text-left">
              {{ t.sections.founder_subtitle }}
            </p>
          </div>

          <!-- Founder Form Card -->
          <section class="bg-surface-elevated border border-white/10 rounded-3xl p-8 md:p-10 space-y-6 transition-all duration-300 hover:border-white/15">
            <div class="flex items-center justify-between pb-4 border-b border-white/5">
              <h2 class="font-serif text-lg md:text-2xl text-white font-normal">{{ t.sections.founder_title }}</h2>
            </div>

            <!-- Full Name & Country Row (Full Width Input pushing Country to the end) -->
            <div class="flex flex-col sm:flex-row items-stretch sm:items-end gap-4">
              <div class="flex-1 space-y-2">
                <label class="block text-[10px] font-sans font-medium uppercase tracking-[0.2em] text-neutral-400">{{ t.fields.founder_name }}</label>
                <input
                  v-model="founderName"
                  type="text"
                  :placeholder="t.fields.founder_name_placeholder"
                  class="w-full bg-surface-dark border border-white/10 rounded-xl px-4 py-3.5 text-white text-sm focus:outline-none focus:border-[#00D4FF]/60 transition-colors h-[50px]"
                />
              </div>

              <div class="shrink-0 space-y-2">
                <label class="block text-[10px] font-sans font-medium uppercase tracking-[0.2em] text-neutral-400">{{ t.fields.country }}</label>
                <CountrySelect v-model="founderCountrySlug" dark-background />
              </div>
            </div>

            <!-- Profile Picture Upload Dropzone (File Upload instead of URL) -->
            <div class="space-y-2">
              <label class="block text-[10px] font-sans font-medium uppercase tracking-[0.2em] text-neutral-400">{{ t.fields.founder_avatar }}</label>
              <div
                class="w-full border border-dashed rounded-2xl p-8 flex flex-col items-center justify-center gap-3.5 cursor-pointer transition-all duration-300 text-center relative group"
                :class="isDraggingAvatar ? 'border-[#00D4FF] bg-[#00D4FF]/5' : 'border-white/15 bg-surface-dark hover:border-white/30 hover:bg-surface-dark/80'"
                @click="triggerAvatarInput"
                @dragover.prevent="isDraggingAvatar = true"
                @dragleave.prevent="isDraggingAvatar = false"
                @drop.prevent="onAvatarDrop"
              >
                <input
                  ref="avatarFileInput"
                  type="file"
                  accept="image/*"
                  class="hidden"
                  @change="onAvatarFileChange"
                />

                <div v-if="founderAvatarBase64 || founderAvatarUrl" class="w-20 h-20 rounded-full border-2 border-white/20 bg-black overflow-hidden flex items-center justify-center relative shadow-lg">
                  <img :src="founderAvatarBase64 || founderAvatarUrl" class="w-full h-full object-cover" />
                </div>

                <div v-else class="w-16 h-16 rounded-full bg-white/[0.04] border border-white/10 flex items-center justify-center text-neutral-400 group-hover:text-white transition-colors">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                </div>

                <div>
                  <p class="text-xs font-sans text-neutral-200 font-normal group-hover:text-white transition-colors">
                    {{ founderAvatarBase64 ? t.fields.founder_avatar_ready : t.fields.founder_avatar_dropzone }}
                  </p>
                  <span class="text-[10px] font-sans text-neutral-500 tracking-wider block mt-1">
                    {{ t.fields.founder_avatar_formats }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Short Bio -->
            <div class="space-y-2">
              <label class="block text-[10px] font-sans font-medium uppercase tracking-[0.2em] text-neutral-400">{{ t.fields.founder_bio }}</label>
              <textarea
                v-model="founderBio"
                rows="3"
                :placeholder="t.fields.founder_bio_placeholder"
                class="w-full bg-surface-dark border border-white/10 rounded-xl px-4 py-3 text-white text-sm font-extralight focus:outline-none focus:border-[#00D4FF]/60 transition-colors custom-scrollbar"
              ></textarea>
            </div>

            <!-- Social Links Grid -->
            <div class="space-y-4 pt-4 border-t border-white/5">
              <label class="block text-[10px] font-sans font-medium uppercase tracking-[0.2em] text-neutral-400">{{ t.fields.founder_socials }}</label>
              
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div class="space-y-1.5">
                  <label class="block text-[9px] font-mono text-neutral-500">Twitter / X</label>
                  <input
                    v-model="founderTwitterUrl"
                    type="url"
                    placeholder="https://x.com/tu-usuario"
                    class="w-full bg-surface-dark border border-white/10 rounded-xl px-4 py-2.5 text-white text-xs font-mono focus:outline-none focus:border-[#00D4FF]/60"
                  />
                </div>

                <div class="space-y-1.5">
                  <label class="block text-[9px] font-mono text-neutral-500">LinkedIn</label>
                  <input
                    v-model="founderLinkedinUrl"
                    type="url"
                    placeholder="https://linkedin.com/in/tu-perfil"
                    class="w-full bg-surface-dark border border-white/10 rounded-xl px-4 py-2.5 text-white text-xs font-mono focus:outline-none focus:border-[#00D4FF]/60"
                  />
                </div>

                <div class="space-y-1.5">
                  <label class="block text-[9px] font-mono text-neutral-500">Instagram</label>
                  <input
                    v-model="founderInstagramUrl"
                    type="url"
                    placeholder="https://instagram.com/tu-perfil"
                    class="w-full bg-surface-dark border border-white/10 rounded-xl px-4 py-2.5 text-white text-xs font-mono focus:outline-none focus:border-[#00D4FF]/60"
                  />
                </div>
              </div>
            </div>
          </section>

        </main>
      </div>
    </div>

    <!-- Floating Success Toast Notification -->
    <Teleport to="body">
      <Transition name="toast">
        <div 
          v-if="savedSuccess" 
          class="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 z-[100] flex items-center gap-3.5 bg-surface-elevated border border-emerald-500/40 rounded-2xl px-5 py-3.5 shadow-2xl shadow-black text-white text-sm font-sans backdrop-blur-2xl"
          style="box-shadow: 0 10px 40px rgba(0,0,0,0.9), 0 0 25px rgba(16, 185, 129, 0.2);"
        >
          <div class="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>
          <div class="flex flex-col pr-2">
            <span class="font-medium text-white text-xs md:text-sm">{{ t.messages?.founder_saved || 'Perfil actualizado correctamente.' }}</span>
            <span class="text-[10px] text-neutral-400 font-extralight tracking-wide">Tu información pública está al día</span>
          </div>
          <button 
            @click="savedSuccess = false" 
            class="text-neutral-500 hover:text-white transition-colors text-xs p-1 ml-1"
          >
            ✕
          </button>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 10px; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(0, 212, 255, 0.3); }

.toast-enter-active,
.toast-leave-active {
  transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}
.toast-enter-from {
  opacity: 0;
  transform: translateY(20px) scale(0.95);
}
.toast-leave-to {
  opacity: 0;
  transform: translateY(10px) scale(0.98);
}
</style>
