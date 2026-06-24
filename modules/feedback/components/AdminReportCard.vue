<script setup lang="ts">
import type { FeedbackReport } from '~/modules/feedback/types'
import { useAdminReports } from '~/modules/feedback/composables/useAdminReports'

const props = defineProps<{
  report: FeedbackReport
}>()

const { formatDate } = useAdminReports()
</script>

<template>
  <NuxtLink :to="`/admin/reportes/${report.id}`" class="report-card text-left bg-white/[0.01] border border-white/[0.05] rounded-3xl overflow-hidden hover:border-white/10 hover:bg-[#00D4FF]/[0.02] transition-all duration-500 group relative flex flex-col cursor-pointer hover:shadow-[0_0_30px_rgba(0,212,255,0.05)] hover:-translate-y-1">
    <!-- Image Header -->
    <div v-if="report.image_url" class="h-56 w-full bg-[#030305] border-b border-white/[0.05] relative overflow-hidden">
      <img :src="report.image_url" class="w-full h-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700" />
      <div class="absolute inset-0 bg-gradient-to-t from-[#030305] to-transparent pointer-events-none"></div>
    </div>
    <div v-else class="h-20 w-full bg-white/[0.01] border-b border-white/[0.05] flex items-center justify-center text-neutral-700">
      <Icon name="lucide:image-off" size="20" />
    </div>
    
    <!-- Content -->
    <div class="p-8 flex flex-col flex-1">
      <div class="flex justify-between items-center mb-6">
        <span class="text-[10px] font-mono tracking-widest text-neutral-600 uppercase">#{{ report.id.split('-')[0] }}</span>
        <span class="text-[9px] uppercase tracking-[0.2em] px-3 py-1.5 rounded-full border" 
          :class="report.status === 'pending' ? 'border-yellow-500/20 text-yellow-500/70 bg-yellow-500/5' : 'border-green-500/20 text-green-500/70 bg-green-500/5'">
          {{ report.status }}
        </span>
      </div>
      
      <p class="font-sans font-extralight text-sm text-neutral-300 leading-[1.8] mb-8 whitespace-pre-wrap flex-1">
        {{ report.details }}
      </p>
      
      <div class="flex items-center gap-2 text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-neutral-600 mt-auto pt-6 border-t border-white/[0.03]">
        <Icon name="lucide:clock" size="12" />
        {{ formatDate(report.created_at) }}
      </div>
    </div>
  </NuxtLink>
</template>
