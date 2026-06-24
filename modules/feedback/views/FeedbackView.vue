<script setup lang="ts">
import { onMounted } from 'vue'
import gsap from 'gsap'
import FeedbackForm from '~/modules/feedback/components/FeedbackForm.vue'
import FeedbackSuccess from '~/modules/feedback/components/FeedbackSuccess.vue'
import GlobalBreadcrumb from '~/ui/components/GlobalBreadcrumb.vue'
import { useFeedbackForm } from '~/modules/feedback/composables/useFeedbackForm'

const {
  details,
  selectedFileUrl,
  isSubmitting,
  isSuccess,
  errorMessage,
  isDragging,
  handleDragEnter,
  handleDragLeave,
  handleDrop,
  handleFileChange,
  removeFile,
  submitFeedback,
  resetSuccess
} = useFeedbackForm()

onMounted(() => {
  gsap.from('.stagger-fade-up', {
    y: 40,
    opacity: 0,
    duration: 1.2,
    stagger: 0.2,
    ease: 'power3.out'
  })
})
</script>

<template>
  <div class="min-h-screen bg-[#030305] text-white flex flex-col items-center py-32 px-6 md:px-12 relative isolate overflow-hidden">
    <!-- Premium Glows -->
    <div class="absolute inset-0 pointer-events-none -z-10 flex justify-center">
      <div class="absolute top-[-10%] w-[1000px] h-[600px] bg-[#00D4FF]/[0.03] blur-[150px] rounded-full"></div>
    </div>

    <div class="w-full max-w-xl z-10 relative">
      <GlobalBreadcrumb :items="[{ label: 'feedback' }]" class="mb-12 justify-center" />
      
      <div class="text-center mb-20 stagger-fade-up">
        <h1 class="font-serif text-[12vw] md:text-[6rem] leading-[0.85] tracking-tight mb-8">
          Reportar<br/>
          <span class="bg-clip-text text-transparent bg-gradient-to-r from-white via-neutral-300 to-white relative inline-block" style="-webkit-text-fill-color: rgba(0, 212, 255, 0.4); filter: drop-shadow(0 0 20px rgba(0, 212, 255, 0.3)); animation: shine 12s ease-in-out infinite;">Error</span>
        </h1>
        <p class="font-sans font-extralight tracking-[0.08em] text-neutral-400 text-sm md:text-base max-w-md mx-auto leading-relaxed">
          Ayúdanos a pulir cada detalle. Describe el problema y adjunta una captura si es posible.
        </p>
      </div>

      <FeedbackSuccess 
        v-if="isSuccess" 
        @reset="resetSuccess" 
      />

      <FeedbackForm 
        v-else 
        v-model:details="details"
        :error-message="errorMessage"
        :selected-file-url="selectedFileUrl"
        :is-submitting="isSubmitting"
        :is-dragging="isDragging"
        @drag-enter="handleDragEnter"
        @drag-leave="handleDragLeave"
        @drop="handleDrop"
        @file-change="handleFileChange"
        @remove-file="removeFile"
        @submit="submitFeedback"
      />
    </div>
  </div>
</template>

<style scoped>
@keyframes shine {
  0% { background-position: 200% center; }
  100% { background-position: -200% center; }
}
</style>
