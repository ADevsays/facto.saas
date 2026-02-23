<script setup lang="ts">
import AdminLogin from '../components/AdminLogin.vue'
import DashboardHeader from '../components/DashboardHeader.vue'
import DashboardStats from '../components/DashboardStats.vue'
import LeadsTable from '../components/LeadsTable.vue'
import { useLeadsDashboard } from '../composables/useLeadsDashboard'
import { useAdminAuth } from '../composables/useAdminAuth'

const { isAuthenticated, init, login, logout } = useAdminAuth()
const { stats, leads, total, page, limit, loading, error, load, nextPage, prevPage } = useLeadsDashboard()

const loginError = ref('')
const isChecking = ref(true)

const handleLogin = async (key: string) => {
    loginError.value = ''
    login(key)
    await load()
    if (error.value === 'Clave incorrecta.') {
        logout()
        loginError.value = 'Clave incorrecta.'
    }
}

onMounted(async () => {
    init()
    if (isAuthenticated.value) await load()
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
        <div v-else-if="!isChecking" class="max-w-7xl mx-auto px-8 py-10">
            
            <DashboardHeader 
                :loading="loading"
                @refresh="load"
                @logout="logout"
            />

            <p v-if="error" class="text-[11px] text-red-400/80 mb-8 tracking-wide">{{ error }}</p>

            <DashboardStats 
                v-if="stats"
                :stats="stats" 
            />

            <LeadsTable
                v-if="leads.length"
                :leads="leads"
                :total="total"
                :page="page"
                :limit="limit"
                @next="nextPage"
                @prev="prevPage"
            />

        </div>
    </div>
</template>

<style scoped>
.fade-leave-active { transition: opacity 0.3s ease; }
.fade-leave-to    { opacity: 0; }
</style>
