<script setup lang="ts">
import { useLanguage } from '~/composables/useLanguage'
import es from '../locales/es.json'
import en from '../locales/en.json'

const { t } = useLanguage({ es, en })

const faqList = defineModel<{ question: string; answer: string }[]>('faqList', { default: () => [] })

defineProps<{
  hasFaqData: boolean
}>()

const emit = defineEmits<{
  (e: 'addFaq'): void
  (e: 'removeFaq', idx: number): void
}>()
</script>

<template>
  <!-- Block 4: FAQ Section Card -->
  <section 
    class="rounded-3xl p-8 md:p-10 space-y-6 transition-all duration-300 border bg-surface-elevated"
    :class="hasFaqData ? 'border-white/15 shadow-lg shadow-black/20' : 'border-dashed border-white/10 hover:border-white/15'"
  >
    <div class="flex items-center justify-between pb-4 border-b border-white/5 gap-4">
      <h2 class="font-serif text-lg md:text-2xl text-white font-normal">{{ t.faq.title }}</h2>
      
      <div class="flex items-center gap-3 shrink-0">
        <button
          type="button"
          @click="emit('addFaq')"
          class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-dark hover:bg-white/5 border border-white/15 text-white text-xs font-sans transition-colors cursor-pointer"
        >
          <span>{{ t.faq.add_question }}</span>
        </button>
        
        <span
          class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono tracking-wider transition-colors duration-300 border"
          :class="hasFaqData 
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.2)]' 
            : 'bg-white/5 border-white/10 text-neutral-500'"
        >
          <svg v-if="hasFaqData" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
            <circle cx="12" cy="12" r="3"></circle>
          </svg>
          <svg v-else width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"></path>
            <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"></path>
            <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"></path>
            <line x1="2" y1="2" x2="22" y2="22"></line>
          </svg>
          <span>{{ hasFaqData ? (t.badges?.public_active || 'Visible') : (t.badges?.public_hidden || 'Oculto') }}</span>
        </span>
      </div>
    </div>

    <div class="space-y-6 max-h-[420px] overflow-y-auto custom-scrollbar pr-1">
      <div v-if="faqList.length === 0" class="py-4 text-center text-xs font-sans text-neutral-500 font-extralight">
        {{ t.faq.empty }}
      </div>

      <div
        v-for="(item, idx) in faqList"
        :key="idx"
        class="space-y-3 pb-6 border-b border-white/5 last:border-b-0 last:pb-0"
      >
        <div class="flex items-center gap-3">
          <input
            v-model="item.question"
            type="text"
            :placeholder="t.faq.question_placeholder"
            class="flex-1 bg-surface-dark border border-white/15 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#00D4FF]/60 transition-colors placeholder:text-neutral-500"
          />
          <button
            type="button"
            @click="emit('removeFaq', idx)"
            class="w-11 h-11 flex items-center justify-center text-neutral-400 hover:text-rose-400 bg-surface-dark hover:bg-rose-500/10 border border-white/15 hover:border-rose-500/30 rounded-xl transition-all duration-200 shrink-0 group cursor-pointer"
            title="Eliminar pregunta"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="group-hover:scale-110 transition-transform">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <textarea
          v-model="item.answer"
          rows="2"
          :placeholder="t.faq.answer_placeholder"
          class="w-full bg-surface-dark border border-white/15 rounded-xl px-4 py-3 text-white text-sm font-light focus:outline-none focus:border-[#00D4FF]/60 transition-colors resize-none custom-scrollbar placeholder:text-neutral-500"
        ></textarea>
      </div>
    </div>
  </section>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 10px; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(0, 212, 255, 0.3); }
</style>
