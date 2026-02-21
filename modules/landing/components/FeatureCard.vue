<script setup lang="ts">
withDefaults(defineProps<{
    title: string;
    description: string;
    icon: any;
    color?: string;
}>(), {
    color: '#FF4D00'
});
</script>

<template>
    <div class="group p-8 rounded-3xl border border-white/5 bg-[#0A0A0C] hover:bg-[#0F0F12] transition-all duration-500 hover:border-white/10">
        <div 
            class="w-12 h-12 text-3xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-500"
        >
            {{ icon }}
        </div>
        <h3 class="text-xl font-serif text-white mb-3 tracking-tight">
            {{ title }}
        </h3>
        <p class="text-gray-400 font-sans leading-relaxed text-md opacity-80 group-hover:opacity-100 transition-opacity">
            {{ description }}
        </p>
    </div>
</template>
