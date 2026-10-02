<script setup lang="ts">
import { ref, computed, useId } from 'vue'

const props = withDefaults(defineProps<{
  data: { label: string; value: number }[]
  color?: string
  height?: number
  formatValue?: (val: number) => string
}>(), {
  color: '#00D4FF',
  height: 300
})

const uid = useId()
const hoveredIndex = ref<number | null>(null)
const svgRef = ref<SVGElement | null>(null)

const viewW = 800
const viewH = computed(() => props.height)

const defaultFormat = (val: number) => {
  if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(1)}M`
  if (val >= 1_000) return `${(val / 1_000).toFixed(1)}K`
  return val.toLocaleString('en-US')
}
const fmt = computed(() => props.formatValue ?? defaultFormat)

const maxVal = computed(() => {
  if (!props.data.length) return 10
  const max = Math.max(...props.data.map(d => d.value))
  return max === 0 ? 10 : max * 1.12
})

const minVal = computed(() => {
  if (!props.data.length) return 0
  const min = Math.min(...props.data.map(d => d.value))
  const max = Math.max(...props.data.map(d => d.value))
  // If data has high offset with subtle growth, scale min to highlight variance
  if (min > 10 && (max - min) < (max * 0.5) && props.data.length > 4) {
    return Math.max(0, Math.floor(min * 0.85))
  }
  return 0
})

const range = computed(() => maxVal.value - minVal.value || 1)

const paddingX = 40
const paddingR = 30
const paddingTop = 25
const paddingBot = 35

const points = computed(() => {
  const usableW = viewW - paddingX - paddingR
  const usableH = viewH.value - paddingTop - paddingBot
  const len = props.data.length

  return props.data.map((d, i) => {
    const x = paddingX + (i / (len - 1 || 1)) * usableW
    const ratio = (d.value - minVal.value) / range.value
    const y = viewH.value - paddingBot - ratio * usableH
    return { x, y, label: d.label, value: d.value }
  })
})

const pathD = computed(() => {
  const pts = points.value
  if (!pts.length) return ''
  return pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ')
})

const areaD = computed(() => {
  const pts = points.value
  if (!pts.length) return ''
  const bottom = viewH.value - paddingBot
  return `${pathD.value} L ${pts[pts.length - 1].x.toFixed(1)} ${bottom} L ${pts[0].x.toFixed(1)} ${bottom} Z`
})

// Thin out X-axis labels to avoid overlap (max 5-7 labels evenly distributed)
const visibleLabelIndices = computed(() => {
  const len = points.value.length
  if (len <= 7) {
    return new Set(points.value.map((_, i) => i))
  }
  const step = Math.ceil(len / 6)
  const indices = new Set<number>()
  for (let i = 0; i < len; i += step) {
    indices.add(i)
  }
  indices.add(len - 1)
  return indices
})

const handleMouseMove = (event: MouseEvent) => {
  if (!svgRef.value) return
  const rect = svgRef.value.getBoundingClientRect()
  const mouseX = ((event.clientX - rect.left) / rect.width) * viewW
  
  let closest = 0
  let minDist = Infinity
  points.value.forEach((p, i) => {
    const dist = Math.abs(p.x - mouseX)
    if (dist < minDist) { minDist = dist; closest = i }
  })
  hoveredIndex.value = closest
}
</script>

<template>
  <div class="relative w-full select-none" :style="{ height: `${height}px` }">
    <svg 
      ref="svgRef"
      class="w-full h-full cursor-crosshair overflow-visible"
      :viewBox="`0 0 ${viewW} ${viewH}`"
      preserveAspectRatio="none"
      @mousemove="handleMouseMove"
      @mouseleave="hoveredIndex = null"
    >
      <defs>
        <linearGradient :id="`area-${uid}`" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" :stop-color="color" stop-opacity="0.22" />
          <stop offset="100%" :stop-color="color" stop-opacity="0.0" />
        </linearGradient>
        <filter :id="`glow-${uid}`" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="4" :flood-color="color" flood-opacity="0.4" />
        </filter>
      </defs>

      <!-- Grid Lines -->
      <line 
        v-for="i in 4" 
        :key="i"
        :x1="paddingX" 
        :y1="paddingTop + (i - 1) * ((viewH - paddingTop - paddingBot) / 3)" 
        :x2="viewW - paddingR" 
        :y2="paddingTop + (i - 1) * ((viewH - paddingTop - paddingBot) / 3)" 
        stroke="white" 
        stroke-width="1"
        stroke-dasharray="3,4"
        class="opacity-10"
      />

      <!-- Area Fill -->
      <path :d="areaD" :fill="`url(#area-${uid})`" class="transition-all duration-300" />

      <!-- Line Path -->
      <path 
        :d="pathD" 
        fill="none" 
        :stroke="color" 
        stroke-width="2.5" 
        :filter="`url(#glow-${uid})`"
        class="transition-all duration-300"
      />

      <!-- Dots (Rendered only on hover or when points are few) -->
      <template v-if="points.length <= 16">
        <circle 
          v-for="(p, idx) in points" 
          :key="`dot-${idx}`"
          :cx="p.x" 
          :cy="p.y" 
          :r="hoveredIndex === idx ? 5 : 3" 
          :fill="hoveredIndex === idx ? color : '#030305'" 
          :stroke="color" 
          stroke-width="2" 
          class="transition-all duration-200"
        />
      </template>

      <!-- Single Highlight Dot on Hover -->
      <circle 
        v-else-if="hoveredIndex !== null && points[hoveredIndex]"
        :cx="points[hoveredIndex].x" 
        :cy="points[hoveredIndex].y" 
        :r="5" 
        :fill="color" 
        :stroke="'#FFFFFF'" 
        stroke-width="2" 
        class="transition-all duration-150"
      />

      <!-- X Axis Labels (Thinned out to prevent collision) -->
      <template v-for="(p, idx) in points" :key="`lbl-${idx}`">
        <text 
          v-if="visibleLabelIndices.has(idx)"
          :x="p.x" 
          :y="viewH - 8" 
          text-anchor="middle"
          class="text-[10px] font-sans font-extralight tracking-wider fill-neutral-500"
        >
          {{ p.label }}
        </text>
      </template>

      <!-- Hover Vertical Line -->
      <line 
        v-if="hoveredIndex !== null && points[hoveredIndex]"
        :x1="points[hoveredIndex].x" 
        :y1="paddingTop" 
        :x2="points[hoveredIndex].x" 
        :y2="viewH - paddingBot" 
        :stroke="color" 
        stroke-width="1" 
        stroke-dasharray="2,2" 
        class="opacity-60"
      />
    </svg>

    <!-- Tooltip -->
    <Transition name="fade">
      <div 
        v-if="hoveredIndex !== null && points[hoveredIndex]"
        class="absolute pointer-events-none bg-[#030305]/95 border border-white/15 rounded-xl px-3 py-2 text-xs backdrop-blur-md shadow-2xl z-20"
        :style="{
          left: `${(points[hoveredIndex].x / viewW) * 100}%`,
          top: `${(points[hoveredIndex].y / viewH) * 100 - 10}%`,
          transform: 'translate(-50%, -100%)'
        }"
      >
        <p class="text-[9px] font-sans font-extralight uppercase tracking-wider text-neutral-400">{{ points[hoveredIndex].label }}</p>
        <p class="font-mono font-medium text-white text-sm mt-0.5" :style="{ color }">{{ fmt(points[hoveredIndex].value) }}</p>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.15s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
