<script setup lang="ts">
import HomeHeaderSection from '../sections/HomeHeaderSection.vue'
import RecentlySection from '../sections/RecentlySection.vue'
import BestSection from '../sections/BestSection.vue'
import InputMrrView from '../../input-mrr/views/InputMrrView.vue'
import AdsView from '../../ads/views/AdsView.vue'
import RankingView from '../../ranking/views/RankingView.vue'
const widthLayout = "max-w-5xl w-full"
</script>

<template>
  <NuxtLayout>
    <main class="min-h-screen bg-[#030305] text-white">
      <AdsView />

      <!-- Primer bloque: ocupa la primera mitad de la pantalla, input al centro -->
      <div class="min-h-screen flex flex-col ">
        <div :class="[widthLayout, 'flex-1 flex flex-col mx-auto px-6']">
          <HomeHeaderSection />
          <RecentlySection />
        </div>
        <div :class="[widthLayout, 'mx-auto px-6']">
          <InputMrrView />
        </div>
      </div>

      <!-- Ads: full-width, sin márgenes -->

      <!-- Bloque inferior centrado -->
      <div :class="[widthLayout, 'mx-auto px-6']">
        <BestSection />
        <RankingView />
      </div>

    </main>
  </NuxtLayout>
</template>
