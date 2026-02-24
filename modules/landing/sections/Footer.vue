<script setup lang="ts">
import FooterCTA from '../components/FooterCTA.vue';
import FooterContactInfo from '../components/FooterContactInfo.vue';
import FooterNavigation from '../components/FooterNavigation.vue';
import { SOCIAL_LINKS } from '../const/navigation';
import { useLanguage } from '../composables/useLanguage';
import { computed } from 'vue';

const { t } = useLanguage();
const socialLinks = SOCIAL_LINKS;

const navLinks = computed(() => [
    { name: t.value.navbar.solution, href: '#solution' },
    { name: t.value.navbar.process, href: '#process' },
    { name: t.value.navbar.faq, href: '#faq' },
]);
</script>

<template>
    <footer id="contact" class="bg-[#030305] pt-32 pb-12 px-6 overflow-hidden">
        <div class="max-w-7xl mx-auto">
            <!-- 1. Huge Final CTA -->
            <FooterCTA href="#contact" />

            <!-- Intermediary Line -->
            <div class="w-full h-[1px] bg-white/10 mb-16"></div>

            <!-- Bottom Section: Contact & Navigation -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 items-start">
                
                <!-- 2. Contact Section -->
                <FooterContactInfo 
                    email="adevsaysinfo@gmail.com" 
                    :socials="socialLinks" 
                />

                <!-- 3. Navigation Section -->
                <FooterNavigation :links="navLinks" />

            </div>

            <!-- Copyright Line -->
            <div class="mt-32 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
                <p class="text-gray-600 text-[10px] uppercase tracking-widest">
                    © 2026 Adevsays
                </p>
                <div class="flex gap-8">
                    <NuxtLink to="/privacidad" class="text-gray-600 hover:text-white text-[10px] uppercase tracking-widest transition-colors">{{ t.footer.privacy }}</NuxtLink>
                    <NuxtLink to="/terminos" class="text-gray-600 hover:text-white text-[10px] uppercase tracking-widest transition-colors">{{ t.footer.terms }}</NuxtLink>
                </div>
            </div>
        </div>
    </footer>
</template>
