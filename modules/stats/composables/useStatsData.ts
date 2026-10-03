import type { StatsOverviewResponse } from '../types'

export function useStatsData() {
  const tz = import.meta.client ? Intl.DateTimeFormat().resolvedOptions().timeZone : 'America/Bogota'
  const { data, pending, error, refresh } = useFetch<StatsOverviewResponse>('/api/stats', {
    query: { tz }
  })

  return {
    stats: data,
    pending,
    error,
    refresh
  }
}
