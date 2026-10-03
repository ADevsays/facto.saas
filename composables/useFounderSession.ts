import { computed } from 'vue'

interface FounderProfile {
  id?: string
  email: string
  name: string | null
  avatar_url?: string | null
  bio?: string | null
  twitter_url?: string | null
  linkedin_url?: string | null
  instagram_url?: string | null
  country_slug?: string | null
}

export function useFounderSession() {
  const isAuthenticated = useState<boolean>('facto_founder_auth', () => false)
  const founder = useState<FounderProfile | null>('facto_founder_profile', () => null)
  const startups = useState<any[]>('facto_founder_startups', () => [])
  const isChecking = useState<boolean>('facto_founder_checking', () => false)
  const isInitialized = useState<boolean>('facto_founder_init', () => false)

  const checkSession = async (force = false) => {
    if (isInitialized.value && !force && isAuthenticated.value) return
    try {
      const headers = import.meta.server ? useRequestHeaders(['cookie']) : undefined
      const data = await $fetch<{ authenticated: boolean; email?: string; founder: FounderProfile | null; startups: any[] }>('/api/founder/session', { headers })
      isAuthenticated.value = data.authenticated
      founder.value = data.founder
      startups.value = data.startups || []
      isInitialized.value = true
    } catch {
      isAuthenticated.value = false
      founder.value = null
      startups.value = []
      isInitialized.value = true
    } finally {
      isChecking.value = false
    }
  }

  const logout = async () => {
    try {
      await $fetch('/api/founder/logout', { method: 'POST' })
    } finally {
      isAuthenticated.value = false
      founder.value = null
      startups.value = []
      if (import.meta.client) {
        // Limpiar restos de localStorage
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith('facto_founder_verified_')) {
            localStorage.removeItem(key)
          }
        })
      }
    }
  }

  const isOwnerOf = (founderEmail?: string | null, saasId?: string) => {
    if (!isAuthenticated.value) return false
    if (founderEmail && founder.value?.email && founder.value.email.toLowerCase() === founderEmail.toLowerCase()) return true
    if (saasId && startups.value.some(s => s.id === saasId || s.slug === saasId)) return true
    return false
  }

  return {
    isAuthenticated: computed(() => isAuthenticated.value),
    founder: computed(() => founder.value),
    startups: computed(() => startups.value),
    isChecking: computed(() => isChecking.value),
    checkSession,
    logout,
    isOwnerOf
  }
}
