import { onMounted } from 'vue'
import type { StatsOverviewResponse } from '../types'

export function useStatsData() {
  const tz = import.meta.client ? Intl.DateTimeFormat().resolvedOptions().timeZone : 'America/Bogota'
  const { data, pending, error, refresh } = useFetch<StatsOverviewResponse>('/api/stats', {
    key: 'facto-stats-data',
    query: { tz }
  })

  if (import.meta.client) {
    onMounted(() => {
      refresh()
    })
  }

  return {
    stats: data,
    pending,
    error,
    refresh
  }
}
