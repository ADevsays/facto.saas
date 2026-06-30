<script setup lang="ts">
import { useCategories } from '~/composables/useCategories'
import { useCountries } from '~/composables/useCountries'
import { ROUTES } from '~/utils/routes'
import { onMounted } from 'vue'
const { categories, fetchCategories } = useCategories()
const { countries, fetchCountries } = useCountries()
const localePath = useLocalePath()

onMounted(() => {
  fetchCategories()
  fetchCountries()
})
</script>

<template>
  <footer class="w-full bg-[#030305] text-white pt-20 pb-12 px-6 border-t border-white/5 font-sans relative z-10 mt-auto">
    <div class="max-w-4xl mx-auto mb-20">
      
      <!-- Links Columns -->
      <div class="flex flex-col md:flex-row justify-between w-full gap-12 md:gap-0">
        
        <!-- Platform Links -->
        <div class="flex flex-col gap-5 items-center md:items-start">
          <h4 class="font-medium text-white tracking-widest uppercase text-xs text-center md:text-left">Plataforma</h4>
          <div class="flex flex-col gap-3 items-center md:items-start text-center md:text-left">
            <NuxtLink to="/info" class="text-neutral-400 hover:text-[#00D4FF] transition-colors text-[13px] font-light">Sobre facto</NuxtLink>
            <a href="/info#faq" class="text-neutral-400 hover:text-[#00D4FF] transition-colors text-[13px] font-light">Preguntas frecuentes</a>
            <NuxtLink :to="localePath('/herramientas/cuanto-vale-tu-saas')" class="text-neutral-400 hover:text-[#00D4FF] transition-colors text-[13px] font-light">Cuánto vale tu SaaS</NuxtLink>
            <NuxtLink to="/feedback" class="text-neutral-400 hover:text-[#00D4FF] transition-colors text-[13px] font-light">Reportar Error</NuxtLink>
          </div>
        </div>

        <!-- Countries Links -->
        <div class="flex flex-col gap-5 items-center md:items-start">
          <h4 class="font-medium text-white tracking-widest uppercase text-xs text-center md:text-left">Países</h4>
          <div class="flex flex-col gap-3 items-center md:items-start text-center md:text-left">
            <NuxtLink 
              v-for="country in countries.filter(c => c.slug !== 'global')" 
              :key="country.slug"
              :to="`${ROUTES.COUNTRY}/${country.slug}`" 
              class="text-neutral-400 hover:text-[#00D4FF] transition-colors text-[13px] font-light truncate max-w-[150px]"
            >
              {{ country.name }}
            </NuxtLink>
          </div>
        </div>

        <!-- Categories Links -->
        <div class="flex flex-col gap-5 items-center md:items-start">
          <h4 class="font-medium text-white tracking-widest uppercase text-xs text-center md:text-left">Categorías</h4>
          <div class="flex flex-col gap-3 items-center md:items-start text-center md:text-left">
            <NuxtLink 
              v-for="cat in categories" 
              :key="cat.slug"
              :to="`${ROUTES.CATEGORY}/${cat.slug}`" 
              class="text-neutral-400 hover:text-[#00D4FF] transition-colors text-[13px] font-light truncate max-w-[150px]"
            >
              {{ cat.name }}
            </NuxtLink>
          </div>
        </div>

        <!-- Legal Links -->
        <div class="flex flex-col gap-5 shrink-0 items-center md:items-start">
          <h4 class="font-medium text-white tracking-widest uppercase text-xs text-center md:text-left">Legal</h4>
          <div class="flex flex-col gap-3 items-center md:items-start text-center md:text-left">
            <NuxtLink to="/terminos" class="text-neutral-400 hover:text-[#00D4FF] transition-colors text-[13px] font-light">Términos</NuxtLink>
            <NuxtLink to="/privacidad" class="text-neutral-400 hover:text-[#00D4FF] transition-colors text-[13px] font-light">Privacidad</NuxtLink>
          </div>
        </div>

      </div>
    </div>

    <!-- Bottom Copyright -->
    <div class="max-w-4xl mx-auto border-t border-white/5 pt-8 flex flex-col items-center justify-center text-center">
      <p class="text-neutral-500 text-[11px] font-light tracking-widest uppercase">
        Hecho por <a href="https://www.instagram.com/a_dev_says/" target="_blank" rel="noopener noreferrer" class="hover:text-white transition-colors">Adevsays</a>
      </p>
    </div>
  </footer>
</template>
