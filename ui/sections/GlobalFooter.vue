<script setup lang="ts">
import { useCategories } from '~/composables/useCategories'
import { useLoginModal } from '~/composables/useLoginModal'
import { useFounderSession } from '~/composables/useFounderSession'
import { ROUTES } from '~/utils/routes'
import { onMounted } from 'vue'

const { t } = useI18n()
const { categories, fetchCategories } = useCategories()
const { open: openLoginModal } = useLoginModal()
const { isAuthenticated } = useFounderSession()
const localePath = useLocalePath()
const router = useRouter()

function handleLoginClick() {
  if (isAuthenticated.value) {
    router.push(localePath('/dashboard'))
  } else {
    openLoginModal()
  }
}

onMounted(() => {
  fetchCategories()
})
</script>

<template>
  <footer class="w-full bg-[#030305] text-white pt-20 pb-12 px-6 border-t border-white/5 font-sans relative z-10 mt-auto">
    <div class="max-w-4xl mx-auto mb-20">
      
      <!-- Links Columns -->
      <div class="flex flex-col md:flex-row justify-between w-full gap-12 md:gap-0">
        
        <!-- Columna 1: Brand, Herramientas y Plataforma -->
        <div class="flex flex-col gap-6 items-start shrink-0">
          <!-- Logo Facto a Home -->
          <NuxtLink :to="localePath('/')" class="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <img src="/favicon.svg" alt="Facto" class="w-4 h-4" />
            <span class="font-sans font-bold tracking-widest uppercase text-sm text-white">facto</span>
          </NuxtLink>

          <!-- Herramientas Links -->
          <div class="flex flex-col gap-3 items-start text-left">
            <h4 class="font-medium text-white tracking-widest uppercase text-xs text-left mb-1">{{ t('footer.tools') }}</h4>
            <NuxtLink :to="localePath('/herramientas/cuanto-vale-tu-saas')" class="text-neutral-400 hover:text-[#00D4FF] transition-colors text-[13px] font-light">{{ t('footer.valuation_calc') }}</NuxtLink>
            <NuxtLink :to="localePath('/herramientas/generador-de-facturas')" class="text-neutral-400 hover:text-[#00D4FF] transition-colors text-[13px] font-light">{{ t('footer.invoice_gen') }}</NuxtLink>
            <NuxtLink :to="localePath('/herramientas/descargar-miniaturas-youtube')" class="text-neutral-400 hover:text-[#00D4FF] transition-colors text-[13px] font-light">{{ t('footer.youtube_thumb') }}</NuxtLink>
          </div>

          <!-- Plataforma Links -->
          <div class="flex flex-col gap-3 items-start text-left pt-2">
            <h4 class="font-medium text-white tracking-widest uppercase text-xs text-left mb-1">{{ t('footer.platform') }}</h4>
            <NuxtLink :to="localePath('/info')" class="text-neutral-400 hover:text-[#00D4FF] transition-colors text-[13px] font-light">{{ t('footer.about') }}</NuxtLink>
            <NuxtLink :to="localePath('/ranking')" class="text-neutral-400 hover:text-[#00D4FF] transition-colors text-[13px] font-light">Ranking</NuxtLink>
            <NuxtLink :to="localePath('/stats')" class="text-neutral-400 hover:text-[#00D4FF] transition-colors text-[13px] font-light">Estadísticas</NuxtLink>
            <NuxtLink :to="localePath(ROUTES.COUNTRY)" class="text-neutral-400 hover:text-[#00D4FF] transition-colors text-[13px] font-light">{{ t('footer.world') }}</NuxtLink>
            <a :href="localePath('/info') + '#faq'" class="text-neutral-400 hover:text-[#00D4FF] transition-colors text-[13px] font-light">{{ t('footer.faq') }}</a>
            <a href="https://t.me/factosaas" target="_blank" rel="noopener noreferrer" class="text-neutral-400 hover:text-[#00D4FF] transition-colors text-[13px] font-light flex items-center gap-1.5 group">
              <span>{{ t('footer.telegram') }}</span>
              <svg class="w-3 h-3 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                <polyline points="15 3 21 3 21 9"></polyline>
                <line x1="10" y1="14" x2="21" y2="3"></line>
              </svg>
            </a>
            <NuxtLink :to="localePath('/feedback')" class="text-neutral-400 hover:text-[#00D4FF] transition-colors text-[13px] font-light">{{ t('footer.report_error') }}</NuxtLink>
            <button
              type="button"
              @click="handleLoginClick"
              class="text-neutral-400 hover:text-[#00D4FF] transition-colors text-[13px] font-light text-left cursor-pointer"
            >
              {{ t('footer.have_account_login') }}
            </button>
          </div>
        </div>

        <!-- Categories Links -->
        <div class="flex flex-col gap-5 items-start">
          <h4 class="font-medium text-white tracking-widest uppercase text-xs text-left">{{ t('footer.categories') }}</h4>
          <ClientOnly fallback-tag="div">
            <div class="flex flex-col gap-3 items-start text-left">
              <NuxtLink 
                v-for="cat in categories" 
                :key="cat.slug"
                :to="localePath(`${ROUTES.CATEGORY}/${cat.slug}`)" 
                class="text-neutral-400 hover:text-[#00D4FF] transition-colors text-[13px] font-light truncate max-w-[150px]"
              >
                {{ cat.name }}
              </NuxtLink>
            </div>
            <template #fallback>
              <div class="flex flex-col gap-3 items-start text-left"></div>
            </template>
          </ClientOnly>
        </div>

        <!-- Legal & Countries Links -->
        <div class="flex flex-col gap-5 shrink-0 items-start">
          <h4 class="font-medium text-white tracking-widest uppercase text-xs text-left">{{ t('footer.legal') }}</h4>
          <div class="flex flex-col gap-3 items-start text-left">
            <NuxtLink :to="localePath('/terminos')" class="text-neutral-400 hover:text-[#00D4FF] transition-colors text-[13px] font-light">{{ t('footer.terms') }}</NuxtLink>
            <NuxtLink :to="localePath('/privacidad')" class="text-neutral-400 hover:text-[#00D4FF] transition-colors text-[13px] font-light">{{ t('footer.privacy') }}</NuxtLink>
          </div>

          <h4 class="font-medium text-white tracking-widest uppercase text-xs text-left pt-2">{{ t('footer.countries') }}</h4>
          <div class="flex flex-col gap-3 items-start text-left">
            <NuxtLink 
              :to="localePath(`${ROUTES.CONTINENT}/america`)" 
              class="text-neutral-400 hover:text-[#00D4FF] transition-colors text-[13px] font-light"
            >
              {{ t('footer.america') }}
            </NuxtLink>
            <NuxtLink 
              :to="localePath(`${ROUTES.CONTINENT}/europa`)" 
              class="text-neutral-400 hover:text-[#00D4FF] transition-colors text-[13px] font-light"
            >
              {{ t('footer.europe') }}
            </NuxtLink>
            <NuxtLink 
              :to="localePath(`${ROUTES.CONTINENT}/asia`)" 
              class="text-neutral-400 hover:text-[#00D4FF] transition-colors text-[13px] font-light"
            >
              {{ t('footer.asia') }}
            </NuxtLink>
            <NuxtLink 
              :to="localePath(ROUTES.COUNTRY)" 
              class="text-neutral-400 hover:text-[#00D4FF] transition-colors text-[13px] font-light"
            >
              {{ t('footer.all_countries') }}
            </NuxtLink>
          </div>
        </div>

      </div>
    </div>

    <!-- Bottom Copyright -->
    <div class="max-w-4xl mx-auto border-t border-white/5 pt-8 flex flex-col items-center justify-center text-center">
      <p class="text-neutral-500 text-[11px] font-light tracking-widest uppercase">
        {{ t('footer.made_by') }} <a href="https://www.instagram.com/a_dev_says/" target="_blank" rel="noopener noreferrer" class="hover:text-white transition-colors">Adevsays</a>
      </p>
    </div>
  </footer>
</template>
