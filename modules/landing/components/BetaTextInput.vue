<script setup lang="ts">
defineProps<{
    modelValue: string;
    type?: string;
    placeholder?: string;
    autofocus?: boolean;
}>();

const emit = defineEmits<{
    'update:modelValue': [value: string];
    enter: [];
}>();
</script>

<template>
    <input
        :value="modelValue"
        :type="type || 'text'"
        :placeholder="placeholder"
        :autofocus="autofocus"
        class="w-full bg-transparent border-b py-4 text-white text-xl outline-none placeholder-white/15 transition-colors focus:border-cyan-500"
        style="border-color: rgba(255,255,255,0.12); caret-color: #00D4FF;"
        @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
        @keydown.enter="emit('enter')"
    />
</template>
