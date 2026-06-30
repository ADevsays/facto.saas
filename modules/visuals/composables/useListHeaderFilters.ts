import { ref, computed } from 'vue'
import { useCategoryFilter } from '~/composables/useCategoryFilter'
import { useSortFilter } from '~/composables/useSortFilter'
import { useCountryFilter } from '~/composables/useCountryFilter'
import { useCategories } from '~/composables/useCategories'

export function useListHeaderFilters() {
  const { category, setCategory } = useCategoryFilter()
  const { country, setCountry } = useCountryFilter()
  const { sort, setSort } = useSortFilter()
  const { categories } = useCategories()

  const isSortOpen = ref(false)
  const isCategoryOpen = ref(false)
  const isCountryOpen = ref(false)

  const sortOptions = [
    { value: 'latest', label: 'Últimas añadidas' },
    { value: 'mrr', label: 'Mayor MRR' },
    { value: 'views', label: 'Más vistas' }
  ]

  const categoryOptions = computed(() => {
    const filtered = categories.value.filter(c => c.slug !== 'other')
    return [
      { name: 'Todas las categorías', slug: 'all' },
      ...filtered.map(c => ({ name: c.name, slug: c.slug }))
    ]
  })

  const currentSortLabel = computed(() => {
    return sortOptions.find(o => o.value === sort.value)?.label || 'Ordenar'
  })

  const currentCategoryLabel = computed(() => {
    return categoryOptions.value.find(o => o.slug === (category.value || 'all'))?.name || 'Categorías'
  })

  function toggleSort() {
    isSortOpen.value = !isSortOpen.value
    isCategoryOpen.value = false
    isCountryOpen.value = false
  }

  function toggleCategory() {
    isCategoryOpen.value = !isCategoryOpen.value
    isSortOpen.value = false
    isCountryOpen.value = false
  }

  function toggleCountry() {
    isCountryOpen.value = !isCountryOpen.value
    isSortOpen.value = false
    isCategoryOpen.value = false
  }

  function closeDropdowns() {
    isSortOpen.value = false
    isCategoryOpen.value = false
    isCountryOpen.value = false
  }

  function selectSort(val: string) {
    setSort(val as 'latest' | 'mrr' | 'views')
    isSortOpen.value = false
  }

  function selectCategoryOption(val: string) {
    setCategory(val)
    isCategoryOpen.value = false
  }
  
  function selectCountryOption(val: string) {
    setCountry(val)
    isCountryOpen.value = false
  }

  return {
    category,
    country,
    sort,
    isSortOpen,
    isCategoryOpen,
    isCountryOpen,
    sortOptions,
    categoryOptions,
    currentSortLabel,
    currentCategoryLabel,
    toggleSort,
    toggleCategory,
    toggleCountry,
    closeDropdowns,
    selectSort,
    selectCategoryOption,
    selectCountryOption
  }
}
