<script setup lang="ts">
import LeadsTrendChart from '../components/LeadsTrendChart.client.vue'
import LeadsDistributionChart from '../components/LeadsDistributionChart.client.vue'
import LeadsTable from '../components/LeadsTable.vue'
import { useLeadsDashboard } from '../composables/useLeadsDashboard'
import { useAdminAuth } from '../composables/useAdminAuth'

const MOTIVATION_LABELS: Record<string, string> = {
    reach: 'Aumentar alcance',
    authority: 'Autoridad',
    seo: 'SEO',
    investment: 'Inversión',
}

const { isAuthenticated, init, login, logout } = useAdminAuth()
const { stats, leads, total, page, limit, loading, error, load, nextPage, prevPage } = useLeadsDashboard()

const keyInput = ref('')
const loginError = ref('')
const isChecking = ref(true)

const handleLogin = async () => {
    if (!keyInput.value.trim()) return
    loginError.value = ''
    login(keyInput.value)
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
        <div v-if="!isChecking && !isAuthenticated" class="min-h-screen flex items-center justify-center px-6">
            <div
                class="w-full max-w-lg rounded-3xl px-12 py-14"
                style="background: rgba(10,10,14,0.99); border: 1px solid rgba(255,255,255,0.08);"
            >
                <p class="text-[10px] uppercase tracking-[0.2em] text-cyan-600 mb-2">Facto</p>
                <h1 class="font-serif text-4xl text-white mb-12 leading-tight">
                    Panel de<br>acceso
                </h1>

                <input
                    v-model="keyInput"
                    type="password"
                    placeholder="Admin key"
                    class="w-full bg-transparent border-b py-3 text-white text-base outline-none placeholder-white/15 transition-colors focus:border-cyan-500"
                    style="border-color: rgba(255,255,255,0.12); caret-color: #00D4FF;"
                    @keydown.enter="handleLogin"
                    autofocus
                />

                <p v-if="loginError" class="text-[11px] text-red-400/80 mt-3 tracking-wide">
                    {{ loginError }}
                </p>

                <button
                    class="login-btn mt-10 w-full flex items-center justify-center gap-2 px-5 py-3 rounded-full text-[11px] font-bold uppercase tracking-widest"
                    @click="handleLogin"
                >
                    Entrar
                    <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                </button>
            </div>
        </div>

        <!-- ── Dashboard ──────────────────────────────── -->
        <template v-else>
            <div class="max-w-7xl mx-auto px-8 py-10">

                <div class="flex items-center justify-between mb-12">
                    <div>
                        <p class="text-[10px] uppercase tracking-[0.2em] text-cyan-600 mb-1">Facto · Admin</p>
                        <h1 class="font-serif text-4xl text-white">Beta Leads</h1>
                    </div>
                    <div class="flex items-center gap-3">
                        <button
                            class="text-[11px] uppercase tracking-widest text-gray-600 hover:text-white transition-colors disabled:opacity-30"
                            :disabled="loading"
                            @click="load"
                        >
                            {{ loading ? 'Cargando…' : 'Actualizar' }}
                        </button>
                        <span class="text-gray-800">·</span>
                        <button
                            class="text-[11px] uppercase tracking-widest text-gray-600 hover:text-white transition-colors"
                            @click="logout"
                        >
                            Salir
                        </button>
                    </div>
                </div>

                <p v-if="error" class="text-[11px] text-red-400/80 mb-8 tracking-wide">{{ error }}</p>

                <template v-if="stats">
                    <div class="mb-10">
                        <p class="font-serif text-7xl text-white leading-none">{{ stats.total }}</p>
                        <p class="text-[10px] uppercase tracking-[0.2em] text-gray-600 mt-2">leads totales</p>
                    </div>

                    <div class="w-full h-px bg-white/5 mb-10" />

                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
                        <LeadsTrendChart :by-day="stats.byDay" />
                        <LeadsDistributionChart
                            title="Pasarela de pago"
                            :data="stats.byGateway"
                        />
                        <LeadsDistributionChart
                            title="Motivación principal"
                            :data="stats.byMotivation"
                            :labels="MOTIVATION_LABELS"
                        />
                    </div>
                </template>

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
        </template>
    </div>
</template>

<style scoped>
.login-btn {
    color: #000;
    background: #ffffff;
    border: 1px solid rgba(255,255,255,0.6);
    transition: background 0.3s ease, box-shadow 0.3s ease, transform 0.2s ease;
}
.login-btn:hover {
    background: rgba(255,255,255,0.9);
    box-shadow:
        0 0 15px rgba(255,255,255,0.35),
        0 0 30px rgba(0,212,255,0.2),
        0 0 45px rgba(0,212,255,0.08);
    transform: translateY(-1px);
}
.fade-leave-active { transition: opacity 0.3s ease; }
.fade-leave-to    { opacity: 0; }
</style>
