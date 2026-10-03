<script setup lang="ts">
import { Analytics } from '@vercel/analytics/nuxt'
import AdsBandSection from '~/modules/ads/sections/AdsBandSection.vue'
import AdsBandBottomSection from '~/modules/ads/sections/AdsBandBottomSection.vue'
import AddSaasModal from '~/modules/add-saas/components/AddSaasModal.vue'
import AddAdModal from '~/modules/ads/components/AddAdModal.vue'
import AdAuctionListModal from '~/modules/ads/components/AdAuctionListModal.vue'
import AdFreeModal from '~/modules/ads/components/AdFreeModal.vue'
import LoginModal from '~/components/LoginModal.vue'
import TelegramPopup from '~/components/TelegramPopup.vue'
import GlobalFooter from '~/ui/sections/GlobalFooter.vue'
import { useAddAdModal } from '~/composables/useAddAdModal'
import { useLanguage } from '~/composables/useLanguage'
import { useAdPreferences } from '~/composables/useAdPreferences'
import { useFounderSession } from '~/composables/useFounderSession'
import { useLoginModal } from '~/composables/useLoginModal'

const route = useRoute()
const isInfoPage = computed(() => route.path === '/info')

useHead({
  script: [
    {
      innerHTML: `!function(w,d,s,u,n,a,b){if(w[n])return;a=w[n]={q:[],t:+new Date,s:[],o:u,track:function(){a.q.push([+new Date].concat([].slice.call(arguments)))},setScope:function(){a.s=[].slice.call(arguments).filter(function(x){return typeof x==="string"});a.q.push([+new Date,"setScope"].concat(a.s))},scope:function(){var c=[].slice.call(arguments);return{track:function(){a.q.push([+new Date].concat([].slice.call(arguments)).concat([{__scope:c}]))}}}};b=d.createElement(s);b.async=1;b.src=u+"/s.js";d.getElementsByTagName(s)[0].parentNode.insertBefore(b,d.getElementsByTagName(s)[0])}(window,document,"script","https://t.whop.tw","whop");whop.setScope("biz_LGcptk06n8Q82U");whop.track("page");`
    }
  ]
})

watch(() => route.fullPath, () => {
  if (import.meta.client && typeof window !== 'undefined' && (window as any).whop) {
    (window as any).whop.track('page')
  }
})

const { openForSetup } = useAddAdModal()
const { detectLanguage } = useLanguage()
const { showAds, checkPreferences } = useAdPreferences()
const { checkSession } = useFounderSession()
const { open: openLoginModal } = useLoginModal()

const checkLoginQuery = () => {
  if (route.query.login === '1') {
    openLoginModal()
    if (typeof window !== 'undefined') {
      const nextQuery = { ...route.query }
      delete nextQuery.login
      const search = new URLSearchParams(nextQuery as any).toString()
      const newUrl = window.location.pathname + (search ? `?${search}` : '')
      window.history.replaceState({}, document.title, newUrl)
    }
  }
}

onMounted(async () => {
  await Promise.all([
    checkSession(),
    checkPreferences()
  ])

  if (route.path === '/') {
    await detectLanguage()
  }

  checkLoginQuery()

  if (route.query.ad_setup === 'true') {
    const slot = route.query.slot ? Number(route.query.slot) : undefined
    const token = typeof route.query.token === 'string' ? route.query.token : undefined
    openForSetup(slot, token)

    if (typeof window !== 'undefined') {
      window.history.replaceState({}, document.title, window.location.pathname)
    }
  }
})

watch(() => route.query.login, () => {
  checkLoginQuery()
})
</script>

<template>
  <div class="min-h-screen bg-[#030305] text-white font-sans selection:bg-cyan-500/30 pb-16 md:pb-0">
    <AdsBandSection v-if="!isInfoPage && showAds" />
    <slot />
    <Analytics />
    <AddSaasModal />
    <AddAdModal />
    <AdAuctionListModal />
    <LoginModal />
    <AdFreeModal />
    <TelegramPopup />
    <AdsBandBottomSection v-if="!isInfoPage && showAds" />
    <GlobalFooter v-if="!isInfoPage" />
  </div>
</template>

<style>
/* Reset global y transiciones base */
html, body {
  margin: 0;
  padding: 0;
  background-color: #030305;
}

/* Scrollbar custom */
::-webkit-scrollbar {
  width: 4px;
  height: 4px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.08);
  border-radius: 999px;
  transition: background 0.3s ease;
}
::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 212, 255, 0.35);
  box-shadow: 0 0 6px rgba(0, 212, 255, 0.3);
}
/* Firefox */
* {
  scrollbar-width: thin;
  scrollbar-color: rgba(255,255,255,0.08) transparent;
}

.page-enter-active,
.page-leave-active {
  transition: opacity 0.2s ease;
}
.page-enter-from,
.page-leave-to {
  opacity: 0;
}

.glass-fluid-btn {
    color: #fff;
    background: linear-gradient(
        120deg, 
        rgba(255, 255, 255, 0) 30%, 
        rgba(255, 255, 255, 0.15) 50%, 
        rgba(255, 255, 255, 0) 70%
    );
    background-size: 200% auto;
    border: 1px solid rgba(255, 255, 255, 0.1);
    animation: shine 12s ease-in-out infinite;
    transition: all 0.4s ease;
}

.glass-fluid-btn:hover {
    border-color: rgba(0, 212, 255, 0.5);
    background-color: rgba(0, 212, 255, 0.1);
    transform: translateY(-1px);
    box-shadow: 0 0 20px rgba(0, 212, 255, 0.1);
}

@keyframes shine {
    0% { background-position: -100% 0; }
    100% { background-position: 100% 0; }
}
</style>
