<script setup lang="ts">
import { computed } from 'vue';
import es from '../locales/es.json';
import en from '../locales/en.json';
import { useLanguage } from '@/composables/useLanguage';
import FaqSection from '~/ui/sections/FaqSection.vue';
import SeoArticleSection from '../components/SeoArticleSection.vue';

const { t } = useLanguage({ es, en });

const content = computed(() => t.value?.seoContent);
</script>

<template>
  <section v-if="content" class="w-full max-w-[800px] mx-auto px-6 py-16 pb-32">
    <article class="space-y-16">
      <SeoArticleSection 
        :title="content.sections.howToCalculate.title" 
        :content="content.sections.howToCalculate.content" 
        highlightWord="calculamos"
      />
      <SeoArticleSection 
        :title="content.sections.howMuchToSell.title" 
        :content="content.sections.howMuchToSell.content" 
        highlightWord="puedo"
      />
      <SeoArticleSection 
        :title="content.sections.whatBuyersWant.title" 
        :content="content.sections.whatBuyersWant.content" 
        highlightWord="compradores"
      />
    </article>
  </section>
  <FaqSection v-if="content" :title="content.faq.title" :faqs="content.faq.items" />
</template>
