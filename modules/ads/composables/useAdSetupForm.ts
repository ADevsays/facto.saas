import { ref } from 'vue'
import type { Ref } from 'vue'

export function useAdSetupForm(options: {
  selectedSlot: Ref<number>
  onSuccess?: () => void
}) {
  const { selectedSlot, onSuccess } = options

  const step = ref(1)
  const email = ref('')
  const activeToken = ref<string | null>(null)
  const isValidatingToken = ref(false)
  const isChecking = ref(false)
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

  const subStep = ref<'email' | 'otp'>('email')
  const otpDigits = ref<string[]>(['', '', '', '', '', ''])
  const resendCountdown = ref(0)
  let resendTimer: any = null
  const isSendingOtp = ref(false)
  const isVerifyingOtp = ref(false)

  function startResendCountdown() {
    resendCountdown.value = 60
    if (resendTimer) clearInterval(resendTimer)
    resendTimer = setInterval(() => {
      resendCountdown.value--
      if (resendCountdown.value <= 0 && resendTimer) {
        clearInterval(resendTimer)
        resendTimer = null
      }
    }, 1000)
  }

  function resetSetup() {
    step.value = 1
    subStep.value = 'email'
    email.value = ''
    activeToken.value = null
    isValidatingToken.value = false
    isChecking.value = false
    isSubmitting.value = false
    isSendingOtp.value = false
    isVerifyingOtp.value = false
    setupSuccess.value = false
    setupError.value = ''
    uploadError.value = ''
    otpDigits.value = ['', '', '', '', '', '']
    resendCountdown.value = 0
    if (resendTimer) {
      clearInterval(resendTimer)
      resendTimer = null
    }
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
        // Keep step at 1 so the user is strictly required to verify their email
        step.value = 1
        subStep.value = 'email'
        email.value = ''
      }
    } catch (err: any) {
      setupError.value = err.data?.statusMessage || 'No se encontró un pago activo para este token o ya fue utilizado.'
      step.value = 1
    } finally {
      isValidatingToken.value = false
    }
  }

  async function sendOtp(noPaymentMsg = 'No se encontró un pago activo') {
    if (!email.value?.trim()) return
    isSendingOtp.value = true
    setupError.value = ''

    try {
      const cleanEmail = email.value.trim().toLowerCase()
      // 1. Validar que el email pertenezca a la membresía / token
      const sessionRes = await $fetch<any>('/api/ads/session', {
        params: {
          email: cleanEmail,
          token: activeToken.value || undefined
        }
      })

      if (!sessionRes?.ok) {
        throw new Error(noPaymentMsg)
      }

      // 2. Enviar código OTP único al email
      await $fetch('/api/auth/send-otp', {
        method: 'POST',
        body: { email: cleanEmail }
      })

      subStep.value = 'otp'
      startResendCountdown()
    } catch (err: any) {
      setupError.value = err.data?.statusMessage || err.data?.message || err.message || noPaymentMsg
    } finally {
      isSendingOtp.value = false
    }
  }

  async function verifyOtp(invalidCodeMsg = 'Código incorrecto o expirado') {
    const code = otpDigits.value.join('').trim()
    if (code.length < 6) {
      setupError.value = 'Por favor ingresa los 6 dígitos del código.'
      return
    }

    isVerifyingOtp.value = true
    setupError.value = ''

    try {
      const cleanEmail = email.value.trim().toLowerCase()
      await $fetch('/api/auth/verify-otp', {
        method: 'POST',
        body: {
          email: cleanEmail,
          code
        }
      })

      // Correo verificado con código único: avanzar al formulario de anuncio
      step.value = 2
      subStep.value = 'email'
    } catch (err: any) {
      setupError.value = err.data?.message || err.data?.statusMessage || invalidCodeMsg
      otpDigits.value = ['', '', '', '', '', '']
    } finally {
      isVerifyingOtp.value = false
    }
  }

  function backToEmail() {
    subStep.value = 'email'
    setupError.value = ''
    otpDigits.value = ['', '', '', '', '', '']
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
    step,
    subStep,
    email,
    activeToken,
    isValidatingToken,
    isChecking,
    isSubmitting,
    isSendingOtp,
    isVerifyingOtp,
    otpDigits,
    resendCountdown,
    setupSuccess,
    setupError,
    uploadError,
    isUploadingImage,
    form,
    resetSetup,
    validateToken,
    sendOtp,
    verifyOtp,
    backToEmail,
    checkEmail: sendOtp,
    handleFileUpload,
    submitSetup
  }
}
