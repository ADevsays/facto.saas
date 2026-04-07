<script setup lang="ts">
defineProps<{
  status: 'connected' | 'blocked' | 'zero' | 'pending'
  mrr?: number | null
  currency?: string
}>()
</script>

<template>
  <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-sans font-bold tracking-[0.1em] uppercase"
    :class="{
      'bg-[#00D4FF]/20 border border-[#00D4FF]/40 text-[#00D4FF] shadow-[0_0_15px_rgba(0,212,255,0.1)]': status === 'connected',
      'bg-white/10 border border-white/20 text-neutral-400': status === 'blocked',
      'bg-white/10 border border-white/20 text-neutral-300': status === 'zero',
      'bg-amber-500/20 border border-amber-500/40 text-amber-400': status === 'pending',
    }"
  >
    <span
      class="w-2 h-2 rounded-full shrink-0"
      :class="{
        'bg-[#00D4FF] shadow-[0_0_8px_#00D4FF]': status === 'connected',
        'bg-neutral-500': status === 'blocked',
        'bg-neutral-400': status === 'zero',
        'bg-amber-400 shadow-[0_0_8px_#fbbf24]': status === 'pending',
      }"
    />
    <span v-if="status === 'connected'">
      MRR conectado · {{ new Intl.NumberFormat('en-US', { style: 'currency', currency: currency ?? 'USD', maximumFractionDigits: 0 }).format(mrr ?? 0) }}
    </span>
    <span v-else-if="status === 'blocked'">MRR bloqueado</span>
    <span v-else-if="status === 'zero'">$0 MRR</span>
    <span v-else>Verificando MRR...</span>
  </div>
</template>
