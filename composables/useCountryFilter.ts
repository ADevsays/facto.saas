import { computed } from 'vue'
import { useRoute, useRouter } from '#app'
import { ROUTES } from '~/utils/routes'

export function useCountryFilter() {
  const route = useRoute()
  const router = useRouter()

  const isOnCountryRoute = computed(() => route.path.includes(ROUTES.COUNTRY))
  const isOnCategoryRoute = computed(() => route.path.includes(ROUTES.CATEGORY))

  const country = computed(() => {
    if (isOnCountryRoute.value) {
      return (route.params.slug as string) || ''
    }
    return (route.query.pais as string) || ''
  })

  function setCountry(value: string) {
    if (isOnCategoryRoute.value) {
      if (value === 'all' || !value || value === 'global') {
        const { pais, ...rest } = route.query
        router.push({ path: route.path, query: rest })
      } else {
        router.push({ path: route.path, query: { ...route.query, pais: value } })
      }
    } else {
      if (value === 'all' || !value || value === 'global') {
        router.push('/saas')
      } else {
        router.push(`${ROUTES.COUNTRY}/${value}`)
      }
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
