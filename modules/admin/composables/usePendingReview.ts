import { useAdminAuth } from './useAdminAuth'

export interface PendingSaas {
  id: string
  name: string | null
  slug: string | null
  logo_url: string | null
  website_url: string | null
  founder_email: string | null
  startup_type: string | null
  published_at: string | null
  categories: { name: string; slug: string }[]
}

export function usePendingReview() {
  const { getHeaders } = useAdminAuth()

  const pendingList = ref<PendingSaas[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const actionLoading = ref<Record<string, boolean>>({})

  const load = async () => {
    loading.value = true
    error.value = null
    try {
      const data = await $fetch<PendingSaas[]>('/api/admin/pending', {
        headers: getHeaders()
      })
      pendingList.value = data
    } catch (err: any) {
      const code = err?.statusCode ?? err?.status ?? err?.data?.statusCode
      error.value = code === 401 ? 'Clave incorrecta.' : 'Error al cargar los pendientes.'
    } finally {
      loading.value = false
    }
  }

  const review = async (id: string, action: 'approve' | 'reject') => {
    actionLoading.value = { ...actionLoading.value, [id]: true }
    try {
      await $fetch('/api/admin/review', {
        method: 'POST',
        headers: getHeaders(),
        body: { saasId: id, action }
      })
      pendingList.value = pendingList.value.filter(s => s.id !== id)
    } catch (err: any) {
      error.value = err?.data?.message || 'Error al procesar la acción.'
    } finally {
      const next = { ...actionLoading.value }
      delete next[id]
      actionLoading.value = next
    }
  }

  const approve = (id: string) => review(id, 'approve')
  const reject = (id: string) => review(id, 'reject')

  return { pendingList, loading, error, actionLoading, load, approve, reject }
}
