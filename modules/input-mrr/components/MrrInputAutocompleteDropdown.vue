<script setup lang="ts">
defineProps<{
  isOpen: boolean
  loading: boolean
  results: any[]
  localQuery: string
}>()

const emit = defineEmits<{
  (e: 'clickItem', item: any): void
}>()
</script>

<template>
  <div
    v-if="isOpen && localQuery.trim().length > 0"
    class="absolute top-full left-0 right-0 mt-2 bg-black/50 backdrop-blur-md border border-white/20 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] z-50 overflow-hidden flex flex-col"
  >
    <!-- Subtitle "Startups" at the very top -->
    <div class="px-4 py-2 border-b border-white/10 flex items-center justify-center shrink-0">
      <span class="text-[9px] font-sans font-extralight tracking-[0.15em] text-neutral-300 uppercase">Startups</span>
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="p-4 flex flex-col gap-3">
      <div v-for="i in 3" :key="i" class="flex items-center gap-3 animate-pulse">
        <div class="w-10 h-10 rounded-lg bg-white/5 border border-white/10"></div>
        <div class="flex-1 flex flex-col gap-2">
          <div class="h-3 bg-white/10 rounded w-1/3"></div>
          <div class="h-2 bg-white/5 rounded w-2/3"></div>
        </div>
      </div>
    </div>

    <!-- Empty state -->
    <div v-else-if="results.length === 0" class="p-6 text-center text-neutral-500 text-xs font-sans tracking-wider uppercase">
      No se encontraron startups
    </div>

    <!-- Results list -->
    <div v-else class="overflow-y-auto max-h-[300px] py-1">
      <template v-for="item in results" :key="item.id">
        <!-- Incognito item -->
        <div
          v-if="item.isIncognito"
          class="flex items-center gap-3 px-4 py-3 text-left transition-all duration-300 cursor-default"
        >
          <!-- Logo -->
          <div class="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
            <div class="text-xs font-bold font-sans text-neutral-400 select-none">
              —
            </div>
          </div>

          <!-- Details -->
          <div class="flex-1 min-w-0">
            <span class="text-white font-sans text-sm font-medium truncate block">
              — Anónimo —
            </span>
            <p class="text-neutral-400 font-sans text-xs truncate mt-0.5 font-light">
              {{ item.description }}
            </p>
          </div>
        </div>

        <!-- Clickable item -->
        <NuxtLink
          v-else
          :to="`/saas/${item.slug}`"
          @click="emit('clickItem', item)"
          class="flex items-center gap-3 px-4 py-3 text-left transition-all duration-300 hover:bg-white/5 cursor-pointer"
        >
          <!-- Logo -->
          <div class="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
            <img v-if="item.logoUrl" :src="item.logoUrl" alt="logo" class="w-full h-full object-cover" />
            <div v-else class="text-xs font-bold font-sans text-[#00D4FF] select-none">
              {{ item.name.charAt(0).toUpperCase() }}
            </div>
          </div>

          <!-- Details -->
          <div class="flex-1 min-w-0">
            <span class="text-white font-sans text-sm font-medium truncate block">
              {{ item.name }}
            </span>
            <p class="text-neutral-400 font-sans text-xs truncate mt-0.5 font-light">
              {{ item.description }}
            </p>
          </div>
        </NuxtLink>
      </template>
    </div>
  </div>
</template>
