<script setup lang="ts">
import CategorySelect from '../components/CategorySelect.vue'
import type { SaasSubmission } from '~/modules/add-saas/types'

const emit = defineEmits<{ next: [data: Partial<SaasSubmission>] }>()

const form = reactive({
  name: '',
  logoUrl: '',
  founderName: '',
  websiteUrl: '',
  startupType: '',
  categorySlug: '',
})

const canContinue = computed(() => form.name.trim().length > 0 && form.categorySlug.length > 0)

function next() {
  if (!canContinue.value) return
  emit('next', {
    name: form.name.trim(),
    logoUrl: form.logoUrl.trim() || undefined,
    founderName: form.founderName.trim() || undefined,
    websiteUrl: form.websiteUrl.trim() || undefined,
    startupType: form.startupType.trim() || undefined,
    categorySlug: form.categorySlug,
    isIncognito: false,
  })
}
</script>

<template>
  <div class="flex flex-col gap-8">
    <div class="flex flex-col gap-1.5">
      <h2 class="font-serif text-3xl md:text-5xl text-white leading-tight tracking-tight">
        Cuéntanos sobre<br/>tu startup
      </h2>
      <p class="text-sm font-sans font-light text-neutral-400 tracking-[0.06em]">
        Solo el nombre y la categoría son obligatorios.
      </p>
    </div>

    <div class="flex flex-col gap-5">
      <div class="flex flex-col gap-2">
        <label class="text-[11px] font-sans font-medium uppercase tracking-[0.2em] text-neutral-300">Nombre *</label>
        <input
          v-model="form.name"
          type="text"
          placeholder="Mi SaaS"
          class="w-full bg-white/[0.07] border border-white/20 rounded-xl px-4 py-4 text-white text-sm font-sans font-light placeholder:text-neutral-500 focus:outline-none focus:border-[#00D4FF]/70 focus:bg-white/[0.1] transition-all duration-300"
        />
      </div>

      <div class="flex flex-col gap-2">
        <label class="text-[11px] font-sans font-medium uppercase tracking-[0.2em] text-neutral-300">Categoría *</label>
        <CategorySelect v-model="form.categorySlug" />
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div class="flex flex-col gap-2">
          <label class="text-[11px] font-sans font-medium uppercase tracking-[0.2em] text-neutral-400">Fundador</label>
          <input
            v-model="form.founderName"
            type="text"
            placeholder="Tu nombre"
            class="w-full bg-white/[0.07] border border-white/20 rounded-xl px-4 py-4 text-white text-sm font-sans font-light placeholder:text-neutral-500 focus:outline-none focus:border-[#00D4FF]/70 focus:bg-white/[0.1] transition-all duration-300"
          />
        </div>

        <div class="flex flex-col gap-2">
          <label class="text-[11px] font-sans font-medium uppercase tracking-[0.2em] text-neutral-400">Tipo de startup</label>
          <input
            v-model="form.startupType"
            type="text"
            placeholder="B2B SaaS, PLG..."
            class="w-full bg-white/[0.07] border border-white/20 rounded-xl px-4 py-4 text-white text-sm font-sans font-light placeholder:text-neutral-500 focus:outline-none focus:border-[#00D4FF]/70 focus:bg-white/[0.1] transition-all duration-300"
          />
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div class="flex flex-col gap-2">
          <label class="text-[11px] font-sans font-medium uppercase tracking-[0.2em] text-neutral-400">Logo (URL)</label>
          <input
            v-model="form.logoUrl"
            type="url"
            placeholder="https://tu-logo.png"
            class="w-full bg-white/[0.07] border border-white/20 rounded-xl px-4 py-4 text-white text-sm font-sans font-light placeholder:text-neutral-500 focus:outline-none focus:border-[#00D4FF]/70 focus:bg-white/[0.1] transition-all duration-300"
          />
        </div>

        <div class="flex flex-col gap-2">
          <label class="text-[11px] font-sans font-medium uppercase tracking-[0.2em] text-neutral-400">Sitio web</label>
          <input
            v-model="form.websiteUrl"
            type="url"
            placeholder="https://tu-saas.com"
            class="w-full bg-white/[0.07] border border-white/20 rounded-xl px-4 py-4 text-white text-sm font-sans font-light placeholder:text-neutral-500 focus:outline-none focus:border-[#00D4FF]/70 focus:bg-white/[0.1] transition-all duration-300"
          />
        </div>
      </div>
    </div>

    <button
      @click="next"
      :disabled="!canContinue"
      class="add-btn group self-start flex items-center gap-2.5 bg-white text-black font-bold uppercase tracking-widest text-xs rounded-full px-7 py-3.5 transition-all duration-700 disabled:opacity-30 disabled:cursor-not-allowed hover:scale-[1.03]"
    >
      Continuar
      <svg class="w-3 h-3 transition-transform duration-500 group-hover:translate-x-1" viewBox="0 0 12 12" fill="none">
        <path d="M2 6h8M6 2l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </button>
  </div>
</template>

<style scoped>
.add-btn:not(:disabled):hover {
  box-shadow: 0 0 15px rgba(255,255,255,0.5), 0 0 30px rgba(0,212,255,0.3), 0 0 45px rgba(0,212,255,0.1);
}
</style>
