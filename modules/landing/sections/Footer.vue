<script setup lang="ts">
import FooterCTA from '../components/FooterCTA.vue';
import FooterContactInfo from '../components/FooterContactInfo.vue';
import FooterNavigation from '../components/FooterNavigation.vue';

const navLinks = [
    { name: 'Solución', href: '#solution' },
    { name: 'Proceso', href: '#process' },
    { name: 'FAQ', href: '#faq' },
];

const socialLinks = [
    { name: 'Twitter', href: '#', handle: '@factos_agency' },
    { name: 'Instagram', href: '#', handle: '@factos.saas' },
    { name: 'LinkedIn', href: '#', handle: 'factos-studio' },
];
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
                    email="hello@factos.studio" 
                    :socials="socialLinks" 
                />

                <!-- 3. Navigation Section -->
                <FooterNavigation :links="navLinks" />

            </div>

            <!-- Copyright Line -->
            <div class="mt-32 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
                <p class="text-gray-600 text-[10px] uppercase tracking-widest">
                    © 2024 FACTOS STUDIO. ALL RIGHTS RESERVED.
                </p>
                <div class="flex gap-8">
                    <a href="#" class="text-gray-600 hover:text-white text-[10px] uppercase tracking-widest transition-colors">Privacy Policy</a>
                    <a href="#" class="text-gray-600 hover:text-white text-[10px] uppercase tracking-widest transition-colors">Terms of Service</a>
                </div>
            </div>
        </div>
    </footer>
</template>
