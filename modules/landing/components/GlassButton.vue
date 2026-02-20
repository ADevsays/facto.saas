<script setup lang="ts">
defineProps<{
    href?: string;
    text?: string;
}>();
</script>

<template>
    <div class="my-6 pointer-events-auto ">            
        <a 
            :href="href || '#'"
            class="group relative inline-flex items-center justify-center px-10 py-4 text-white font-medium uppercase tracking-widest text-sm rounded-full transition-all duration-700 hover:scale-[1.03]"
            style="
                background: rgba(255, 255, 255, 0.03);
                backdrop-filter: blur(20px);
                border: 1px solid rgba(34, 211, 238, 0.2);
                box-shadow: 
                    inset 0 0 20px rgba(34, 211, 238, 0.05),
                    0 10px 30px rgba(0, 0, 0, 0.2);
            "
        >
            <span class="relative z-10 flex items-center gap-2 drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]">
                <slot>{{ text || 'Comenzar proyecto' }}</slot>
                <svg class="w-4 h-4 transition-transform duration-500 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
            </span>
            
            <!-- Fluid Cyan Highlight -->
            <div class="absolute inset-0 rounded-full bg-gradient-to-tr from-[#22d3ee]/0 via-[#22d3ee]/5 to-[#22d3ee]/10 opacity-50 group-hover:opacity-100 transition-opacity duration-700"></div>
            
            <!-- Glass Reflection Top -->
            <div class="absolute inset-0 rounded-full border-t border-white/10 z-0"></div>
        </a>
    </div>

</template>

<style scoped>
/* Refined glass hover effect */
.group:hover {
    border-color: rgba(34, 211, 238, 0.4) !important;
    background-color: rgba(255, 255, 255, 0.06) !important;
    box-shadow: 
        inset 0 0 25px rgba(34, 211, 238, 0.1),
        0 15px 40px rgba(0, 0, 0, 0.3) !important;
}
</style>
