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

const router = useRouter()
const { categories, fetchCategories } = useCategories()

onMounted(() => {
  fetchCategories()
})

const filteredCategories = computed(() => {
  return categories.value.filter(c => c.slug !== 'other').slice(0, 10)
})

function handleCategorySelect(slug: string) {
  router.push(`${ROUTES.CATEGORY}/${slug}`)
}

function handleSelectAll() {
  router.push('/saas')
}

const widthLayout = "max-w-5xl w-full"
</script>

<template>
  <div style="zoom: 1.03">
    <!-- Primer bloque -->
    <div class="flex flex-col">
      <div :class="[widthLayout, 'flex-1 flex flex-col mx-auto px-6']">
        <HomeHeaderSection />
        <div :class="[widthLayout, 'mx-auto px-6']">
          <InputMrrView />
        </div>
        <RecentlySection />
      </div>
    </div>

    <!-- Bloque inferior centrado -->
    <div :class="[widthLayout, 'mx-auto px-6 flex flex-col gap-8']">
      <BestSection />
      <RankingView />
    </div>

    <!-- Contenedor externo de ancho completo -->
    <div class="w-full pb-14 pt-4 px-6 flex justify-center">
      <CategoryLinks 
        :categories="filteredCategories"
        @select="handleCategorySelect"
        @select-all="handleSelectAll"
      />
    </div>
  </div>

  <!-- Modal modular -->
  <AddSaasModal />
</template>
