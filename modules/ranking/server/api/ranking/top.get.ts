import { fetchSaasList } from '~/modules/ranking/server/services/ranking'

export default defineEventHandler(() => fetchSaasList({ sort: 'views', limit: 6 }))
