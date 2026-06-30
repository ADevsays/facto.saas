import { computed } from 'vue'
import { useRoute, useRouter } from '#app'

export function useCountryFilter() {
  const route = useRoute()
  const router = useRouter()

  const country = computed(() => {
    if (route.path.includes('/saas/pais')) {
      return (route.params.slug as string) || ''
    }
    return ''
  })

  function setCountry(value: string) {
    if (value === 'all' || !value || value === 'global') {
      router.push('/saas')
    } else {
      router.push(`/saas/pais/${value}`)
    }
  }

  function filterByCountry<T extends { country?: { slug: string } | null }>(items: T[]): T[] {
    const c = country.value
    if (!c || c === 'all') return items
    
    return items.filter((item) => {
      return item.country?.slug === c
    })
  }

  return { country, setCountry, filterByCountry }
}
