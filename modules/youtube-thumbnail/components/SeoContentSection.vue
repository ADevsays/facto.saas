<script setup lang="ts">
import { YOUTUBE_THUMBNAIL_ARTICLES, YOUTUBE_THUMBNAIL_FAQS } from '../const/seoContent'
import FaqSection from '~/ui/sections/FaqSection.vue'
import SeoArticleSection from '~/modules/leadmagnets/components/SeoArticleSection.vue'
</script>

<template>
  <div class="w-full max-w-[800px] mx-auto px-0 py-16 pb-12">
    <article class="space-y-16">
      <SeoArticleSection
        v-for="(article, i) in YOUTUBE_THUMBNAIL_ARTICLES"
        :key="i"
        :title="article.title"
        :content="article.content"
        :highlightWord="article.highlightWord"
      />
    </article>
  </div>

  <FaqSection
    title="Preguntas frecuentes"
    :faqs="YOUTUBE_THUMBNAIL_FAQS"
  />
</template>
