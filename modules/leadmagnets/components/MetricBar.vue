<script setup lang="ts">
defineProps<{
    value: number;
    max?: number;
    color?: string;
    label?: string;
}>();
</script>

<template>
    <div class="flex items-center gap-3">
        <div class="flex-1 h-[3px] bg-white/[0.07] rounded-full overflow-hidden">
            <div
                class="h-full rounded-full transition-[width] duration-700 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]"
                :style="{
                    width: `${(value / (max ?? 100)) * 100}%`,
                    background: `linear-gradient(90deg, ${color ?? '#00D4FF'} 0%, ${color ?? '#00D4FF'}88 100%)`
                }"
            ></div>
        </div>
        <span v-if="label" class="font-sans text-[11px] text-white/30 whitespace-nowrap min-w-[40px] text-right">
            {{ label }}
        </span>
    </div>
</template>
