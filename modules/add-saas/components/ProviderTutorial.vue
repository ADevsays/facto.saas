<script setup lang="ts">
const props = defineProps<{
  provider: 'stripe' | 'mercadopago' | 'none' | null
}>()

const tutorials = {
  stripe: {
    title: 'Stripe (Recomendado: Solo Lectura)',
    steps: [
      'Ve a Developers > API Keys',
      'Crea una "Restricted Key"',
      'Permiso: "Subscriptions: Read"'
    ],
    link: 'https://dashboard.stripe.com/apikeys'
  },
  mercadopago: {
    title: 'Mercado Pago (Conexión Segura)',
    steps: [
      'Haz clic en "Conectar Mercado Pago"',
      'Inicia sesión y autoriza a Facto',
      'Verifica permisos de "Solo Lectura"',
      'El MRR se detectará automáticamente'
    ],
    link: null
  },
  none: {
    title: 'Verificación Posterior',
    steps: [
      'Puedes publicar ahora sin MRR',
      'Usa tu email privado para validar después',
      'Las startups verificadas tienen prioridad'
    ],
    link: null
  }
}

const current = computed(() => props.provider ? tutorials[props.provider] : null)
</script>

<template>
  <Transition name="fade-slide" mode="out-in">
    <div 
      v-if="current" 
      :key="provider || 'none'"
      class="mt-1 p-4 rounded-xl bg-[#00D4FF]/5 border border-[#00D4FF]/10 flex flex-col gap-3"
    >
      <div class="flex items-center justify-between">
        <h4 class="text-[10px] font-sans font-bold uppercase tracking-wider text-[#00D4FF]">
          {{ current.title }}
        </h4>
        <a 
          v-if="current.link" 
          :href="current.link" 
          target="_blank" 
          class="text-[10px] font-sans font-bold uppercase text-white/40 hover:text-[#00D4FF] transition-colors flex items-center gap-1"
        >
          Ir al Dashboard
          <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3" />
          </svg>
        </a>
      </div>
      
      <ul class="flex flex-col gap-1.5">
        <li v-for="(step, i) in current.steps" :key="i" class="flex items-start gap-2.5">
          <span class="text-[10px] font-sans font-bold text-[#00D4FF] mt-0.5 opacity-60">{{ i + 1 }}.</span>
          <p class="text-sm font-sans font-light text-neutral-300 leading-tight">
            {{ step }}
          </p>
        </li>
      </ul>
    </div>
  </Transition>
</template>

<style scoped>
.fade-slide-enter-active, .fade-slide-leave-active {
  transition: all 0.3s ease;
}
.fade-slide-enter-from, .fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
