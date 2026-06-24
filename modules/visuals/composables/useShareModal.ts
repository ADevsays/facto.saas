import { ref } from 'vue'

const isOpen = ref(false)
const saasData = ref<{ name: string; url: string; slug?: string } | null>(null)

export function useShareModal() {
  const config = useRuntimeConfig()

  const openShare = (name: string, slug: string) => {
    // Usamos la variable de entorno para construir el link real
    const baseUrl = config.public.siteUrl || 'http://localhost:3000'
    const url = `${baseUrl}/saas/${slug}`
    
    saasData.value = { name, url, slug }
    isOpen.value = true
  }

  const closeShare = () => {
    isOpen.value = false
    setTimeout(() => {
      saasData.value = null
    }, 300)
  }

  return {
    isOpen,
    saasData,
    openShare,
    closeShare
  }
}
