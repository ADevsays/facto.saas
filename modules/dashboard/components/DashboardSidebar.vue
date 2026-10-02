<script setup lang="ts">
import { useLanguage } from '~/composables/useLanguage'
import { useAddSaasModal } from '~/composables/useAddSaasModal'
import { useFounderSession } from '~/composables/useFounderSession'
import { useAdPreferences } from '~/composables/useAdPreferences'
import { useAdFreeModal } from '~/composables/useAdFreeModal'
import es from '../locales/es.json'
import en from '../locales/en.json'

const { t } = useLanguage({ es, en })
const localePath = useLocalePath()
const router = useRouter()
const { open: openAddMrrModal } = useAddSaasModal()
const { logout } = useFounderSession()
const { hideAds, canHideAds, setHideAds } = useAdPreferences()
const { open: openAdFreeModal } = useAdFreeModal()

defineProps<{
  currentSection: 'saas' | 'founder' | 'startups' | 'ads'
  currentSlug?: string
  startupsCount?: number
}>()

function handleAdFreeAction() {
  if (canHideAds.value) {
    setHideAds(!hideAds.value)
    return
  }
  openAdFreeModal()
}

async function handleLogout() {
  await logout()
  router.push(localePath('/'))
}
</script>

<template>
  <div>
    <!-- Desktop Sidebar (md >= 800px) -->
    <aside class="w-56 shrink-0 hidden md:flex flex-col justify-between font-sans text-sm self-stretch">
      <div class="space-y-8">
        <nav class="space-y-2">
          <!-- Option: Edit SaaS -->
          <NuxtLink
            :to="currentSlug ? localePath(`/dashboard/saas/${currentSlug}`) : localePath('/dashboard/startups')"
            class="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-sans transition-all duration-300 text-left group"
            :class="currentSection === 'saas' ? 'bg-white/[0.08] text-white font-medium border border-white/15 shadow-sm' : 'text-neutral-400 hover:text-white hover:bg-white/[0.02]'"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" :class="currentSection === 'saas' ? 'text-[#00D4FF]' : 'text-neutral-500 group-hover:text-neutral-300'"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
            <span>{{ t.sidebar.edit_saas }}</span>
          </NuxtLink>

          <!-- Option: Founder Profile -->
          <NuxtLink
            :to="localePath('/dashboard/founder')"
            class="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-sans transition-all duration-300 text-left group"
            :class="currentSection === 'founder' ? 'bg-white/[0.08] text-white font-medium border border-white/15 shadow-sm' : 'text-neutral-400 hover:text-white hover:bg-white/[0.02]'"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" :class="currentSection === 'founder' ? 'text-[#00D4FF]' : 'text-neutral-500 group-hover:text-neutral-300'"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
            <span>{{ t.sidebar.founder_profile }}</span>
          </NuxtLink>

          <!-- Option: View All Startups -->
          <NuxtLink
            :to="localePath('/dashboard/startups')"
            class="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-sans transition-all duration-300 text-left group"
            :class="currentSection === 'startups' ? 'bg-white/[0.08] text-white font-medium border border-white/15 shadow-sm' : 'text-neutral-400 hover:text-white hover:bg-white/[0.02]'"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" :class="currentSection === 'startups' ? 'text-[#00D4FF]' : 'text-neutral-500 group-hover:text-neutral-300'"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>
            <span>{{ t.sidebar.all_startups }}</span>
            <span v-if="startupsCount !== undefined" class="ml-auto text-xs font-mono bg-white/10 px-2 py-0.5 rounded-md text-neutral-300">{{ startupsCount }}</span>
          </NuxtLink>

          <!-- Option: Manage Ads -->
          <NuxtLink
            :to="localePath('/dashboard/ads')"
            class="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-sans transition-all duration-300 text-left group"
            :class="currentSection === 'ads' ? 'bg-white/[0.08] text-white font-medium border border-white/15 shadow-sm' : 'text-neutral-400 hover:text-white hover:bg-white/[0.02]'"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" :class="currentSection === 'ads' ? 'text-[#00D4FF]' : 'text-neutral-500 group-hover:text-neutral-300'"><rect width="20" height="14" x="2" y="3" rx="2"/><line x1="8" x2="16" y1="21" y2="21"/><line x1="12" x2="12" y1="17" y2="21"/></svg>
            <span>{{ t.sidebar.manage_ads }}</span>
          </NuxtLink>
        </nav>
      </div>

      <!-- Bottom Account Actions (Aligned at bottom) -->
      <div class="pt-6 border-t border-white/10 space-y-2.5 mt-auto">
        <!-- Quitar anuncios button / toggle -->
        <button
          @click="handleAdFreeAction"
          class="w-full py-2.5 px-3.5 rounded-2xl border transition-all text-sm font-sans flex items-center justify-center gap-2 cursor-pointer"
          :class="canHideAds
            ? (hideAds ? 'border-white/10 hover:border-white/20 bg-white/[0.02] text-neutral-400 hover:text-white' : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20')
            : 'border-[#00D4FF]/30 hover:border-[#00D4FF]/60 bg-[#00D4FF]/5 hover:bg-[#00D4FF]/10 text-[#00D4FF] shadow-[0_0_20px_rgba(0,212,255,0.1)]'"
        >
          <svg v-if="canHideAds && hideAds" class="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
          <svg v-else-if="canHideAds && !hideAds" class="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
          <svg v-else class="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>
          <span class="whitespace-nowrap truncate">
            {{ canHideAds 
              ? (hideAds ? t.sidebar.show_ads : t.sidebar.hide_ads) 
              : t.sidebar.remove_ads 
            }}
          </span>
        </button>

        <button
          @click="openAddMrrModal()"
          class="w-full py-2.5 px-3.5 rounded-2xl border border-white/10 hover:border-white/20 bg-white/[0.02] text-neutral-300 hover:text-white text-sm font-sans flex items-center justify-center gap-2 transition-colors cursor-pointer"
        >
          <span>{{ t.sidebar.add_startup }}</span>
        </button>
        <button
          @click="handleLogout"
          class="w-full py-2 px-3 text-neutral-500 hover:text-rose-400 text-sm font-sans transition-colors text-center block cursor-pointer"
        >
          {{ t.sidebar.logout }}
        </button>
      </div>
    </aside>

    <!-- Mobile Horizontal Tabs (< 800px) -->
    <nav class="md:hidden flex items-center gap-2 overflow-x-auto pb-4 border-b border-white/10 custom-scrollbar mb-6">
      <NuxtLink
        :to="currentSlug ? localePath(`/dashboard/saas/${currentSlug}`) : localePath('/dashboard/startups')"
        class="shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-sans transition-all duration-300"
        :class="currentSection === 'saas' ? 'bg-white/10 text-white font-medium border border-white/20 shadow-sm' : 'text-neutral-400 bg-white/[0.02] border border-white/5 hover:text-white'"
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" :class="currentSection === 'saas' ? 'text-[#00D4FF]' : 'text-neutral-500'"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
        <span>{{ t.sidebar.edit_saas }}</span>
      </NuxtLink>

      <NuxtLink
        :to="localePath('/dashboard/founder')"
        class="shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-sans transition-all duration-300"
        :class="currentSection === 'founder' ? 'bg-white/10 text-white font-medium border border-white/20 shadow-sm' : 'text-neutral-400 bg-white/[0.02] border border-white/5 hover:text-white'"
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" :class="currentSection === 'founder' ? 'text-[#00D4FF]' : 'text-neutral-500'"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
        <span>{{ t.sidebar.founder_profile }}</span>
      </NuxtLink>

      <NuxtLink
        :to="localePath('/dashboard/startups')"
        class="shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-sans transition-all duration-300"
        :class="currentSection === 'startups' ? 'bg-white/10 text-white font-medium border border-white/20 shadow-sm' : 'text-neutral-400 bg-white/[0.02] border border-white/5 hover:text-white'"
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" :class="currentSection === 'startups' ? 'text-[#00D4FF]' : 'text-neutral-500'"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>
        <span>{{ t.sidebar.all_startups }}</span>
        <span v-if="startupsCount !== undefined" class="text-[10px] font-mono bg-white/10 px-1.5 py-0.5 rounded text-neutral-300">{{ startupsCount }}</span>
      </NuxtLink>

      <NuxtLink
        :to="localePath('/dashboard/ads')"
        class="shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-sans transition-all duration-300"
        :class="currentSection === 'ads' ? 'bg-white/10 text-white font-medium border border-white/20 shadow-sm' : 'text-neutral-400 bg-white/[0.02] border border-white/5 hover:text-white'"
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" :class="currentSection === 'ads' ? 'text-[#00D4FF]' : 'text-neutral-500'"><rect width="20" height="14" x="2" y="3" rx="2"/><line x1="8" x2="16" y1="21" y2="21"/><line x1="12" x2="12" y1="17" y2="21"/></svg>
        <span>{{ t.sidebar.manage_ads }}</span>
      </NuxtLink>

      <!-- Mobile Quitar anuncios button / toggle -->
      <button
        @click="handleAdFreeAction"
        class="shrink-0 flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-sans border transition-all cursor-pointer"
        :class="canHideAds
          ? (hideAds ? 'text-neutral-400 bg-white/[0.02] border-white/10' : 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30')
          : 'text-[#00D4FF] bg-[#00D4FF]/10 border-[#00D4FF]/25 shadow-[0_0_15px_rgba(0,212,255,0.08)]'"
      >
        <span>
          {{ canHideAds 
            ? (hideAds ? t.sidebar.show_ads : t.sidebar.hide_ads) 
            : t.sidebar.remove_ads 
          }}
        </span>
      </button>

      <button
        @click="openAddMrrModal()"
        class="shrink-0 flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-sans text-neutral-300 bg-white/[0.04] border border-white/10 cursor-pointer"
      >
        <span>{{ t.sidebar.add_startup }}</span>
      </button>

      <button
        @click="handleLogout"
        class="shrink-0 px-3.5 py-2.5 rounded-xl text-xs font-sans text-neutral-500 hover:text-rose-400 bg-white/[0.02] border border-white/5 ml-auto cursor-pointer"
      >
        {{ t.sidebar.logout }}
      </button>
    </nav>
  </div>
</template>
