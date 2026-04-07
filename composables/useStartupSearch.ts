const query = ref('')

export function useStartupSearch() {
  function setQuery(value: string) {
    query.value = value.trim()
  }

  function filterItems<T extends { name: string | null; founderName: string | null; category: string; mrr: number | null }>(
    items: T[]
  ): T[] {
    const q = query.value.toLowerCase()
    if (!q) return items

    return items.filter((item) => {
      const name = item.name?.toLowerCase() ?? ''
      const founder = item.founderName?.toLowerCase() ?? ''
      const category = item.category.toLowerCase()
      const mrr = item.mrr?.toString() ?? ''
      return name.includes(q) || founder.includes(q) || category.includes(q) || mrr.includes(q)
    })
  }

  return { query: readonly(query), setQuery, filterItems }
}
