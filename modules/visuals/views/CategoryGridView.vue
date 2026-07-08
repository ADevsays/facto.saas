<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from '#app'
import { useCategories } from '~/composables/useCategories'
import { ROUTES } from '~/utils/routes'
import SaasBreadcrumb from '../components/SaasBreadcrumb.vue'
import InputMrrView from '../../input-mrr/views/InputMrrView.vue'
import CategoryCardSkeleton from '../components/CategoryCardSkeleton.vue'

import {
  Megaphone,
  Sparkles,
  Database,
  Briefcase,
  DollarSign,
  PieChart,
  PawPrint,
  Truck,
  Building,
  Heart,
  CheckCircle,
  Music,
  MessageSquare,
  Shield,
  Utensils,
  Users,
  Box
} from 'lucide-vue-next'
import { computed } from 'vue'

const router = useRouter()
const { categories, fetchCategories, loading } = useCategories()

onMounted(fetchCategories)

function goToCategory(slug: string) {
  router.push(`${ROUTES.CATEGORY}/${slug}`)
}

function getIconComponent(slug: string) {
  const icons: Record<string, any> = {
    'marketing': Megaphone,
    'ai': Sparkles,
    'big-data': Database,
    'gestion': Briefcase,
    'ventas': DollarSign,
    'finanzas': PieChart,
    'animales': PawPrint,
    'envios': Truck,
    'negocios': Building,
    'salud': Heart,
    'productividad': CheckCircle,
    'musica': Music,
    'mensajes': MessageSquare,
    'seguridad': Shield,
    'restaurantes': Utensils,
    'crm': Users,
  }
  return icons[slug] || Box
}

const mappedCategories = computed(() => {
  return categories.value.map(cat => ({
    ...cat,
    iconComponent: getIconComponent(cat.slug)
  }))
})
</script>

<template>
  <main class="min-h-screen bg-[#030305] text-white relative isolate pt-14 pb-20 px-6 flex flex-col items-center">
    <!-- Background glow -->
    <div class="absolute inset-0 z-[-1] pointer-events-none flex justify-center items-start pt-20 overflow-hidden">
      <div class="w-[80vw] h-[40vw] max-w-[800px] max-h-[400px] bg-[#00D4FF]/5 rounded-full blur-[120px] opacity-40"></div>
    </div>

    <div class="w-full max-w-5xl flex flex-col">
      <SaasBreadcrumb is-category />

      <div class="mt-10 mb-12 flex flex-col items-start border-b border-white/5 pb-8">
        <h1 class="font-serif text-4xl md:text-5xl font-normal leading-tight tracking-tight text-white">
          Explora por <span class="text-transparent bg-clip-text bg-gradient-to-r from-white to-[#00D4FF]/70 drop-shadow-[0_0_15px_rgba(0,212,255,0.4)]">Categoría</span>
        </h1>
        <p class="mt-6 font-sans font-extralight text-sm text-neutral-400">
          Encuentra el SaaS perfecto para cada necesidad en nuestra colección de startups.
        </p>
      </div>

      <div v-if="loading" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 relative z-10">
        <CategoryCardSkeleton v-for="i in 16" :key="i" />
      </div>

      <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 relative z-10">
        <button
          v-for="cat in mappedCategories"
          :key="cat.slug"
          @click="goToCategory(cat.slug)"
          class="group relative bg-white/[0.02] border border-white/5 rounded-2xl p-5 flex flex-col items-start text-left transition-colors duration-300 hover:bg-white/[0.04] hover:border-white/10 outline-none"
        >
          <div class="flex items-center gap-3 w-full">
            <component :is="cat.iconComponent" :size="20" class="text-neutral-400 group-hover:text-[#00D4FF] transition-colors duration-300 shrink-0" />
            <h3 class="font-sans font-medium text-base text-white truncate group-hover:text-[#00D4FF] transition-colors duration-300">
              {{ cat.name }}
            </h3>
          </div>
          <p v-if="cat.description" class="hidden mt-2 text-xs font-sans text-neutral-500 font-light line-clamp-2 leading-relaxed">
            {{ cat.description }}
          </p>
        </button>
      </div>

      <!-- Add MRR Component -->
      <div class="mt-12 relative z-10">
        <InputMrrView />
      </div>
    </div>
  </main>
</template>
