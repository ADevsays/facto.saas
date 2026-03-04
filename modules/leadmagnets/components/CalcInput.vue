<script setup lang="ts">
defineProps<{
    label: string;
    modelValue: number;
    min?: number;
    max?: number;
    step?: number;
    prefix?: string;
    suffix?: string;
    hint?: string;
}>();

defineEmits<{
    'update:modelValue': [value: number];
}>();
</script>

<template>
    <div class="flex flex-col gap-2">
        <label class="font-sans text-[11px] font-medium tracking-[0.15em] uppercase text-white/45">
            {{ label }}
        </label>
        <div class="relative flex items-center">
            <span
                v-if="prefix"
                class="absolute left-3.5 font-sans text-sm text-white/30 pointer-events-none select-none z-10"
            >
                {{ prefix }}
            </span>
            <input
                type="number"
                :value="modelValue"
                :min="min"
                :max="max"
                :step="step ?? 1"
                class="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl py-3 px-4 text-white font-sans text-[15px] font-light transition-all duration-300 appearance-none focus:outline-none focus:border-[#00D4FF]/40 focus:bg-[#00D4FF]/[0.03] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                :class="{ 'pl-9': prefix, 'pr-9': suffix }"
                @input="(e) => {
                    const raw = Number((e.target as HTMLInputElement).value);
                    const clamped = Math.min(max ?? Infinity, Math.max(min ?? -Infinity, raw));
                    $emit('update:modelValue', clamped);
                }"
            />
            <span
                v-if="suffix"
                class="absolute right-3.5 font-sans text-sm text-white/30 pointer-events-none select-none"
            >
                {{ suffix }}
            </span>
        </div>
        <p v-if="hint" class="font-sans text-[11px] text-white/25 m-0">{{ hint }}</p>
    </div>
</template>
