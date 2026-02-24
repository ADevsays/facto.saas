<script setup lang="ts">
defineProps<{
    pill: string;
    title: string;
}>();
</script>

<template>
    <div>
        <p class="text-gray-600 text-xs uppercase tracking-widest mb-4">{{ pill }}</p>
        <h2 class="font-serif text-4xl md:text-5xl text-white mb-10 leading-tight whitespace-pre-line">
            {{ title }}
        </h2>
    </div>
</template>
