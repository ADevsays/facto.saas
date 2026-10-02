<script setup lang="ts">
defineProps<{
    question: string;
    answer: string;
    isOpen: boolean;
}>();

defineEmits<{
    (e: 'toggle'): void;
}>();
</script>

<template>
    <div class="border-b border-white/10 last:border-b-0">
        <button 
            type="button"
            @click="$emit('toggle')"
            class="w-full py-5 flex justify-between items-center text-left group transition-all duration-300"
        >
            <span 
                class="text-white/90 font-sans text-base md:text-lg tracking-tight group-hover:text-white transition-colors"
                :class="{ 'text-white font-medium': isOpen }"
            >
                {{ question }}
            </span>
            <div class="relative w-5 h-5 flex items-center justify-center shrink-0 ml-4">
                <div 
                    class="absolute w-full h-[1.5px] bg-[#00D4FF] transition-transform duration-300 ease-out" 
                    :class="{ 'rotate-90': !isOpen }"
                ></div>
                <div class="absolute w-full h-[1.5px] bg-[#00D4FF]"></div>
            </div>
        </button>
        
        <div 
            class="grid transition-[grid-template-rows] duration-300 ease-out"
            :class="isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'"
        >
            <div class="overflow-hidden">
                <p 
                    class="pb-5 text-neutral-400 font-sans leading-relaxed text-sm md:text-base w-full transition-all duration-300 ease-out"
                    :class="isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-1'"
                    v-html="answer"
                ></p>
            </div>
        </div>
    </div>
</template>
