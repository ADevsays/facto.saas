<script setup lang="ts">
defineProps<{
    title: string;
    description: string;
    icon: any; 
}>();
</script>

<template>
    <div class="group p-8 rounded-3xl border border-white/5 bg-[#0A0A0C] hover:bg-[#0F0F12] transition-all duration-500 hover:border-white/10">
        <div class="w-12 h-12 rounded-2xl bg-[#FF4D00]/10 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500">
            <component :is="icon" class="w-6 h-6 text-[#FF4D00]" stroke-width="1.5" />
        </div>
        <h3 class="text-xl font-serif text-white mb-4 tracking-tight">
            {{ title }}
        </h3>
        <p class="text-gray-400 font-sans leading-relaxed text-sm opacity-80 group-hover:opacity-100 transition-opacity">
            {{ description }}
        </p>
    </div>
</template>
