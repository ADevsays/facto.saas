<script setup lang="ts">
import CategorySelect from './CategorySelect.vue'
import AddSaasInput from './AddSaasInput.vue'

const props = defineProps<{
  form: {
    id?: string
    name: string
    websiteUrl: string
    founderEmail: string
    categorySlugs: string[]
    logoUrl?: string
    startupType?: string
  }
}>()
</script>

<template>
  <div class="flex flex-col gap-6">
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
      <AddSaasInput
        v-model="form.name"
        label="Nombre del SaaS"
        placeholder="Mi Startup"
        required
      />
      <AddSaasInput
        v-model="form.websiteUrl"
        label="Web URL"
        type="url"
        placeholder="https://..."
      />
    </div>

    <!-- Update Mode Fields -->
    <div v-if="form.id" class="grid grid-cols-1 sm:grid-cols-2 gap-5">
      <AddSaasInput
        v-model="form.logoUrl"
        label="Logo URL"
        type="url"
        placeholder="https://..."
      />
      <AddSaasInput
        v-model="form.startupType"
        label="Descripción Corta"
        placeholder="Plataforma de IA para..."
      />
    </div>

    <div class="flex flex-col gap-2">
      <label class="text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-neutral-500">Categorías *</label>
      <CategorySelect v-model="form.categorySlugs" />
    </div>

    <AddSaasInput
      v-model="form.founderEmail"
      label="Email (Privado)"
      type="email"
      placeholder="hola@tuweb.com"
      required
    />
  </div>
</template>
