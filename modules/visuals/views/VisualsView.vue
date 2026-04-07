<script setup lang="ts">
import HomeHeaderSection from '../sections/HomeHeaderSection.vue'
import RecentlySection from '../sections/RecentlySection.vue'
import BestSection from '../sections/BestSection.vue'
import InputMrrView from '../../input-mrr/views/InputMrrView.vue'
import AdsView from '../../ads/views/AdsView.vue'
import RankingView from '../../ranking/views/RankingView.vue'
import AddSaasModal from '../../add-saas/components/AddSaasModal.vue'
const widthLayout = "max-w-5xl w-full"
</script>

<template>
<template>
  <div style="zoom: 1.03">
    <!-- Primer bloque -->
    <div class="flex flex-col">
      <div :class="[widthLayout, 'flex-1 flex flex-col mx-auto px-6']">
        <HomeHeaderSection />
        <RecentlySection />
      </div>
      <div :class="[widthLayout, 'mx-auto px-6']">
        <InputMrrView />
      </div>
    </div>

    <!-- Bloque inferior centrado -->
    <div :class="[widthLayout, 'mx-auto px-6']">
      <BestSection />
      <RankingView />
    </div>
  </div>

  <!-- Modal modular -->
  <AddSaasModal />
</template>
</template>
