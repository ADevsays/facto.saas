<script setup lang="ts">
</script>

<template>
    <div class="flex flex-col gap-6">

        <!-- CTA -->
        <div class="flex flex-col gap-3 p-7 bg-gradient-to-br from-white/[0.04] to-white/[0.02] border border-white/[0.08] rounded-2xl">
            <p class="font-serif text-xl font-semibold text-white m-0 leading-snug">
                ¿Quieres presumir estas métricas?
            </p>
            <p class="font-sans text-sm font-light text-white/40 m-0 leading-relaxed">
                Facto te ayudará a certificar los ingresos de tu SaaS para que inversores y compradores vean exactamente lo que tienes.
            </p>
            <NuxtLink
                to="/"
                class="group inline-flex items-center gap-2 self-start mt-2 px-6 py-3.5 bg-white text-[#030305] rounded-full font-sans text-[12px] font-bold tracking-[0.12em] uppercase no-underline transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_0_20px_rgba(255,255,255,0.3),0_0_40px_rgba(0,212,255,0.15)]"
            >
                Ver cómo funciona Facto
                <svg class="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
            </NuxtLink>
        </div>

    </div>
</template>
