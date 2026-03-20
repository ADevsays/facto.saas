<script setup lang="ts">
const url = ref('')
</script>

<template>
  <div class="flex gap-3 w-full">
    <input
      v-model="url"
      type="text"
      placeholder="tu-saas.com"
      class="flex-1 bg-white/5 border border-white/10 rounded-xl px-5 py-3.5 text-white text-sm font-sans tracking-wide placeholder:text-neutral-600 focus:outline-none focus:border-[#00D4FF]/50 focus:bg-white/8 transition-all duration-300"
    />
    <button class="add-btn group flex items-center gap-2 bg-white text-black font-bold uppercase tracking-widest text-xs rounded-full px-5 py-3.5 transition-all duration-700 hover:scale-[1.03] shrink-0">
      <svg
        width="12"
        height="12"
        viewBox="0 0 12 12"
        class="transition-transform duration-500 group-hover:rotate-90"
      >
        <path d="M6 1v10M1 6h10" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
      </svg>
      Add
    </button>
  </div>
</template>

<style scoped>
.add-btn:hover {
  box-shadow: 0 0 15px rgba(255, 255, 255, 0.5), 0 0 30px rgba(0, 212, 255, 0.3), 0 0 45px rgba(0, 212, 255, 0.1);
}
</style>
