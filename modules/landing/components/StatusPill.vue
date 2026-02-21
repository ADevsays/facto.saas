<script setup lang="ts">
withDefaults(defineProps<{
    text: string;
    pulseColor?: string;
    pulse?: boolean;
}>(), {
    pulse: true
});
</script>

<template>
    <div class="inline-flex items-center gap-3 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-md">
        <span v-if="pulse" class="relative flex h-2 w-2">
            <span 
                class="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                :style="{ backgroundColor: pulseColor || '#FF4D00' }"
            ></span>
            <span 
                class="relative inline-flex rounded-full h-2 w-2"
                :style="{ backgroundColor: pulseColor || '#FF4D00' }"
            ></span>
        </span>
        <span class="text-[10px] md:text-xs font-sans uppercase tracking-[0.25em] text-white/70 font-medium">
            {{ text }}
        </span>
    </div>
</template>
