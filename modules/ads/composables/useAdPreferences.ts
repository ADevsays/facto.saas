import { computed } from 'vue'

export function useAdPreferences() {
  const hideAds = useState<boolean>('facto_ads_hidden', () => false)
  const canHideAds = useState<boolean>('facto_can_hide_ads', () => false)
  const isAdFree = useState<boolean>('facto_is_ad_free', () => false)
  const initialized = useState<boolean>('facto_ad_pref_init', () => false)

  const checkPreferences = async (force = false) => {
    if (import.meta.server) return
    if (initialized.value && !force) return

    const storedToken = localStorage.getItem('facto_ad_free_token')
    const storedPref = localStorage.getItem('facto_hide_ads')

    if (storedToken) {
      isAdFree.value = true
      canHideAds.value = true
    }

    try {
      const data = await $fetch<{ canHideAds: boolean; isAdFree: boolean; hasPaidAds: boolean }>('/api/ads/my-ads')
      if (data) {
        if (data.canHideAds || data.isAdFree || data.hasPaidAds) {
          canHideAds.value = true
        }
        if (data.isAdFree) {
          isAdFree.value = true
        }
      }
    } catch {}

    if (canHideAds.value && storedPref === 'true') {
      hideAds.value = true
    } else if (!canHideAds.value) {
      hideAds.value = false
    }

    initialized.value = true
  }

  const setHideAds = (val: boolean) => {
    hideAds.value = val
    if (import.meta.client) {
      localStorage.setItem('facto_hide_ads', String(val))
    }
  }

  const unlockAdFree = (token?: string) => {
    isAdFree.value = true
    canHideAds.value = true
    hideAds.value = true
    if (import.meta.client) {
      if (token) {
        localStorage.setItem('facto_ad_free_token', token)
      }
      localStorage.setItem('facto_hide_ads', 'true')
    }
  }

  return {
    showAds: computed(() => !hideAds.value),
    hideAds: computed(() => hideAds.value),
    canHideAds: computed(() => canHideAds.value),
    isAdFree: computed(() => isAdFree.value),
    checkPreferences,
    setHideAds,
    unlockAdFree
  }
}
