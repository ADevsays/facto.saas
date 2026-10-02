import { ref, computed } from 'vue'

export function useDashboardFounder() {
  const { founder, checkSession } = useFounderSession()

  const founderName = ref('')
  const founderBio = ref('')
  const founderAvatarUrl = ref('')
  const founderAvatarBase64 = ref('')
  const founderCountrySlug = ref('')
  const founderTwitterUrl = ref('')
  const founderLinkedinUrl = ref('')
  const founderInstagramUrl = ref('')

  const isDraggingAvatar = ref(false)
  const avatarFileInput = ref<HTMLInputElement | null>(null)
  const saving = ref(false)
  const savedSuccess = ref(false)
  const errorMessage = ref('')

  function syncFromSession() {
    if (founder.value) {
      founderName.value = founder.value.name || ''
      founderBio.value = founder.value.bio || ''
      founderAvatarUrl.value = founder.value.avatar_url || ''
      founderAvatarBase64.value = ''
      founderCountrySlug.value = founder.value.country_slug || ''
      founderTwitterUrl.value = founder.value.twitter_url || ''
      founderLinkedinUrl.value = founder.value.linkedin_url || ''
      founderInstagramUrl.value = founder.value.instagram_url || ''
    }
  }

  function triggerAvatarInput() {
    avatarFileInput.value?.click()
  }

  function handleAvatarFile(file: File) {
    if (!file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const MAX_DIM = 320
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
        founderAvatarBase64.value = canvas.toDataURL('image/webp', 0.85)
      }
      img.src = e.target?.result as string
    }
    reader.readAsDataURL(file)
  }

  function onAvatarFileChange(event: Event) {
    const target = event.target as HTMLInputElement
    if (target.files?.length) {
      handleAvatarFile(target.files[0])
    }
  }

  function onAvatarDrop(event: DragEvent) {
    isDraggingAvatar.value = false
    if (event.dataTransfer?.files?.length) {
      handleAvatarFile(event.dataTransfer.files[0])
    }
  }

  async function saveFounderProfile() {
    saving.value = true
    errorMessage.value = ''
    savedSuccess.value = false

    try {
      await $fetch('/api/founder/update-profile', {
        method: 'PATCH',
        body: {
          name: founderName.value,
          bio: founderBio.value,
          avatarUrl: !founderAvatarBase64.value ? founderAvatarUrl.value : undefined,
          avatarFileBase64: founderAvatarBase64.value || undefined,
          countrySlug: founderCountrySlug.value,
          twitterUrl: founderTwitterUrl.value,
          linkedinUrl: founderLinkedinUrl.value,
          instagramUrl: founderInstagramUrl.value
        }
      })
      await checkSession(true)
      savedSuccess.value = true
      setTimeout(() => { savedSuccess.value = false }, 3500)
    } catch (e: any) {
      errorMessage.value = e?.data?.message || 'Error al guardar el perfil'
    } finally {
      saving.value = false
    }
  }

  return {
    founderName,
    founderBio,
    founderAvatarUrl,
    founderAvatarBase64,
    founderCountrySlug,
    founderTwitterUrl,
    founderLinkedinUrl,
    founderInstagramUrl,
    isDraggingAvatar,
    avatarFileInput,
    saving,
    savedSuccess,
    errorMessage,
    syncFromSession,
    triggerAvatarInput,
    onAvatarFileChange,
    onAvatarDrop,
    saveFounderProfile
  }
}
