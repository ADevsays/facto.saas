<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useSaasList } from '~/composables/useSaasList'
import SaasGemCard from '../components/SaasGemCard.vue'
import { ArrowRight } from 'lucide-vue-next'

const props = defineProps<{
  currentSaasId: string
}>()

const { items, fetchAll } = useSaasList()

const moreStartups = computed(() => {
  const filtered = items.value.filter(s => s.id !== props.currentSaasId)
  if (filtered.length <= 3) return filtered
  
  const maxOffset = Math.max(0, filtered.length - 3)
  const offset = Math.min(randomOffset.value, maxOffset)
  return filtered.slice(offset, offset + 3)
})

const randomOffset = ref(0)

onMounted(() => {
  fetchAll()
  randomOffset.value = Math.floor(Math.random() * 20)
})
</script>

<template>
  <div class="w-full max-w-5xl mt-24 pt-16 border-t border-white/5 flex flex-col items-center">
    
    <!-- Header with Title and Button -->
    <div class="w-full flex items-end justify-between mb-10 border-b border-white/5 pb-4">
      <h2 class="font-serif text-3xl text-white tracking-tight">
        Mira más <span class="text-transparent bg-clip-text bg-gradient-to-r from-white to-[#00D4FF]/70 drop-shadow-[0_0_15px_rgba(0,212,255,0.4)]">startups</span>
      </h2>
      
      <NuxtLink to="/saas" class="group flex items-center gap-2 text-xs font-sans tracking-widest uppercase text-neutral-400 hover:text-white transition-colors mb-1">
        Ver startups
        <ArrowRight class="w-4 h-4 text-neutral-500 group-hover:text-[#00D4FF] transition-all duration-300 group-hover:translate-x-1" />
      </NuxtLink>
    </div>

    <!-- Cards Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 w-full relative z-10">
      <SaasGemCard 
        v-for="(s, index) in moreStartups" 
        :key="s.id" 
        :saas="s"
        :index="index"
      />
    </div>
  </div>
</template>
