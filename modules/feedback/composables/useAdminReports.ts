import { ref } from 'vue'
import gsap from 'gsap'
import type { FeedbackReport } from '~/modules/feedback/types'
import { useAdminAuth } from '~/modules/admin/composables/useAdminAuth'

export function useAdminReports() {
  const reports = ref<FeedbackReport[]>([])
  const loading = ref(false)
  const errorMsg = ref('')

  const { getHeaders } = useAdminAuth()

  const fetchReports = async () => {
    loading.value = true
    errorMsg.value = ''
    
    try {
      const data = await $fetch<FeedbackReport[]>('/api/admin/feedback/list', {
        headers: getHeaders()
      })
      reports.value = data
      
      setTimeout(() => {
        gsap.from('.report-card', {
          y: 30,
          opacity: 0,
          duration: 1,
          stagger: 0.1,
          ease: 'power3.out'
        })
      }, 100)
      
    } catch (e: any) {
      errorMsg.value = 'Clave incorrecta.'
    } finally {
      loading.value = false
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('es-ES', {
      dateStyle: 'medium',
      timeStyle: 'short'
    })
  }

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const data = await $fetch<{ success: boolean, report: FeedbackReport }>('/api/admin/feedback/status', {
        method: 'PATCH',
        headers: getHeaders(),
        body: { id, status: newStatus }
      })
      if (data.success) {
        const index = reports.value.findIndex(r => r.id === id)
        if (index !== -1) {
          reports.value[index] = data.report
        }
      }
    } catch (e: any) {
      console.error('Error updating status', e)
      alert('Error al actualizar el estado')
    }
  }

  const fetchReportById = async (id: string) => {
    try {
      const data = await $fetch<FeedbackReport>(`/api/admin/feedback/${id}`, {
        headers: getHeaders()
      })
      return data
    } catch (e: any) {
      console.error('Error fetching report by ID', e)
      return null
    }
  }

  return {
    reports,
    loading,
    errorMsg,
    fetchReports,
    fetchReportById,
    updateStatus,
    formatDate
  }
}
