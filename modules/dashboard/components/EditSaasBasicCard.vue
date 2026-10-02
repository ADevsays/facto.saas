<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useLanguage } from '~/composables/useLanguage'
import CategorySelect from '~/ui/components/CategorySelect.vue'
import CountrySelect from '~/ui/components/CountrySelect.vue'
import AddSaasProviderSelection from '~/modules/add-saas/components/AddSaasProviderSelection.vue'
import AddSaasConnectionArea from '~/modules/add-saas/components/AddSaasConnectionArea.vue'
import es from '../locales/es.json'
import en from '../locales/en.json'

const { t } = useLanguage({ es, en })
const route = useRoute()

const name = defineModel<string>('name', { default: '' })
const categorySlugs = defineModel<string[]>('categorySlugs', { default: () => [] })
const logoFileBase64 = defineModel<string>('logoFileBase64', { default: '' })
const logoUrl = defineModel<string>('logoUrl', { default: '' })
const description = defineModel<string>('description', { default: '' })
const websiteUrl = defineModel<string>('websiteUrl', { default: '' })
const countrySlug = defineModel<string>('countrySlug', { default: '' })
const provider = defineModel<'stripe' | 'mercadopago' | 'whop' | 'none' | null>('provider', { default: 'none' })
const apiKey = defineModel<string>('apiKey', { default: '' })

defineProps<{
  mrr: number | null
  detectedMrr: number | null
  isMpConnecting: boolean
  openMpAuth: () => void
}>()

const isMrrExpanded = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)
const isDragging = ref(false)

onMounted(() => {
  if (route.hash === '#mrr') {
    isMrrExpanded.value = true
  }
})

function triggerLogoInput() {
  fileInput.value?.click()
}

function onLogoFileChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = () => {
    logoFileBase64.value = reader.result as string
  }
  reader.readAsDataURL(file)
}

function onLogoDrop(e: DragEvent) {
  isDragging.value = false
  const file = e.dataTransfer?.files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = () => {
    logoFileBase64.value = reader.result as string
  }
  reader.readAsDataURL(file)
}
</script>

