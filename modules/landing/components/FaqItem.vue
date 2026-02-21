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
    <div class="border-b border-white/5">
        <button 
            @click="$emit('toggle')"
            class="w-full py-6 flex justify-between items-center text-left group transition-all duration-400"
        >
            <span 
                class="text-white/90 font-sans text-lg tracking-tight group-hover:text-[#00D4FF] transition-colors"
                :class="{ 'text-[#00D4FF]': isOpen }"
            >
                {{ question }}
            </span>
            <div class="relative w-5 h-5 flex items-center justify-center">
                <div 
                    class="absolute w-full h-[1.5px] bg-[#00D4FF] transition-transform duration-300" 
                    :class="{ 'rotate-90': !isOpen }"
                ></div>
                <div class="absolute w-full h-[1.5px] bg-[#00D4FF]"></div>
            </div>
        </button>
        
        <div 
            class="overflow-hidden transition-all duration-500 ease-in-out"
            :style="{ 
                maxHeight: isOpen ? '200px' : '0px', 
                opacity: isOpen ? '1' : '0',
                pointerEvents: isOpen ? 'auto' : 'none'
            }"
        >
            <p class="pb-8 text-gray-500 font-sans leading-relaxed text-sm md:text-base max-w-2xl">
                {{ answer }}
            </p>
        </div>
    </div>
</template>
