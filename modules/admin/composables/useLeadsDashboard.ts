import type { Lead, LeadStats } from '../types/lead'
import { useAdminAuth } from './useAdminAuth'

export function useLeadsDashboard() {
    const { getHeaders } = useAdminAuth()

    const stats = ref<LeadStats | null>(null)
    const leads = ref<Lead[]>([])
    const total = ref(0)
    const page = ref(1)
    const limit = 20
    const loading = ref(false)
    const error = ref<string | null>(null)

    const fetchStats = async () => {
        const data = await $fetch<LeadStats>('/api/admin/stats', { headers: getHeaders() })
        stats.value = data
    }

    const fetchLeads = async () => {
        const data = await $fetch<{ leads: Lead[], total: number }>('/api/admin/leads', {
            headers: getHeaders(),
            query: { page: page.value, limit },
        })
        leads.value = data.leads
        total.value = data.total
    }

    const load = async () => {
        loading.value = true
        error.value = null
        try {
            await Promise.all([fetchStats(), fetchLeads()])
        } catch (err: any) {
            error.value = err?.status === 401
                ? 'Clave incorrecta.'
                : 'Error al cargar los datos.'
        } finally {
            loading.value = false
        }
    }

    const nextPage = async () => {
        if (page.value * limit >= total.value) return
        page.value++
        await fetchLeads()
    }

    const prevPage = async () => {
        if (page.value <= 1) return
        page.value--
        await fetchLeads()
    }

    return { stats, leads, total, page, limit, loading, error, load, nextPage, prevPage }
}
