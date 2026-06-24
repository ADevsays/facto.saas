import { ref } from 'vue'

export function useFeedbackForm() {
  const details = ref('')
  const selectedFile = ref<File | null>(null)
  const selectedFileUrl = ref<string | null>(null)
  const isSubmitting = ref(false)
  const isSuccess = ref(false)
  const errorMessage = ref('')
  const isDragging = ref(false)

  const handleDragEnter = () => {
    isDragging.value = true
  }

  const handleDragLeave = () => {
    isDragging.value = false
  }

  const handleDrop = (e: DragEvent) => {
    isDragging.value = false
    if (e.dataTransfer && e.dataTransfer.files.length > 0) {
      selectedFile.value = e.dataTransfer.files[0]
      selectedFileUrl.value = URL.createObjectURL(selectedFile.value)
    }
  }

  const handleFileChange = (e: Event) => {
    const target = e.target as HTMLInputElement
    if (target.files && target.files.length > 0) {
      selectedFile.value = target.files[0]
      selectedFileUrl.value = URL.createObjectURL(selectedFile.value)
    }
  }

  const removeFile = (fileInputRef?: HTMLInputElement | null) => {
    selectedFile.value = null
    if (selectedFileUrl.value) {
      URL.revokeObjectURL(selectedFileUrl.value)
      selectedFileUrl.value = null
    }
    if (fileInputRef) {
      fileInputRef.value = ''
    }
  }

  const submitFeedback = async (fileInputRef?: HTMLInputElement | null) => {
    if (!details.value.trim()) {
      errorMessage.value = 'Por favor, detalla el error o feedback.'
      return
    }

    isSubmitting.value = true
    errorMessage.value = ''

    try {
      const formData = new FormData()
      formData.append('details', details.value)
      if (selectedFile.value) {
        formData.append('image', selectedFile.value)
      }

      const response = await $fetch('/api/feedback/submit', {
        method: 'POST',
        body: formData
      })

      if (response && (response as any).success) {
        isSuccess.value = true
        details.value = ''
        removeFile(fileInputRef)
      }
    } catch (error: any) {
      errorMessage.value = error.data?.message || 'Ocurrió un error al enviar tu reporte.'
    } finally {
      isSubmitting.value = false
    }
  }

  const resetSuccess = () => {
    isSuccess.value = false
  }

  return {
    details,
    selectedFile,
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
  }
}
