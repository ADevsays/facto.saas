<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    socials?: {
      twitterUrl?: string
      linkedinUrl?: string
      instagramUrl?: string
    } | null
    itemClass?: string
  }>(),
  {
    socials: null,
    itemClass: 'p-2 bg-white/[0.04] border border-white/10 hover:border-white/30 text-neutral-400 hover:text-white rounded-xl transition-all'
  }
)

function formatSocialUrl(url?: string, platform?: 'twitter' | 'linkedin' | 'instagram'): string {
  if (!url) return ''
  const trimmed = url.trim()
  if (/^https?:\/\//i.test(trimmed)) return trimmed
  if (platform === 'twitter' && !trimmed.includes('/')) return `https://x.com/${trimmed.replace(/^@/, '')}`
  if (platform === 'instagram' && !trimmed.includes('/')) return `https://instagram.com/${trimmed.replace(/^@/, '')}`
  if (platform === 'linkedin' && !trimmed.includes('/')) return `https://linkedin.com/in/${trimmed}`
  return `https://${trimmed}`
}

const hasSocials = computed(() => {
  return !!(props.socials?.twitterUrl || props.socials?.linkedinUrl || props.socials?.instagramUrl)
})
</script>

<template>
  <div v-if="hasSocials" class="flex items-center justify-center gap-2">
    <a
      v-if="socials?.twitterUrl"
      :href="formatSocialUrl(socials.twitterUrl, 'twitter')"
      target="_blank"
      rel="noopener noreferrer"
      :class="itemClass"
      aria-label="Twitter / X"
      title="Twitter / X"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
      </svg>
    </a>

    <a
      v-if="socials?.linkedinUrl"
      :href="formatSocialUrl(socials.linkedinUrl, 'linkedin')"
      target="_blank"
      rel="noopener noreferrer"
      :class="itemClass"
      aria-label="LinkedIn"
      title="LinkedIn"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
      </svg>
    </a>

    <a
      v-if="socials?.instagramUrl"
      :href="formatSocialUrl(socials.instagramUrl, 'instagram')"
      target="_blank"
      rel="noopener noreferrer"
      :class="itemClass"
      aria-label="Instagram"
      title="Instagram"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
      </svg>
    </a>
  </div>
</template>
