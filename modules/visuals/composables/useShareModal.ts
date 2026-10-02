import { ref } from 'vue'

export interface SaasShareOptions {
  name: string
  slug: string
  logoUrl?: string | null
  views?: number
  allTimeRevenue?: string
  mrr?: number | null
  currency?: string
}

export interface SaasShareData {
  name: string
  url: string
  slug: string
  logoUrl?: string | null
  views: number
  allTimeRevenue?: string
  mrr?: number | null
  currency: string
  shareText: string
  revenueDisplay: string
  viewsDisplay: string
}

const isOpen = ref(false)
const saasData = ref<SaasShareData | null>(null)

export function useShareModal() {
  const config = useRuntimeConfig()

  const openShare = (
    param1: string | SaasShareOptions,
    param2?: string
  ) => {
    const baseUrl = config.public.siteUrl || 'http://localhost:3000'
    
    let options: SaasShareOptions
    if (typeof param1 === 'string') {
      options = {
        name: param1,
        slug: param2 || '',
        views: 0
      }
    } else {
      options = param1
    }

    const { name, slug, logoUrl = null, views = 0, allTimeRevenue, mrr, currency = 'USD' } = options
    const { locale } = useI18n()
    const isEn = locale.value === 'en'
    const pathPrefix = isEn ? '/en/saas' : '/saas'
    const url = `${baseUrl}${pathPrefix}/${slug}?ref=facto&utm_source=share&utm_medium=social_proof`
    
    const formattedViews = views > 0 ? views.toLocaleString('en-US') : '0'
    const hasRevenue = allTimeRevenue && allTimeRevenue !== '—' && allTimeRevenue !== '$0'
    const hasMrr = mrr !== null && mrr !== undefined && mrr > 0

    let revenueDisplay = '$0'
    if (hasRevenue) {
      revenueDisplay = allTimeRevenue
    } else if (hasMrr) {
      revenueDisplay = `$${mrr >= 1000 ? (mrr / 1000).toFixed(1) + 'K' : mrr}`
    }

    let shareText = ''
    if (isEn) {
      if (hasRevenue || hasMrr) {
        shareText = `From $0 to ${revenueDisplay} billed in weeks. ${name} already has ${formattedViews} real visits. This is public validation, not vanity metrics. Check out the numbers:`
      } else if (views > 0) {
        shareText = `${name} already reached ${formattedViews} real visits on @factosaas. This is public validation, not vanity metrics. Check out the numbers:`
      } else {
        shareText = `Discover ${name} on the official Facto leaderboard:`
      }
    } else {
      if (hasRevenue || hasMrr) {
        shareText = `De 0 a ${revenueDisplay} facturados en semanas. ${name} ya tiene ${formattedViews} visitas reales. Esto es validación pública, no vanity metrics. Mira los números:`
      } else if (views > 0) {
        shareText = `${name} ya acumula ${formattedViews} visitas reales en @factosaas. Esto es validación pública, no vanity metrics. Mira los números:`
      } else {
        shareText = `Descubre ${name} en el ranking oficial de Facto:`
      }
    }

    saasData.value = {
      name,
      url,
      slug,
      logoUrl,
      views,
      allTimeRevenue,
      mrr,
      currency,
      shareText,
      revenueDisplay,
      viewsDisplay: formattedViews
    }
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
