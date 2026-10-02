<script setup lang="ts">
import { INVOICE_SEO_ARTICLES as INVOICE_SEO_ARTICLES_ES, INVOICE_SEO_FAQS as INVOICE_SEO_FAQS_ES } from '../const/seoContent.es'
import { INVOICE_SEO_ARTICLES as INVOICE_SEO_ARTICLES_EN, INVOICE_SEO_FAQS as INVOICE_SEO_FAQS_EN } from '../const/seoContent.en'
import FaqSection from '~/ui/sections/FaqSection.vue'
import SeoArticleSection from '~/modules/leadmagnets/components/SeoArticleSection.vue'
import { computed } from 'vue'

const { locale } = useI18n()
const { t } = useI18n()

const seoArticles = computed(() => locale.value === 'es' ? INVOICE_SEO_ARTICLES_ES : INVOICE_SEO_ARTICLES_EN)
const seoFaqs = computed(() => locale.value === 'es' ? INVOICE_SEO_FAQS_ES : INVOICE_SEO_FAQS_EN)
</script>

<template>
  <section class="w-full max-w-[800px] mx-auto px-0 py-16 pb-24">
    <article class="space-y-16">
      <SeoArticleSection
        v-for="(article, i) in seoArticles"
        :key="i"
        :title="article.title"
        :content="article.content"
        :highlightWord="article.highlightWord"
      />
    </article>
  </section>

  <FaqSection
    :title="t('footer.faq')"
    :faqs="seoFaqs"
  />
</template>
