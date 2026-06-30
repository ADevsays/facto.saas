<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from '#app'
import { useCountries } from '~/composables/useCountries'
import SaasBreadcrumb from '../components/SaasBreadcrumb.vue'
import InputMrrView from '../../input-mrr/views/InputMrrView.vue'
import CategoryCardSkeleton from '../components/CategoryCardSkeleton.vue'

const router = useRouter()
const { countries, fetchCountries } = useCountries()

onMounted(fetchCountries)

function goToCountry(slug: string) {
  router.push(`/saas/pais/${slug}`)
}
</script>

<template>
  <main class="min-h-screen bg-[#030305] text-white relative isolate pt-14 pb-20 px-6 flex flex-col items-center">
    <!-- Background glow -->
    <div class="absolute inset-0 z-[-1] pointer-events-none flex justify-center items-start pt-20 overflow-hidden">
      <div class="w-[80vw] h-[40vw] max-w-[800px] max-h-[400px] bg-[#00D4FF]/5 rounded-full blur-[120px] opacity-40"></div>
    </div>

    <div class="w-full max-w-5xl flex flex-col">
      <SaasBreadcrumb is-country />

      <div class="mt-10 mb-12 flex flex-col items-start border-b border-white/5 pb-8">
        <h1 class="font-serif text-4xl md:text-5xl font-normal leading-tight tracking-tight text-white">
          Explora por <span class="text-transparent bg-clip-text bg-gradient-to-r from-white to-[#00D4FF]/70 drop-shadow-[0_0_15px_rgba(0,212,255,0.4)]">País</span>
        </h1>
        <p class="mt-6 font-sans font-extralight text-sm text-neutral-400">
          Descubre cuáles son las startups más rentables en cada región del mundo.
        </p>
      </div>

      <!-- We don't have a loading state variable in useCountries composable natively, but fetchCountries is fast since it caches -->
      <div v-if="!countries.length" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 relative z-10">
        <CategoryCardSkeleton v-for="i in 16" :key="i" />
      </div>

      <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 relative z-10">
        <button
          v-for="country in countries.filter(c => c.slug !== 'global')"
          :key="country.slug"
          @click="goToCountry(country.slug)"
          class="group relative bg-white/[0.02] border border-white/5 rounded-2xl p-5 flex flex-col items-start text-left transition-colors duration-300 hover:bg-white/[0.04] hover:border-white/10 outline-none"
        >
          <div class="flex items-center gap-3 w-full">
            <div class="shrink-0 flex justify-center w-6">
              <img 
                v-if="country.iso_code" 
                :src="`https://flagcdn.com/w40/${country.iso_code}.png`" 
                :alt="country.name"
                class="w-6 rounded-sm shadow-sm"
              />
              <span v-else class="text-2xl leading-none">{{ country.flag }}</span>
            </div>
            
            <h3 class="font-sans font-medium text-base text-white truncate group-hover:text-[#00D4FF] transition-colors duration-300">
              {{ country.name }}
            </h3>
          </div>
        </button>
      </div>

      <!-- Add MRR Component -->
      <div class="mt-12 relative z-10">
        <InputMrrView />
      </div>
    </div>
  </main>
</template>
