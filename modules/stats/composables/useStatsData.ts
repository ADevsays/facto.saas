import type { StatsOverviewResponse } from '../types'

export function useStatsData() {
  const { data, pending, error, refresh } = useFetch<StatsOverviewResponse>('/api/stats')

  return {
    stats: data,
    pending,
    error,
    refresh
  }
}
