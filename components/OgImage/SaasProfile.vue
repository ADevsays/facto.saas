<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  name?: string
  logoUrl?: string
  mrr?: number | string | null
  category?: string
  categorySlug?: string
}>()

const gemColor = computed(() => {
  const map: Record<string, string> = {
    'marketing': '#FF3366',
    'finanzas': '#00D4FF',
    'productividad': '#A855F7',
    'ecommerce': '#F59E0B',
  }
  return (props.categorySlug && map[props.categorySlug]) || '#00D4FF'
})

const formattedMrr = computed(() => {
  if (props.mrr === null || props.mrr === undefined || isNaN(Number(props.mrr))) return '—'
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(Number(props.mrr))
})
</script>

<template>
  <div style="width: 1200px; height: 630px; display: flex; flex-direction: column; align-items: center; justify-content: center; background-color: #030305; padding: 40px; position: relative;">
    
    <!-- Main Content Box -->
    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%;">
      
      <!-- Logo -->
      <div v-if="logoUrl" style="display: flex; align-items: center; justify-content: center; width: 160px; height: 160px; border-radius: 40px; overflow: hidden; border: 2px solid rgba(255,255,255,0.1); background-color: rgba(255,255,255,0.05);">
        <img :src="logoUrl" style="width: 160px; height: 160px; object-fit: cover;" />
      </div>
      <div v-else style="display: flex; align-items: center; justify-content: center; width: 160px; height: 160px; border-radius: 40px; border: 2px solid rgba(255,255,255,0.1); background-color: rgba(255,255,255,0.05);">
        <span style="font-size: 80px; color: white;">{{ name ? name.charAt(0).toUpperCase() : 'S' }}</span>
      </div>

      <!-- Title -->
      <h1 style="color: white; font-weight: bold; font-size: 100px; margin-top: 50px; margin-bottom: 40px; text-align: center; line-height: 1.1; letter-spacing: -2px;">
        {{ name || 'SaaS' }}
      </h1>

      <!-- Facto Branding Domain -->
      <div style="display: flex; align-items: center; justify-content: center;">
        <div style="display: flex; align-items: center; justify-content: center; width: 48px; height: 48px; border-radius: 14px; background-color: white; margin-right: 16px;">
          <span style="color: black; font-weight: bold; font-size: 32px;">f</span>
        </div>
        <span style="color: rgba(255,255,255,0.6); letter-spacing: 4px; text-transform: uppercase; font-size: 28px; font-weight: bold;">factosaas.com</span>
      </div>

    </div>

  </div>
</template>
