import { useAddSaasModal } from '~/composables/useAddSaasModal'

export function useAddSaasForm() {
  const { close, prefillData } = useAddSaasModal()
  
  const provider = ref<'stripe' | 'mercadopago' | 'whop' | 'none'>('stripe')
  const apiKey = ref('')
  const detectedMrr = ref<number | null>(null)
  
  const form = ref({
    id: undefined as string | undefined,
    name: '',
    websiteUrl: '',
    founderEmail: '',
    founderName: undefined as string | undefined,
    categorySlugs: [] as string[],
    countrySlug: 'global',
    logoUrl: undefined as string | undefined,
    logoFileBase64: undefined as string | undefined,
    startupType: undefined as string | undefined,
  })

  const loading = ref(false)
  const success = ref(false)
  const error = ref('')
  const publishedData = ref<any>(null)

  function applyPrefill() {
    if (!prefillData.value) return
    const d = prefillData.value
    form.value.id = d.id
    form.value.name = d.name || ''
    form.value.websiteUrl = d.websiteUrl || ''
    form.value.founderEmail = d.founderEmail || ''
    form.value.founderName = d.founderName || undefined
    form.value.categorySlugs = d.categorySlugs || []
    form.value.countrySlug = d.countrySlug || ''
    form.value.logoUrl = d.logoUrl
    form.value.startupType = d.type || d.startupType || d.description
    if (d.providerSlug) provider.value = d.providerSlug
  }

  watch(prefillData, (val) => {
    if (val) applyPrefill()
  }, { immediate: true })

  async function onSubmit() {
    if (!form.value.name || !form.value.categorySlugs.length || !form.value.founderEmail) {
      error.value = 'Por favor completa los campos obligatorios.'
      setTimeout(() => { error.value = '' }, 4000)
      return
    }

    loading.value = true
    error.value = ''

    try {
      const payload = {
        ...form.value,
        id: form.value.id,
        providerSlug: provider.value === 'none' ? undefined : provider.value,
        providerKey: apiKey.value || undefined,
        isIncognito: false
      }

      const response = await $fetch<any>('/api/publish', {
        method: 'POST',
        body: payload
      })

      publishedData.value = response
      const wasUpdate = !!form.value.id

      close()

      setTimeout(() => {
        success.value = true

        if (wasUpdate || response.status === 'pending_review') {
          setTimeout(() => {
            success.value = false
            reset()
            if (wasUpdate) window.location.reload()
          }, 2500)
        }
      }, 400)
    } catch (e: any) {
      error.value = e.data?.message || 'Error al publicar. Inténtalo de nuevo.'
      setTimeout(() => { error.value = '' }, 5000)
    } finally {
      loading.value = false
    }
  }

  function reset() {
    provider.value = 'stripe'
    apiKey.value = ''
    form.value = { id: undefined, name: '', websiteUrl: '', founderEmail: '', founderName: undefined, categorySlugs: [], countrySlug: 'global', logoUrl: undefined, logoFileBase64: undefined, startupType: undefined }
    error.value = ''
    detectedMrr.value = null
    publishedData.value = null
  }

  return {
    provider,
    apiKey,
    detectedMrr,
    form,
    loading,
    success,
    error,
    publishedData,
    onSubmit,
    reset,
    applyPrefill
  }
}
