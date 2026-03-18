<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(defineProps<{
  title: string;
  content: string;
  highlightWord?: string;
}>(), {
  highlightWord: 'SaaS'
});

const formattedTitle = computed(() => {
  if (!props.title) return '';
  if (!props.highlightWord) return props.title;
  
  // Replace the highlight word with a span element applying the gray-400 color
  const regex = new RegExp(`(${props.highlightWord})`, 'gi');
  return props.title.replace(regex, '<span class="text-cyan-800">$1</span>');
});

const formattedContent = computed(() => {
  if (!props.content) return '';
  return props.content.replace(/\*\*/g, '');
});
</script>

<template>
  <div class="space-y-6">
    <h2 
      class="font-serif text-[clamp(2rem,5vw,2.5rem)] font-bold tracking-[-0.04em] text-white" 
      v-html="formattedTitle"
    ></h2>
    <div class="space-y-4">
      <p class="font-sans text-[15px] font-light text-white/50 leading-[1.7] tracking-[0.01em] whitespace-pre-wrap">{{ formattedContent }}</p>
    </div>
  </div>
</template>
