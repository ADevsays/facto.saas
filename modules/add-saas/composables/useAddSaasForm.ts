import { useAddSaasModal } from '~/composables/useAddSaasModal'

export function useAddSaasForm() {
  const { close } = useAddSaasModal()
  
  const provider = ref<'stripe' | 'mercadopago' | 'none' | null>(null)
  const apiKey = ref('')
  const detectedMrr = ref<number | null>(null)
  
  const form = ref({
    name: '',
    websiteUrl: '',
    founderEmail: '',
    categorySlug: '',
  })

  const loading = ref(false)
  const success = ref(false)
  const error = ref('')

  async function onSubmit() {
    if (!form.value.name || !form.value.categorySlug || !form.value.founderEmail) {
      error.value = 'Por favor completa los campos obligatorios.'
      setTimeout(() => { error.value = '' }, 4000)
      return
    }

    loading.value = true
    error.value = ''

    try {
      const payload = {
        ...form.value,
        providerSlug: provider.value === 'none' ? undefined : provider.value,
        providerKey: apiKey.value || undefined,
        isIncognito: false
      }

      await $fetch('/api/publish', {
        method: 'POST',
        body: payload
      })

      success.value = true
      setTimeout(() => {
        close()
        success.value = false
        reset()
      }, 2000)
    } catch (e: any) {
      error.value = e.data?.message || 'Error al publicar. Inténtalo de nuevo.'
      setTimeout(() => { error.value = '' }, 5000)
    } finally {
      loading.value = false
    }
  }

  function reset() {
    provider.value = null
    apiKey.value = ''
    form.value = { name: '', websiteUrl: '', founderEmail: '', categorySlug: '' }
    error.value = ''
    detectedMrr.value = null
  }

  return {
    provider,
    apiKey,
    detectedMrr,
    form,
    loading,
    success,
    error,
    onSubmit,
    reset
  }
}
