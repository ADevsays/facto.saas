<script setup lang="ts">
import { computed } from 'vue'
import { getTechItem } from '~/utils/techStack'
import { getTechSvgPath } from '~/utils/techIcons'

const props = defineProps<{
  tech: string
  showName?: boolean
  size?: 'sm' | 'md' | 'lg'
  removable?: boolean
}>()

defineEmits<{
  remove: []
}>()

const techItem = computed(() => getTechItem(props.tech))
const svgPath = computed(() => getTechSvgPath(techItem.value.id))
</script>

<template>
  <div 
    class="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-white/10 bg-white/[0.04] text-neutral-200 transition-all duration-300 hover:border-white/25 hover:bg-white/[0.08] hover:scale-[1.02] group select-none"
    :title="techItem.name"
  >
    <div class="w-5 h-5 flex items-center justify-center shrink-0">
      <svg 
        viewBox="0 0 24 24" 
        class="w-4 h-4 fill-current text-neutral-300 group-hover:text-white transition-colors"
        aria-hidden="true"
      >
        <path :d="svgPath" />
      </svg>
    </div>

    <span 
      v-if="showName !== false" 
      class="text-xs font-sans font-normal tracking-wide text-neutral-300 group-hover:text-white transition-colors"
    >
      {{ techItem.name }}
    </span>

    <button 
      v-if="removable"
      type="button" 
      class="ml-0.5 text-neutral-400 hover:text-white p-0.5 rounded-md hover:bg-white/10 transition-colors"
      title="Eliminar"
      @click.stop="$emit('remove')"
    >
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
      </svg>
    </button>
  </div>
</template>
