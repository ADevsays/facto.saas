import { ref, computed } from 'vue'
import { useMercadoPagoAuth } from '~/modules/add-saas/composables/useMercadoPagoAuth'

export function useDashboardStartup() {
  const startup = ref<any>(null)
  const loading = ref(true)
  const saving = ref(false)
  const savedSuccess = ref(false)
  const errorMessage = ref('')

  // Form fields
  const name = ref('')
  const logoUrl = ref('')
  const logoFileBase64 = ref('')
  const websiteUrl = ref('')
  const description = ref('')
  const categorySlugs = ref<string[]>([])
  const countrySlug = ref('')
  const status = ref('published')

  // MRR & Billing
  const mrr = ref<number | null>(null)
  const currency = ref('USD')
  const provider = ref<'stripe' | 'mercadopago' | 'whop' | 'none' | null>('none')
  const apiKey = ref('')
  const detectedMrr = ref<number | null>(null)

  const { isMpConnecting, openMpAuth } = useMercadoPagoAuth((mrrVal) => {
    detectedMrr.value = mrrVal
    apiKey.value = 'MERCADO_PAGO_OAUTH_TOKEN'
  })

  // Bento & Growth
  const problemSolved = ref('')
  const valueProposition = ref('')
  const acquisitionChannels = ref<string[]>([])
  const newChannel = ref('')
  const techStack = ref<string[]>([])
  const newTech = ref('')
  const factoMessage = ref('')

  // GitHub
  const githubRepo = ref('')
  const testingGithub = ref(false)
  const githubStatus = ref<'idle' | 'synced' | 'not_found' | 'unauthorized' | 'error'>('idle')
  const githubMessage = ref('')
  const githubCommits = ref<any[]>([])

  // FAQ
  const faqList = ref<{ question: string; answer: string }[]>([])

  // File drop
  const fileInput = ref<HTMLInputElement | null>(null)
  const isDragging = ref(false)

  // Reactive visual status indicators
  const hasBentoData = computed(() => {
    return !!(
      problemSolved.value.trim() ||
      valueProposition.value.trim() ||
      acquisitionChannels.value.length > 0 ||
      techStack.value.length > 0 ||
      factoMessage.value.trim()
    )
  })

  const hasGithubData = computed(() => {
    return !!githubRepo.value.trim() && githubStatus.value === 'synced'
  })

  const hasFaqData = computed(() => {
    return faqList.value.some(f => f.question.trim() && f.answer.trim())
  })

  const isHidden = computed(() => status.value === 'hidden')

  async function loadStartup(slug: string) {
    loading.value = true
    errorMessage.value = ''
    try {
      const data = await $fetch<any>(`/api/saas/${slug}`)
      startup.value = data

      name.value = data.name || ''
      logoUrl.value = data.logoUrl || ''
      logoFileBase64.value = ''
      websiteUrl.value = data.websiteUrl || ''
      description.value = data.description || ''
      categorySlugs.value = Array.isArray(data.categories) ? data.categories.map((c: any) => c.slug) : []
      countrySlug.value = data.countrySlug || ''
      status.value = data.status || 'published'

      mrr.value = data.mrr !== null && data.mrr !== undefined ? Number(data.mrr) : null
      currency.value = data.currency || 'USD'
      detectedMrr.value = null
      provider.value = data.mrr === null ? 'none' : ((data.provider as any) || 'stripe')
      apiKey.value = ''

      problemSolved.value = data.problemSolved || ''
      valueProposition.value = data.valueProposition || ''
      acquisitionChannels.value = Array.isArray(data.acquisitionChannels) ? [...data.acquisitionChannels] : []
      techStack.value = Array.isArray(data.techStack) ? [...data.techStack] : []
      factoMessage.value = data.factoMessage || ''

      githubRepo.value = data.githubRepo || ''
      if (githubRepo.value) {
        testGithubRepo()
      } else {
        githubStatus.value = 'idle'
        githubCommits.value = []
      }

      faqList.value = Array.isArray(data.faq) && data.faq.length > 0
        ? JSON.parse(JSON.stringify(data.faq))
        : []
    } catch {
      errorMessage.value = 'Error cargando los datos de la startup'
    } finally {
      loading.value = false
    }
  }

  function triggerLogoInput() {
    fileInput.value?.click()
  }

  function handleLogoFile(file: File) {
    if (!file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const MAX_DIM = 256
        let width = img.width
        let height = img.height

        if (width > height) {
          if (width > MAX_DIM) {
            height *= MAX_DIM / width
            width = MAX_DIM
          }
        } else {
          if (height > MAX_DIM) {
            width *= MAX_DIM / height
            height = MAX_DIM
          }
        }
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        ctx?.drawImage(img, 0, 0, width, height)
        logoFileBase64.value = canvas.toDataURL('image/webp', 0.85)
      }
      img.src = e.target?.result as string
    }
    reader.readAsDataURL(file)
  }

  function onLogoFileChange(event: Event) {
    const target = event.target as HTMLInputElement
    if (target.files?.length) {
      handleLogoFile(target.files[0])
    }
  }

  function onLogoDrop(event: DragEvent) {
    isDragging.value = false
    if (event.dataTransfer?.files?.length) {
      handleLogoFile(event.dataTransfer.files[0])
    }
  }

  function addChannel() {
    const val = newChannel.value.trim()
    if (val && !acquisitionChannels.value.includes(val)) {
      acquisitionChannels.value.push(val)
      newChannel.value = ''
    }
  }

  function removeChannel(idx: number) {
    acquisitionChannels.value.splice(idx, 1)
  }

  function addTech() {
    const val = newTech.value.trim()
    if (val && !techStack.value.includes(val)) {
      techStack.value.push(val)
      newTech.value = ''
    }
  }

  function removeTech(idx: number) {
    techStack.value.splice(idx, 1)
  }

  function addFaq() {
    faqList.value.push({ question: '', answer: '' })
  }

  function removeFaq(idx: number) {
    faqList.value.splice(idx, 1)
  }

  function toggleVisibility() {
    status.value = status.value === 'hidden' ? 'published' : 'hidden'
  }

  async function testGithubRepo() {
    const clean = (githubRepo.value || '').trim().replace(/^https?:\/\/github\.com\//i, '').replace(/\/$/, '')
    if (!clean || !clean.includes('/')) {
      githubStatus.value = 'idle'
      githubMessage.value = ''
      githubCommits.value = []
      return
    }
    testingGithub.value = true
    githubMessage.value = ''
    try {
      const data = await $fetch<any>(`/api/github/activity?target=${encodeURIComponent(clean)}`)
      githubMessage.value = data.message || ''
      if (data.status === 'synced') {
        githubStatus.value = 'synced'
      } else if (data.status === 'not_found') {
        githubStatus.value = 'not_found'
      } else if (data.status === 'unauthorized') {
        githubStatus.value = 'unauthorized'
      } else {
        githubStatus.value = data.status || 'error'
      }
    } catch {
      githubStatus.value = 'error'
      githubMessage.value = 'Error al conectar con la API de GitHub'
      githubCommits.value = []
    } finally {
      testingGithub.value = false
    }
  }

  async function saveStartup() {
    if (!startup.value?.id) return
    saving.value = true
    errorMessage.value = ''
    savedSuccess.value = false

    try {
      await $fetch('/api/founder/update-startup', {
        method: 'PATCH',
        body: {
          saasId: startup.value.id,
          name: name.value,
          logoFileBase64: logoFileBase64.value || undefined,
          logoUrl: !logoFileBase64.value ? logoUrl.value : undefined,
          websiteUrl: websiteUrl.value,
          startupType: description.value,
          status: status.value,
          countrySlug: countrySlug.value,
          categorySlug: categorySlugs.value[0] || null,
          categorySlugs: categorySlugs.value,
          valueProposition: valueProposition.value,
          problemSolved: problemSolved.value,
          acquisitionChannels: acquisitionChannels.value,
          techStack: techStack.value,
          factoMessage: factoMessage.value,
          githubRepo: githubRepo.value,
          faq: faqList.value.filter(f => f.question.trim() && f.answer.trim()),
          hideMrr: provider.value === 'none',
          providerSlug: provider.value !== 'none' ? provider.value : undefined,
          providerKey: apiKey.value.trim() ? apiKey.value.trim() : undefined
        }
      })

      if (provider.value === 'none') {
        mrr.value = null
        detectedMrr.value = null
      } else if (detectedMrr.value !== null) {
        mrr.value = detectedMrr.value
      }

      savedSuccess.value = true
      setTimeout(() => { savedSuccess.value = false }, 3500)
    } catch (e: any) {
      errorMessage.value = e?.data?.message || 'Error al guardar los cambios'
    } finally {
      saving.value = false
    }
  }

  return {
    startup,
    loading,
    saving,
    savedSuccess,
    errorMessage,
    name,
    logoUrl,
    logoFileBase64,
    websiteUrl,
    description,
    categorySlugs,
    countrySlug,
    status,
    isHidden,
    mrr,
    currency,
    provider,
    apiKey,
    detectedMrr,
    isMpConnecting,
    openMpAuth,
    problemSolved,
    valueProposition,
    acquisitionChannels,
    newChannel,
    techStack,
    newTech,
    factoMessage,
    githubRepo,
    testingGithub,
    githubStatus,
    githubMessage,
    githubCommits,
    faqList,
    fileInput,
    isDragging,
    hasBentoData,
    hasGithubData,
    hasFaqData,
    loadStartup,
    triggerLogoInput,
    onLogoFileChange,
    onLogoDrop,
    addChannel,
    removeChannel,
    addTech,
    removeTech,
    addFaq,
    removeFaq,
    toggleVisibility,
    testGithubRepo,
    saveStartup
  }
}
