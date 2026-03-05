```
<script setup lang="ts">
import { useSmoothScroll } from '../composables/useSmoothScroll';
import es from '../locales/es.json';
import en from '../locales/en.json';
import { useLanguage } from '@/composables/useLanguage';
import { computed } from 'vue';

defineProps<{
    links: { name: string; href: string }[];
}>();

const { scrollToSection } = useSmoothScroll();
const { t } = useLanguage({ es, en });
</script>

<template>
    <div class="lg:col-start-3">
        <p class="text-[10px] uppercase tracking-[0.3em] text-[#00D4FF] font-bold mb-6">{{ t.footer.navigation }}</p>
        <ul class="flex flex-col gap-4">
            <li v-for="link in links" :key="link.name">
                <a 
                    :href="link.href" 
                    @click="scrollToSection($event, link.href)"
                    class="text-white/60 hover:text-white text-sm font-serif transition-all hover:pl-1"
                >
                    {{ link.name }}
                </a>
            </li>
        </ul>
    </div>
</template>
