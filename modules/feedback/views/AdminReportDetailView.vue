<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAdminReports } from '~/modules/feedback/composables/useAdminReports'
import { useAdminAuth } from '~/modules/admin/composables/useAdminAuth'
import AdminLogin from '~/modules/admin/components/AdminLogin.vue'
import DashboardHeader from '~/modules/admin/components/DashboardHeader.vue'
import type { FeedbackReport } from '~/modules/feedback/types'

const route = useRoute()
const router = useRouter()
const id = route.params.id as string

const {
  updateStatus,
  fetchReportById,
  formatDate
} = useAdminReports()

const { isAuthenticated, init, login, logout } = useAdminAuth()

const loginError = ref('')
const isChecking = ref(true)
const loading = ref(true)
const report = ref<FeedbackReport | null>(null)
const isUpdating = ref(false)

const handleLogin = async (key: string) => {
    loginError.value = ''
    login(key)
    await loadData()
    if (!report.value) {
        logout()
        loginError.value = 'Clave incorrecta.'
    }
}

const handleLogout = () => {
    logout()
    router.push('/admin/reportes')
}

const loadData = async () => {
  loading.value = true
  report.value = await fetchReportById(id)
  loading.value = false
}

onMounted(async () => {
    init()
    if (isAuthenticated.value) {
      await loadData()
    }
    isChecking.value = false
})

const toggleStatus = async () => {
  if (isUpdating.value || !report.value) return
  isUpdating.value = true
  const newStatus = report.value.status === 'pending' ? 'resolved' : 'pending'
  await updateStatus(report.value.id, newStatus)
  report.value.status = newStatus
  setTimeout(() => {
    isUpdating.value = false
  }, 500)
}
</script>

<template>
  <div class="min-h-screen bg-[#030305] font-sans">
    <Transition name="fade">
        <div v-if="isChecking" class="fixed inset-0 bg-[#030305] flex items-center justify-center z-50">
            <span class="text-[10px] uppercase tracking-[0.2em] text-gray-700 animate-pulse">Verificando…</span>
        </div>
    </Transition>

    <AdminLogin 
        v-if="!isChecking && !isAuthenticated" 
        :error="loginError"
        @login="handleLogin"
    />

    <div v-else-if="!isChecking" class="max-w-4xl mx-auto px-8 py-10 relative isolate">
        <div class="absolute top-0 right-0 w-[600px] h-[600px] bg-[#00D4FF]/[0.02] blur-[120px] rounded-full pointer-events-none -z-10"></div>
        
        <DashboardHeader 
            :title="`Reporte #${id.split('-')[0]}`"
            :loading="loading"
            @refresh="loadData"
            @logout="handleLogout"
        />

        <div v-if="loading" class="py-32 flex flex-col items-center justify-center gap-4 text-neutral-500 stagger-fade">
          <Icon name="lucide:loader-2" class="animate-spin text-[#00D4FF] text-4xl" />
          <span class="text-[10px] uppercase tracking-[0.2em] font-bold">Cargando reporte...</span>
        </div>

        <div v-else-if="!report" class="text-center py-32 text-neutral-500 font-extralight tracking-wide">
            Reporte no encontrado o error de autenticación.
            <NuxtLink to="/admin/reportes" class="block mt-4 text-[#00D4FF] underline">Volver a reportes</NuxtLink>
        </div>

        <div v-else class="bg-white/[0.01] border border-white/[0.05] rounded-3xl overflow-hidden mt-8 shadow-2xl">
          <div v-if="report.image_url" class="w-full h-[400px] bg-[#010101] relative flex-shrink-0">
            <img :src="report.image_url" class="w-full h-full object-contain" />
          </div>
          
          <div class="p-8 md:p-12">
            <div class="flex flex-wrap gap-4 justify-between items-center mb-8 border-b border-white/5 pb-8">
              <div>
                <NuxtLink to="/admin/reportes" class="text-[10px] uppercase tracking-[0.2em] text-[#00D4FF] mb-6 inline-flex items-center gap-2 hover:opacity-80 transition-opacity">
                  <Icon name="lucide:arrow-left" size="14" /> Volver a reportes
                </NuxtLink>
                <div class="flex items-center gap-3 text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-neutral-400">
                  <Icon name="lucide:calendar" size="14" />
                  {{ formatDate(report.created_at) }}
                </div>
              </div>
              <button 
                @click="toggleStatus"
                :disabled="isUpdating"
                class="text-[10px] uppercase tracking-[0.2em] px-4 py-2 rounded-full border transition-all duration-300 flex items-center gap-2 hover:-translate-y-[1px] hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed" 
                :class="report.status === 'pending' ? 'border-yellow-500/30 text-yellow-500/90 bg-yellow-500/10 hover:bg-yellow-500/20 shadow-[0_0_15px_rgba(234,179,8,0.1)]' : 'border-green-500/30 text-green-500/90 bg-green-500/10 hover:bg-green-500/20 shadow-[0_0_15px_rgba(34,197,94,0.1)]'"
              >
                <Icon v-if="isUpdating" name="lucide:loader-2" class="animate-spin" size="14" />
                <Icon v-else :name="report.status === 'pending' ? 'lucide:clock' : 'lucide:check-circle'" size="14" />
                {{ report.status === 'pending' ? 'Marcar Resuelto' : 'Marcar Pendiente' }}
              </button>
            </div>
            
            <div class="prose prose-invert max-w-none">
              <p class="font-sans font-light text-base md:text-lg text-neutral-300 leading-relaxed whitespace-pre-wrap">{{ report.details }}</p>
            </div>
          </div>
        </div>
    </div>
  </div>
</template>

<style scoped>
.fade-leave-active { transition: opacity 0.3s ease; }
.fade-leave-to    { opacity: 0; }
</style>
