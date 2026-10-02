import { computed } from 'vue'
import { useRoute, useRouter } from '#app'
import { ROUTES } from '~/utils/routes'
import { getContinent } from '~/utils/continents'

export function useCountryFilter() {
  const route = useRoute()
  const router = useRouter()
  const localePath = useLocalePath()

  const isOnCountryRoute = computed(() => route.path.includes('/saas/pais') || route.path.includes('/saas/country'))
  const isOnCategoryRoute = computed(() => route.path.includes('/saas/categoria') || route.path.includes('/saas/category'))
  const isOnContinentRoute = computed(() => route.path.includes('/saas/continente') || route.path.includes('/saas/continent'))

  const continentSlug = computed(() => (isOnContinentRoute.value ? (route.params.slug as string) : ''))
  const continent = computed(() => (continentSlug.value ? getContinent(continentSlug.value) : undefined))

  const country = computed(() => {
    if (isOnCountryRoute.value) {
      return (route.params.slug as string) || ''
    }
    return (route.query.pais as string) || ''
  })

  function setCountry(value: string) {
    if (isOnCategoryRoute.value || isOnContinentRoute.value) {
      if (value === 'all' || !value || value === 'global') {
        const { pais, ...rest } = route.query
        router.push({ path: route.path, query: rest })
      } else {
        router.push({ path: route.path, query: { ...route.query, pais: value } })
      }
    } else {
      if (value === 'all' || !value || value === 'global') {
        router.push(localePath('/saas'))
      } else {
        router.push(localePath(`${ROUTES.COUNTRY}/${value}`))
      }
    }
  }

  function filterByCountry<T extends { country?: { slug: string } | null }>(items: T[]): T[] {
    if (isOnContinentRoute.value) {
      const c = country.value
      if (c && c !== 'all' && c !== 'global') {
        return items.filter(item => item.country?.slug === c)
      }
      if (continent.value) {
        const allowed = new Set(continent.value.countrySlugs)
        return items.filter(item => item.country?.slug && allowed.has(item.country.slug))
      }
      return items
    }

    const c = country.value
    if (!c || c === 'all') return items

    return items.filter((item) => {
      return item.country?.slug === c
    })
  }

  return {
    country,
    setCountry,
    filterByCountry,
    isOnContinentRoute,
    continentSlug,
    continent
  }
}
