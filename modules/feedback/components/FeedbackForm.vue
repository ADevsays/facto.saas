<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  errorMessage: string
  details: string
  selectedFileUrl: string | null
  isSubmitting: boolean
  isDragging: boolean
}>()

const emit = defineEmits<{
  (e: 'update:details', value: string): void
  (e: 'submit', fileInputRef: HTMLInputElement | null): void
  (e: 'removeFile', fileInputRef: HTMLInputElement | null): void
  (e: 'fileChange', event: Event): void
  (e: 'dragEnter'): void
  (e: 'dragLeave'): void
  (e: 'drop', event: DragEvent): void
}>()

const fileInput = ref<HTMLInputElement | null>(null)

const handleDetailsInput = (e: Event) => {
  const target = e.target as HTMLTextAreaElement
  emit('update:details', target.value)
}
</script>

<template>
  <form @submit.prevent="emit('submit', fileInput)" class="space-y-10 stagger-fade-up">
    
    <div v-if="errorMessage" class="bg-red-500/5 border border-red-500/20 text-red-300 px-6 py-4 rounded-xl text-sm font-extralight text-center tracking-wide">
      {{ errorMessage }}
    </div>

    <div class="flex flex-col gap-3">
      <label class="text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-neutral-500">
        Detalles del Error <span class="text-[#00D4FF]">*</span>
      </label>
      <textarea 
        :value="details"
        @input="handleDetailsInput"
        rows="5"
        placeholder="¿Qué estabas haciendo? ¿Qué error ocurrió?"
        class="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-5 text-white text-sm font-sans font-light placeholder:text-neutral-600 focus:outline-none focus:border-[#00D4FF]/50 transition-all duration-500 resize-none"
        :disabled="isSubmitting"
      ></textarea>
    </div>

    <div class="flex flex-col gap-3">
      <label class="text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-neutral-500">
        Captura de pantalla (Opcional)
      </label>
      
      <div v-if="selectedFileUrl" class="relative group rounded-2xl overflow-hidden border border-white/10 bg-white/[0.02]">
        <img :src="selectedFileUrl" class="w-full object-cover max-h-[350px] opacity-70 group-hover:opacity-100 transition-opacity duration-700" />
        <div class="absolute inset-0 bg-gradient-to-t from-[#030305]/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
        <button type="button" @click="emit('removeFile', fileInput)" class="absolute top-4 right-4 bg-[#030305]/80 backdrop-blur-md text-white p-3 rounded-full hover:bg-white hover:text-black transition-colors duration-300">
          <Icon name="lucide:x" size="18" />
        </button>
      </div>

      <div v-else class="relative border border-dashed rounded-2xl p-12 text-center transition-all duration-500 group cursor-pointer overflow-hidden"
        :class="isDragging ? 'border-[#00D4FF] bg-[#00D4FF]/10 scale-[1.02]' : 'border-white/10 bg-white/[0.02] hover:border-[#00D4FF]/40'"
        @click="() => fileInput?.click()" 
        @dragover.prevent 
        @dragenter.prevent="emit('dragEnter')"
        @dragleave.prevent="emit('dragLeave')"
        @drop.prevent="(e) => emit('drop', e)"
      >
        <div class="absolute inset-0 bg-[#00D4FF]/0 group-hover:bg-[#00D4FF]/5 transition-colors duration-500"></div>
        <input 
          ref="fileInput" 
          type="file" 
          accept="image/*" 
          class="hidden" 
          @change="(e) => emit('fileChange', e)"
          :disabled="isSubmitting"
        />
        <Icon name="lucide:image-plus" class="text-neutral-600 group-hover:text-[#00D4FF] transition-colors duration-500 text-4xl mb-4 mx-auto drop-shadow-sm" />
        <p class="font-extralight tracking-wide text-sm text-neutral-500 group-hover:text-neutral-300 transition-colors duration-500 relative z-10">
          Haz clic para subir o arrastra una imagen
        </p>
      </div>
    </div>

    <div class="pt-6 flex justify-center">
      <button 
        type="submit" 
        :disabled="isSubmitting"
        class="group bg-white text-black font-bold uppercase text-xs rounded-full px-8 py-3.5 transition-all duration-700 disabled:opacity-40 disabled:cursor-not-allowed hover:scale-[1.03] flex items-center justify-center"
        style="box-shadow: 0 0 15px rgba(255, 255, 255, 0.4), 0 0 30px rgba(0, 212, 255, 0.2), 0 0 45px rgba(0, 212, 255, 0.1);"
      >
        <span v-if="isSubmitting" class="flex items-center gap-3">
          <Icon name="lucide:loader-2" class="animate-spin" size="16" /> Procesando
        </span>
        <span v-else class="flex items-center gap-3">
          Enviar Reporte
          <Icon name="lucide:arrow-right" size="16" class="transition-transform duration-500 group-hover:translate-x-1" />
        </span>
      </button>
    </div>

  </form>
</template>
