import { fetchSaasList } from '~/modules/ranking/server/services/ranking'

export default defineEventHandler(() => fetchSaasList({ sort: 'latest', limit: 6 }))
