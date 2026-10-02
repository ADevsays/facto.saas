<script setup lang="ts">
const props = defineProps<{
  provider: 'stripe' | 'mercadopago' | 'whop' | 'none' | null
}>()

import es from '../locales/es.json'
import en from '../locales/en.json'
const { t } = useLanguage({ es, en })

const tutorials = computed(() => ({
  stripe: {
    title: t.value.tutorial.stripeTitle,
    steps: t.value.tutorial.stripeSteps,
    linkText: t.value.tutorial.stripeLink,
    link: 'https://dashboard.stripe.com/apikeys/create?name=Facto.saas&permissions%5B%5D=rak_charge_read&permissions%5B%5D=rak_subscription_read&permissions%5B%5D=rak_plan_read&permissions%5B%5D=rak_product_read&permissions%5B%5D=rak_invoice_read&permissions%5B%5D=rak_credit_note_read'
  },
  mercadopago: {
    title: t.value.tutorial.mpTitle,
    steps: t.value.tutorial.mpSteps,
    linkText: null,
    link: null
  },
  whop: {
    title: t.value.tutorial.whopTitle,
    steps: t.value.tutorial.whopSteps,
    linkText: t.value.tutorial.whopLink,
    link: 'https://whop.com/dashboard/developer'
  },
  none: {
    title: t.value.tutorial.noneTitle,
    steps: t.value.tutorial.noneSteps,
    linkText: null,
    link: null
  }
}))

const current = computed(() => props.provider ? tutorials.value[props.provider] : null)
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
          <span class="text-[10px] font-sans font-bold text-[#00D4FF] mt-0.5 opacity-60">{{ Number(i) + 1 }}.</span>
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
