<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useRouter } from '#app'
import { useCategories } from '~/composables/useCategories'
import { ROUTES } from '~/utils/routes'
import HomeHeaderSection from '../sections/HomeHeaderSection.vue'
import RecentlySection from '../sections/RecentlySection.vue'
import BestSection from '../sections/BestSection.vue'
import InputMrrView from '../../input-mrr/views/InputMrrView.vue'
import RankingView from '../../ranking/views/RankingView.vue'
import AddSaasModal from '../../add-saas/components/AddSaasModal.vue'
import CategoryLinks from '~/ui/components/CategoryLinks.vue'
import CountryCardsSection from '../sections/CountryCardsSection.vue'
import ToolsTeaserSection from '../sections/ToolsTeaserSection.vue'

const router = useRouter()
const localePath = useLocalePath()
const { categories, fetchCategories } = useCategories()

onMounted(() => {
  fetchCategories()
})

const filteredCategories = computed(() => {
  return categories.value.filter(c => c.slug !== 'other').slice(0, 10)
})

function handleCategorySelect(slug: string) {
  router.push(localePath(`${ROUTES.CATEGORY}/${slug}`))
}

function handleSelectAll() {
  router.push(localePath('/saas'))
}

const widthLayout = "max-w-5xl w-full"
</script>

<template>
  <div style="zoom: 1.03">
    <!-- Primer bloque -->
    <div class="flex flex-col w-full min-w-0">
      <div :class="[widthLayout, 'flex-1 flex flex-col mx-auto px-6 min-w-0']">
        <HomeHeaderSection />
        <div class="w-full">
          <InputMrrView />
        </div>
        <RecentlySection />
      </div>
    </div>

    <!-- Bloque inferior centrado -->
    <div :class="[widthLayout, 'mx-auto px-6 flex flex-col gap-8 min-w-0']">
      <BestSection />
      <RankingView :limit="30" :show-view-all="true" />
    </div>

    <!-- Contenedor externo de ancho completo para que las categorías no se rompan -->
    <div class="w-full pb-12 pt-4 px-6 flex justify-center">
      <CategoryLinks 
        :categories="filteredCategories"
      />
    </div>

    <!-- Separador con el ancho exacto del contenido -->
    <div :class="[widthLayout, 'mx-auto px-6']">
      <div class="w-full border-b border-white/5"></div>
    </div>

    <!-- Sección de contexto de Herramientas -->
    <div :class="[widthLayout, 'mx-auto px-6']">
      <ToolsTeaserSection />
    </div>

    <!-- Country Cards Section -->
    <div :class="[widthLayout, 'mx-auto px-6']">
      <CountryCardsSection />
    </div>
  </div>

  <!-- Modal modular -->
  <AddSaasModal />
</template>
