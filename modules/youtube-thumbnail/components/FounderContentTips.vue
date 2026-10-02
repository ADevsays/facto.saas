<script setup lang="ts">
import { FOUNDER_THUMBNAIL_TIPS as FOUNDER_THUMBNAIL_TIPS_ES } from '../const/seoContent.es'
import { FOUNDER_THUMBNAIL_TIPS as FOUNDER_THUMBNAIL_TIPS_EN } from '../const/seoContent.en'
import es from '../locales/es.json'
import en from '../locales/en.json'
import { computed } from 'vue'

const { t, language } = useLanguage({ es, en })
const founderTips = computed(() => language.value === 'es' ? FOUNDER_THUMBNAIL_TIPS_ES : FOUNDER_THUMBNAIL_TIPS_EN)
</script>

<template>
  <div class="w-full max-w-4xl mx-auto mt-16 text-left">
    <div class="bg-[#0A0A0E] border border-white/10 rounded-2xl p-6 md:p-8 relative overflow-hidden">
      <!-- Ambient Glow -->
      <div class="absolute -right-20 -bottom-20 w-64 h-64 bg-[#00D4FF]/10 rounded-full blur-3xl pointer-events-none"></div>

      <div class="mb-8">
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00D4FF]/10 border border-[#00D4FF]/30 text-[#00D4FF] text-xs font-mono mb-3">
          <span>{{ t.tips.badge }}</span>
        </div>
        <h2 class="text-xl md:text-2xl font-serif text-white font-bold tracking-tight">
          {{ t.tips.title }}
        </h2>
        <p class="text-neutral-400 text-sm font-light mt-1">
          {{ t.tips.description }}
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div 
          v-for="(tip, index) in founderTips" 
          :key="index"
          class="bg-[#030305] border border-white/5 rounded-xl p-5 hover:border-white/20 transition-colors"
        >
          <div class="flex items-center gap-3 mb-2">
            <span class="w-7 h-7 rounded-lg bg-white/10 text-white font-mono text-xs font-bold flex items-center justify-center shrink-0">
              0{{ index + 1 }}
            </span>
            <h3 class="text-sm font-semibold text-white font-sans">{{ tip.title }}</h3>
          </div>
          <p class="text-xs text-neutral-400 font-light leading-relaxed pl-10">
            {{ tip.description }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
