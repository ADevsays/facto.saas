<script setup lang="ts">
defineProps<{
    title: string;
    description: string;
    icon: any; 
}>();
</script>

<template>
    <div class="group p-8 rounded-3xl border border-white/5 bg-[#0A0A0C] hover:bg-[#0F0F12] transition-all duration-500 hover:border-white/10 relative overflow-hidden shadow-[inset_0_0_20px_rgba(255,255,255,0.02)]">
        <!-- Icon Container - White icons as requested -->
        <div class="rounded-full p-2 w-12 h-12 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-500">
            <component :is="icon" class="w-6 h-6 text-white opacity-90 group-hover:opacity-100 transition-opacity" stroke-width="1.5" />
        </div>
        
        <h3 class="text-xl font-serif text-white mb-3 tracking-tight">
            {{ title }}
        </h3>
        
        <p class="text-gray-400 font-sans leading-relaxed text-md opacity-80 group-hover:opacity-100 transition-opacity">
            {{ description }}
        </p>
    </div>
</template>

<style scoped>
/* Extra refinement for the subtle inset shadow */
div {
    box-shadow: inset 0 0 25px 0px rgba(255, 255, 255, 0.02);
}
</style>
