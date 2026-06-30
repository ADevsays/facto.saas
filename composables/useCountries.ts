import { useState } from '#app'

export const useCountries = () => {
  const countries = useState<{ id: number; name: string; slug: string; flag: string; iso_code: string }[]>('countries', () => [])

  const fetchCountries = async () => {
    if (countries.value.length > 0) return
    try {
      const data = await $fetch('/api/countries')
      countries.value = data as any
    } catch (e) {
      console.error('Failed to fetch countries', e)
    }
  }

  return {
    countries,
    fetchCountries
  }
}