<template>
  <!-- Block 1: Basic Information Card (Core) -->
  <section class="bg-surface-elevated border border-white/10 rounded-3xl p-8 md:p-10 space-y-6 transition-all duration-300 hover:border-white/15">
    <div class="flex items-center justify-between pb-4 border-b border-white/5">
      <h2 class="font-serif text-lg md:text-2xl text-white font-normal">{{ t.fields.name }}</h2>
      <span class="text-[9px] font-mono uppercase tracking-widest text-[#00D4FF] bg-[#00D4FF]/10 px-3 py-1 rounded-full border border-[#00D4FF]/20">
        {{ t.badges?.core || 'Obligatorio' }}
      </span>
    </div>

    <!-- Name & Category -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
      <div class="space-y-2">
        <label class="block text-[10px] font-sans font-medium uppercase tracking-[0.2em] text-neutral-300">{{ t.fields.name }}</label>
        <input
          v-model="name"
          type="text"
          :placeholder="t.fields.name_placeholder"
          class="w-full bg-surface-dark border border-white/15 rounded-xl px-4 py-3.5 text-white text-sm focus:outline-none focus:border-[#00D4FF]/60 transition-colors placeholder:text-neutral-500"
        />
      </div>

      <div class="space-y-2">
        <label class="block text-[10px] font-sans font-medium uppercase tracking-[0.2em] text-neutral-300">{{ t.fields.categories }}</label>
        <CategorySelect v-model="categorySlugs" dark-background />
      </div>
    </div>

    <!-- Provider & MRR Integration -->
    <div id="mrr" class="space-y-2">
      <div class="flex items-center justify-between">
        <label class="block text-[10px] font-sans font-medium uppercase tracking-[0.2em] text-neutral-300">
          {{ t.fields.mrr_label || 'Pasarela de Facturación (MRR)' }}
        </label>
        <span v-if="mrr !== null" class="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
          ${{ mrr.toLocaleString() }} / mes
        </span>
      </div>

      <button
        type="button"
        @click="isMrrExpanded = !isMrrExpanded"
        class="w-full bg-surface-dark border rounded-xl px-4 py-3.5 text-sm flex items-center justify-between transition-colors focus:outline-none cursor-pointer"
        :class="isMrrExpanded ? 'border-[#00D4FF]/60 text-white' : 'border-white/15 text-neutral-300 hover:border-white/30'"
      >
        <span class="truncate" :class="mrr !== null ? 'text-white font-normal' : 'text-neutral-500 font-light'">
          {{ mrr !== null ? (provider && provider !== 'none' ? `${provider.toUpperCase()} — $${mrr.toLocaleString()} / mes` : `$${mrr.toLocaleString()} / mes`) : (provider && provider !== 'none' ? provider.toUpperCase() : 'Conectar pasarela (Stripe, Mercado Pago, Whop)') }}
        </span>

        <div class="flex items-center gap-2.5 text-neutral-400 shrink-0">
          <span class="text-[10px] font-sans uppercase tracking-[0.15em] text-neutral-400">
            {{ isMrrExpanded ? 'Cerrar' : (mrr !== null ? 'Modificar' : 'Configurar') }}
          </span>
          <svg
            class="w-4 h-4 transition-transform duration-200"
            :class="isMrrExpanded ? 'rotate-180 text-[#00D4FF]' : 'text-neutral-400'"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </button>

      <div 
        class="grid transition-[grid-template-rows] duration-300 ease-out"
        :class="isMrrExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'"
      >
        <div class="overflow-hidden">
          <div class="pt-2 space-y-4">
            <AddSaasProviderSelection v-model="provider" />

            <AddSaasConnectionArea 
              v-if="provider && provider !== 'none'"
              :provider="provider"
              :detected-mrr="detectedMrr"
              :is-mp-connecting="isMpConnecting"
              :open-mp-auth="openMpAuth"
              v-model:apiKey="apiKey"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Logo Upload Dropzone -->
    <div class="space-y-2">
      <label class="block text-[10px] font-sans font-medium uppercase tracking-[0.2em] text-neutral-300">{{ t.fields.logo }}</label>
      <div
        class="w-full border border-dashed rounded-2xl p-8 flex flex-col items-center justify-center gap-3.5 cursor-pointer transition-all duration-300 text-center relative group"
        :class="isDragging ? 'border-[#00D4FF] bg-[#00D4FF]/5' : 'border-white/20 bg-surface-dark hover:border-white/30 hover:bg-surface-dark/80'"
        @click="triggerLogoInput"
        @dragover.prevent="isDragging = true"
        @dragleave.prevent="isDragging = false"
        @drop.prevent="onLogoDrop"
      >
        <input
          ref="fileInput"
          type="file"
          accept="image/*"
          class="hidden"
          @change="onLogoFileChange"
        />

        <div v-if="logoFileBase64 || logoUrl" class="w-16 h-16 rounded-2xl border border-white/20 bg-black overflow-hidden flex items-center justify-center relative shadow-lg">
          <img :src="logoFileBase64 || logoUrl" class="w-full h-full object-cover" />
        </div>

        <div v-else class="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-neutral-400 group-hover:text-white transition-colors">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="17 8 12 3 7 8"></polyline>
            <line x1="12" y1="3" x2="12" y2="15"></line>
          </svg>
        </div>

        <div>
          <p class="text-xs font-sans text-neutral-200 font-normal group-hover:text-white transition-colors">
            {{ logoFileBase64 ? t.fields.logo_ready : t.fields.logo_dropzone }}
          </p>
          <span class="text-[10px] font-sans text-neutral-500 tracking-wider block mt-1">
            {{ t.fields.logo_formats }}
          </span>
        </div>
      </div>
    </div>

    <!-- Description -->
    <div class="space-y-2">
      <label class="block text-[10px] font-sans font-medium uppercase tracking-[0.2em] text-neutral-300">{{ t.fields.description }}</label>
      <textarea
        v-model="description"
        rows="3"
        :placeholder="t.fields.description_placeholder"
        class="w-full bg-surface-dark border border-white/15 rounded-xl px-4 py-3 text-white text-sm font-light focus:outline-none focus:border-[#00D4FF]/60 transition-colors custom-scrollbar placeholder:text-neutral-500"
      ></textarea>
    </div>

    <!-- Website & Country Row -->
    <div class="flex flex-col sm:flex-row items-stretch sm:items-end gap-4">
      <div class="flex-1 space-y-2">
        <label class="block text-[10px] font-sans font-medium uppercase tracking-[0.2em] text-neutral-300">{{ t.fields.website }}</label>
        <input
          v-model="websiteUrl"
          type="url"
          :placeholder="t.fields.website_placeholder"
          class="w-full bg-surface-dark border border-white/15 rounded-xl px-4 py-3.5 text-white text-sm focus:outline-none focus:border-[#00D4FF]/60 transition-colors h-[50px] placeholder:text-neutral-500"
        />
      </div>
      <div class="shrink-0 space-y-2">
        <label class="block text-[10px] font-sans font-medium uppercase tracking-[0.2em] text-neutral-300">{{ t.fields.country }}</label>
        <CountrySelect v-model="countrySlug" dark-background />
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
