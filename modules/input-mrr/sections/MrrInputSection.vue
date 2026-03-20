<script setup lang="ts">
import MrrInput from '../components/MrrInput.vue'
</script>

<template>
  <section class="w-full py-12 flex flex-col items-center gap-6">
    <div class="text-center">
      <p class="font-sans font-extralight tracking-[0.15em] text-[10px] text-neutral-500 uppercase mb-4">Sube tu empresa</p>
      <h2 class="font-serif text-3xl md:text-4xl text-white leading-tight tracking-tight">
        Conecta tu MRR
      </h2>
      <p class="text-neutral-500 font-sans font-extralight tracking-[0.08em] text-sm mt-3 ">
        Aparece en el ranking global y valida tu SaaS ante el mundo
      </p>
    </div>
    <MrrInput />
  </section>
</template>
