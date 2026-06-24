<script setup lang="ts">
import { ref, onMounted } from 'vue'
import AdminReportCard from '~/modules/feedback/components/AdminReportCard.vue'
import { useAdminReports } from '~/modules/feedback/composables/useAdminReports'
import { useAdminAuth } from '~/modules/admin/composables/useAdminAuth'
import AdminLogin from '~/modules/admin/components/AdminLogin.vue'
import DashboardHeader from '~/modules/admin/components/DashboardHeader.vue'

const {
  reports,
  loading,
  errorMsg,
  fetchReports
} = useAdminReports()

const { isAuthenticated, init, login, logout } = useAdminAuth()

const loginError = ref('')
const isChecking = ref(true)

const handleLogin = async (key: string) => {
    loginError.value = ''
    login(key)
    await fetchReports()
    if (errorMsg.value === 'Clave incorrecta.') {
        logout()
        loginError.value = 'Clave incorrecta.'
    }
}

const handleLogout = () => {
    logout()
}

onMounted(async () => {
    init()
    if (isAuthenticated.value) await fetchReports()
    isChecking.value = false
})
</script>

<template>
    <div class="min-h-screen bg-[#030305] font-sans">

        <!-- ── Checking session ───────────────────────── -->
        <Transition name="fade">
            <div v-if="isChecking" class="fixed inset-0 bg-[#030305] flex items-center justify-center z-50">
                <span class="text-[10px] uppercase tracking-[0.2em] text-gray-700 animate-pulse">Verificando…</span>
            </div>
        </Transition>

        <!-- ── Login ─────────────────────────────────── -->
        <AdminLogin 
            v-if="!isChecking && !isAuthenticated" 
            :error="loginError"
            @login="handleLogin"
        />

        <!-- ── Dashboard ──────────────────────────────── -->
        <div v-else-if="!isChecking" class="max-w-7xl mx-auto px-8 py-10 relative isolate">
            <!-- Premium Glows that are part of Facto Design but now sit inside the layout -->
            <div class="absolute top-0 right-0 w-[600px] h-[600px] bg-[#00D4FF]/[0.02] blur-[120px] rounded-full pointer-events-none -z-10"></div>
            
            <DashboardHeader 
                title="Reportes"
                :loading="loading"
                @refresh="fetchReports"
                @logout="handleLogout"
            />

            <div v-if="reports.length === 0 && !loading" class="text-center py-32 text-neutral-500 font-extralight tracking-wide">
                No hay reportes registrados por el momento.
            </div>

            <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <AdminReportCard 
                    v-for="report in reports" 
                    :key="report.id" 
                    :report="report" 
                />
            </div>
            
        </div>
    </div>
</template>

<style scoped>
.fade-leave-active { transition: opacity 0.3s ease; }
.fade-leave-to    { opacity: 0; }
</style>
