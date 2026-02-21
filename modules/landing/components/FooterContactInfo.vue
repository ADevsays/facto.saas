<script setup lang="ts">
defineProps<{
    email: string;
    socials: { name: string; href: string; handle: string }[];
}>();
</script>

<template>
    <div class="flex flex-col gap-8">
        <div>
            <p class="text-[10px] uppercase tracking-[0.3em] text-[#00D4FF] font-bold mb-4">Escríbenos</p>
            <a :href="`mailto:${email}`" class="text-white text-xl md:text-2xl font-serif hover:text-[#00D4FF] transition-colors">
                {{ email }}
            </a>
        </div>
        <div>
            <p class="text-[10px] uppercase tracking-[0.3em] text-[#00D4FF] font-bold mb-4">Síguenos</p>
            <div class="flex flex-col gap-2">
                <a v-for="social in socials" :key="social.name" :href="social.href" class="text-gray-400 hover:text-white transition-colors text-sm font-sans flex items-center gap-2">
                    <span class="text-white font-medium">{{ social.name }}</span> — {{ social.handle }}
                </a>
            </div>
        </div>
    </div>
</template>
