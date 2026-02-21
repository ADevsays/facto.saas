<script setup lang="ts">
defineProps<{
    number: string;
    duration: string;
    title: string;
    description: string;
}>();
</script>

<template>
    <div class="relative p-8 md:p-12 border-l border-white/5 group hover:bg-white/[0.02] transition-colors duration-500">
        <!-- Step Number in Circle -->
        <div class="absolute -top-4 -left-4 w-10 h-10 rounded-full bg-[#08080A] border border-white/10 flex items-center justify-center text-gray-300 font-serif text-sm z-20 group-hover:border-gray-500 transition-colors">
            {{ number }}
        </div>

        <!-- Time Pill -->
        <div class="inline-block px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-6">
            <span class="text-[9px] uppercase tracking-widest text-gray-400 font-bold">
                {{ duration }}
            </span>
        </div>

        <h3 class="text-xl font-serif text-white mb-3 tracking-tight">
            {{ title }}
        </h3>
        <p class="text-gray-400 font-sans leading-relaxed text-md opacity-80">
            {{ description }}
        </p>

    </div>
</template>
