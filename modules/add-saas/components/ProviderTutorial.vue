<script setup lang="ts">
const props = defineProps<{
  provider: 'stripe' | 'mercadopago' | 'whop' | 'none' | null
}>()

const tutorials = {
  stripe: {
    title: 'Stripe (Solo Lectura)',
    steps: [
      'Dale click a "Ir al dashboard" para crear una API key de sólo lectura.',
      'Cópiala sin cambiar los permisos.',
      'Pégala aquí y no la borres.'
    ],
    linkText: 'Ir al Dashboard',
    link: 'https://dashboard.stripe.com/apikeys/create?name=Facto.saas&permissions%5B%5D=rak_charge_read&permissions%5B%5D=rak_subscription_read&permissions%5B%5D=rak_plan_read&permissions%5B%5D=rak_product_read'
  },
  mercadopago: {
    title: 'Mercado Pago (Conexión Segura)',
    steps: [
      'Haz clic en "Conectar Mercado Pago"',
      'Inicia sesión y autoriza a Facto',
      'Verifica permisos de "Solo Lectura"',
      'El MRR se detectará automáticamente'
    ],
    linkText: null,
    link: null
  },
  whop: {
    title: 'Whop (Conexión Segura)',
    steps: [
      'Crea una nueva Company API key.',
      'Hereda los permisos de Admin para seguridad.',
      'Copia tu company ID (empieza con biz_ en la URL)',
      'Pega ambos valores aquí.'
    ],
    linkText: 'Abrir Dashboard de Developer',
    link: 'https://whop.com/dashboard/developer'
  },
  none: {
    title: 'Verificación Posterior',
    steps: [
      'Puedes publicar ahora sin MRR',
      'Usa tu email privado para validar después',
      'Las startups verificadas tienen prioridad'
    ],
    linkText: null,
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
          {{ current.linkText }}
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
