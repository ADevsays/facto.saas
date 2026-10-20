<script setup lang="ts">
const { locale } = useI18n()

defineI18nRoute({
  paths: {
    es: '/metodologia',
    en: '/methodology'
  }
})

const copy = computed(() => locale.value === 'en'
  ? {
      eyebrow: 'Facto', title: 'Data methodology',
      intro: 'How Facto publishes, calculates and updates public SaaS metrics.',
      sections: [
        { title: 'What we measure', text: 'MRR is monthly recurring revenue. ARR is an annualized MRR estimate (MRR × 12); it is not money collected. Revenue represents the total actually collected when verifiable history is available.' },
        { title: 'Sources and updates', text: 'Startups can provide public data and connect a payment provider. When a provider is connected, Facto synchronizes the financial summary; history refreshes after the cache exceeds 48 hours. Each profile shows the available source and update date.' },
        { title: 'Limits and verification', text: 'An expired credential or a source with no data is not interpreted as growth, revenue or MRR. We retain the last valid data when available and flag that it may be stale. These metrics do not replace diligence on a company.' },
        { title: 'Directory and ranking', text: 'Only published startups are included in indexable routes and the ranking. Ordering uses available metrics and incognito profiles respect their configured visibility.' }
      ]
    }
  : {
      eyebrow: 'Facto', title: 'Metodología de datos',
      intro: 'Explicamos qué significan las métricas del directorio, de dónde vienen y cuándo pueden quedar desactualizadas.',
      sections: [
        { title: 'Qué medimos', text: 'MRR es el ingreso recurrente mensual. ARR es una estimación anualizada de MRR (MRR × 12); no equivale a ingresos cobrados. Ingresos representa el total realmente cobrado cuando existe historial verificable.' },
        { title: 'Fuentes y actualización', text: 'Las startups pueden aportar sus datos públicos y conectar un proveedor de pagos. Cuando hay un proveedor conectado, Facto sincroniza el resumen financiero; el historial se refresca cuando la caché supera 48 horas. La ficha muestra la fuente y la fecha de actualización disponibles.' },
        { title: 'Límites y verificación', text: 'Una credencial expirada o una fuente sin datos no se interpreta como crecimiento, ingresos o MRR. Conservamos el último dato válido cuando existe y señalamos que puede estar desactualizado. Las métricas no sustituyen la debida diligencia sobre una empresa.' },
        { title: 'Directorio y ranking', text: 'Solo las startups publicadas se incluyen en las rutas indexables y en el ranking. El orden usa las métricas disponibles y los perfiles en modo incógnito respetan su visibilidad configurada.' }
      ]
    })

useAppSeo({
  title: () => locale.value === 'en' ? 'Facto methodology | Facto' : 'Metodología de datos de Facto | Facto',
  description: () => locale.value === 'en'
    ? 'How Facto publishes, calculates and updates public SaaS metrics.'
    : 'Cómo Facto publica, calcula y actualiza las métricas públicas de SaaS.'
})

useSchemaOrg([{
  '@type': 'WebPage',
  name: 'Facto data methodology',
  url: 'https://www.factosaas.com/metodologia',
  dateModified: '2026-10-20'
}])
</script>

<template>
  <main class="min-h-screen bg-[#030305] px-6 py-20 text-neutral-200">
    <article class="mx-auto max-w-3xl">
      <p class="text-xs font-medium uppercase tracking-[0.24em] text-cyan-400">{{ copy.eyebrow }}</p>
      <h1 class="mt-4 font-serif text-4xl tracking-tight text-white md:text-5xl">{{ copy.title }}</h1>
      <p class="mt-6 max-w-2xl text-base leading-7 text-neutral-400">{{ copy.intro }}</p>

      <div class="mt-12 space-y-10 text-sm leading-7 text-neutral-300">
        <section v-for="section in copy.sections" :key="section.title">
          <h2 class="text-xl text-white">{{ section.title }}</h2>
          <p class="mt-3">{{ section.text }}</p>
        </section>
      </div>
    </article>
  </main>
</template>
