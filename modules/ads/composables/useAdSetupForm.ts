import { ref } from 'vue'
import type { Ref } from 'vue'

export function useAdSetupForm(options: {
  selectedSlot: Ref<number>
  onSuccess?: () => void
}) {
  const { selectedSlot, onSuccess } = options

  const email = ref('')
  const activeToken = ref<string | null>(null)
  const isValidatingToken = ref(false)
  const isSubmitting = ref(false)
  const setupSuccess = ref(false)
  const setupError = ref('')
  const isUploadingImage = ref(false)
  const uploadError = ref('')

  const form = ref({
    name: '',
    description: '',
    url: '',
    image_url: ''
  })

  function resetSetup() {
    email.value = ''
    activeToken.value = null
    isValidatingToken.value = false
    isSubmitting.value = false
    setupSuccess.value = false
    setupError.value = ''
    uploadError.value = ''
    form.value = { name: '', description: '', url: '', image_url: '' }
  }

  async function validateToken(token: string) {
    isValidatingToken.value = true
    setupError.value = ''
    try {
      const res = await $fetch<any>('/api/ads/session', {
        params: { token }
      })
      if (res?.ok) {
        activeToken.value = token
        if (res.membership?.email) {
          email.value = res.membership.email
        }
      }
    } catch (err: any) {
      setupError.value = err.data?.statusMessage || 'No se encontró un pago activo para este token o ya fue utilizado.'
    } finally {
      isValidatingToken.value = false
    }
  }

  async function handleFileUpload(file: File) {
    const allowedExts = ['png', 'jpg', 'jpeg', 'webp', 'svg', 'gif', 'ico']
    const fileExt = (file.name.split('.').pop() || '').toLowerCase()

    if (!file.type.startsWith('image/') && !allowedExts.includes(fileExt)) {
      uploadError.value = `El formato ".${fileExt || 'desconocido'}" no es compatible. Por favor sube una imagen en formato PNG, JPG, WEBP o SVG.`
      return
    }

    const MAX_SIZE = 5 * 1024 * 1024
    if (file.size > MAX_SIZE) {
      uploadError.value = 'El archivo supera el tamaño máximo permitido de 5 MB.'
      return
    }

    const formData = new FormData()
    formData.append('file', file)

    isUploadingImage.value = true
    uploadError.value = ''

    try {
      const res = await $fetch<{ imageUrl: string }>('/api/ads/upload', {
        method: 'POST',
        body: formData
      })
      if (res?.imageUrl) {
        form.value.image_url = res.imageUrl
      }
    } catch (err: any) {
      uploadError.value = err.data?.message || err.data?.statusMessage || 'Error al procesar la imagen. Verifica que sea un archivo válido.'
    } finally {
      isUploadingImage.value = false
    }
  }

  async function submitSetup(customPrice?: number | null) {
    if (!form.value.name || !form.value.url) return
    isSubmitting.value = true
    setupError.value = ''

    try {
      let cleanUrl = form.value.url.trim()
      if (cleanUrl && !/^https?:\/\//i.test(cleanUrl)) {
        cleanUrl = `https://${cleanUrl}`
        form.value.url = cleanUrl
      }

      await $fetch('/api/ads/setup', {
        method: 'POST',
        body: {
          token: activeToken.value || undefined,
          email: email.value,
          name: form.value.name,
          description: form.value.description,
          url: cleanUrl,
          image_url: form.value.image_url,
          position: selectedSlot.value,
          price: customPrice || undefined
        }
      })

      await refreshNuxtData('ads-slots-list')
      setupSuccess.value = true

      if (typeof window !== 'undefined') {
        window.history.replaceState({}, document.title, window.location.pathname)
      }

      if (onSuccess) onSuccess()
    } catch (err: any) {
      setupError.value = err.data?.statusMessage || 'Error al guardar la configuración del anuncio.'
    } finally {
      isSubmitting.value = false
    }
  }

  return {
    email,
    activeToken,
    isValidatingToken,
    isSubmitting,
    setupSuccess,
    setupError,
    uploadError,
    isUploadingImage,
    form,
    resetSetup,
    validateToken,
    handleFileUpload,
    submitSetup
  }
}
