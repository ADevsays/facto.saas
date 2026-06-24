<script setup lang="ts">
import AdminLogin from '../components/AdminLogin.vue'
import DashboardHeader from '../components/DashboardHeader.vue'
import PendingCard from '../components/PendingCard.vue'
import { usePendingReview } from '../composables/usePendingReview'
import { useAdminAuth } from '../composables/useAdminAuth'

const { isAuthenticated, init, login, logout } = useAdminAuth()
const { pendingList, loading, error, actionLoading, load, approve, reject } = usePendingReview()

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

    <!-- Checking session -->
    <Transition name="fade">
      <div v-if="isChecking" class="fixed inset-0 bg-[#030305] flex items-center justify-center z-50">
        <span class="text-[10px] uppercase tracking-[0.2em] text-gray-700 animate-pulse">Verificando…</span>
      </div>
    </Transition>

    <!-- Login -->
    <AdminLogin
      v-if="!isChecking && !isAuthenticated"
      :error="loginError"
      @login="handleLogin"
    />

    <!-- Dashboard -->
    <div v-else-if="!isChecking" class="max-w-7xl mx-auto px-8 py-10">

      <DashboardHeader
        title="Startups Pendientes"
        :loading="loading"
        @refresh="load"
        @logout="logout"
      />

      <p v-if="error" class="text-[11px] text-red-400/80 mb-8 tracking-wide">{{ error }}</p>

      <!-- Empty state -->
      <div
        v-if="!loading && pendingList.length === 0"
        class="flex flex-col items-center justify-center py-32 gap-4"
      >
        <div class="w-16 h-16 rounded-full border border-white/5 flex items-center justify-center">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
        <p class="text-[11px] uppercase tracking-[0.2em] text-neutral-700">Sin pendientes</p>
        <p class="text-[12px] text-neutral-800 font-light">Todo está al día ✓</p>
      </div>

      <!-- Skeleton loading -->
      <div v-else-if="loading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <div
          v-for="i in 6"
          :key="i"
          class="bg-white/[0.02] border border-white/[0.04] rounded-2xl p-6 h-56 animate-pulse"
        />
      </div>

      <!-- Cards grid -->
      <TransitionGroup
        v-else
        name="card-out"
        tag="div"
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
      >
        <PendingCard
          v-for="saas in pendingList"
          :key="saas.id"
          :saas="saas"
          :action-loading="!!actionLoading[saas.id]"
          @approve="approve"
          @reject="reject"
        />
      </TransitionGroup>

      <!-- Counter -->
      <p v-if="!loading && pendingList.length > 0" class="text-[10px] uppercase tracking-widest text-neutral-700 mt-8 text-center">
        {{ pendingList.length }} startup{{ pendingList.length !== 1 ? 's' : '' }} pendiente{{ pendingList.length !== 1 ? 's' : '' }}
      </p>

    </div>
  </div>
</template>

<style scoped>
.fade-leave-active { transition: opacity 0.3s ease; }
.fade-leave-to    { opacity: 0; }

.card-out-move {
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}
.card-out-leave-active {
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  position: absolute;
}
.card-out-leave-to {
  opacity: 0;
  transform: scale(0.95) translateY(-10px);
}
</style>
