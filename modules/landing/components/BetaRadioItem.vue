<script setup lang="ts">
defineProps<{
    label: string;
    isActive: boolean;
}>();

const emit = defineEmits<{ select: [] }>();
</script>

<template>
    <label class="flex items-center gap-3 py-3 cursor-pointer group" @click="emit('select')">
        <span
            class="w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-all duration-200"
            :style="isActive
                ? 'border-color: rgba(0,212,255,0.9); background: rgba(0,212,255,0.15);'
                : 'border-color: rgba(255,255,255,0.2);'"
        >
            <span
                class="w-1.5 h-1.5 rounded-full bg-cyan-400 transition-all duration-200"
                :class="isActive ? 'opacity-100 scale-100' : 'opacity-0 scale-0'"
            />
        </span>
        <span
            class="text-sm transition-colors duration-200"
            :class="isActive ? 'text-white' : 'text-gray-500 group-hover:text-gray-300'"
        >
            {{ label }}
        </span>
    </label>
</template>
