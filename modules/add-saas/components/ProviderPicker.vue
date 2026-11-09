<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import type { PaymentProvider } from '~/modules/add-saas/types'
import ProviderIcon from './ProviderIcon.vue'

type ProviderSlug = PaymentProvider | 'none'
type ProviderOption = {
  slug: ProviderSlug
  name: string
  available: boolean
  disabledReason?: string
}

const props = defineProps<{
  options: readonly ProviderOption[]
  placeholder: string
  searchPlaceholder: string
  noResults: string
}>()

const model = defineModel<ProviderSlug | null | undefined>()
const isOpen = ref(false)
const query = ref('')
const root = ref<HTMLElement | null>(null)
const searchInput = ref<HTMLInputElement | null>(null)

const selected = computed(() => props.options.find(option => option.slug === model.value))
const filteredOptions = computed(() => {
  const search = query.value.trim().toLocaleLowerCase()
  if (!search) return props.options
  return props.options.filter(option => `${option.name} ${option.slug}`.toLocaleLowerCase().includes(search))
})

function close() {
  isOpen.value = false
  query.value = ''
}

function toggle() {
  isOpen.value = !isOpen.value
}

function select(option: ProviderOption) {
  if (!option.available) return
  model.value = option.slug
  close()
}

function onOutsidePointer(event: PointerEvent) {
  if (root.value && !root.value.contains(event.target as Node)) close()
}

onMounted(() => document.addEventListener('pointerdown', onOutsidePointer))
onBeforeUnmount(() => document.removeEventListener('pointerdown', onOutsidePointer))

watch(isOpen, async (open) => {
  if (!open) return
  await nextTick()
  searchInput.value?.focus()
})
</script>

<template>
  <div ref="root" class="relative w-full">
    <button
      type="button"
      class="flex h-[54px] w-full items-center gap-3 rounded-xl border border-white/15 bg-[#111113] px-3 text-left transition-colors hover:border-white/25 focus:outline-none focus-visible:border-[#00D4FF]/60"
      :aria-expanded="isOpen"
      aria-haspopup="listbox"
      @click="toggle"
      @keydown.esc.stop.prevent="close"
    >
      <ProviderIcon v-if="selected" :provider="selected.slug" class="!h-8 !w-8 !rounded-lg" />
      <span class="min-w-0 flex-1 truncate text-sm font-medium text-neutral-100">
        {{ selected?.name ?? placeholder }}
      </span>
      <svg class="h-4 w-4 shrink-0 text-neutral-500 transition-transform" :class="isOpen ? 'rotate-180' : ''" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path d="m4 6 4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    </button>

    <div
      v-if="isOpen"
      class="provider-picker-menu absolute left-0 top-full z-[70] mt-1.5 w-full overflow-hidden rounded-xl border border-white/10 bg-[#111112] p-1.5 shadow-[0_18px_48px_rgba(0,0,0,0.7)]"
    >
      <label class="flex h-[54px] items-center gap-2 rounded-lg border-b border-white/[0.08] px-2.5 text-neutral-500 focus-within:text-neutral-300">
        <svg class="h-4 w-4 shrink-0" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <circle cx="8.8" cy="8.8" r="5.8" stroke="currentColor" stroke-width="1.6" />
          <path d="m13.2 13.2 4 4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
        </svg>
        <input
          ref="searchInput"
          v-model="query"
          type="search"
          autocomplete="off"
          :placeholder="searchPlaceholder"
          class="h-full min-w-0 flex-1 bg-transparent text-xs text-white outline-none placeholder:text-neutral-500"
          @keydown.esc.stop.prevent="close"
        />
      </label>

      <div role="listbox" class="provider-picker-list mt-1 max-h-[280px] overflow-y-auto pr-0.5">
        <button
          v-for="option in filteredOptions"
          :key="option.slug"
          type="button"
          role="option"
          :aria-selected="model === option.slug"
          :aria-disabled="!option.available"
          :title="option.disabledReason"
          :disabled="!option.available"
          class="flex h-[54px] w-full items-center gap-3 rounded-md px-2.5 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-45"
          :class="model === option.slug ? 'bg-white/[0.09]' : 'hover:bg-white/[0.07]'"
          @click="select(option)"
        >
          <ProviderIcon :provider="option.slug" class="!h-8 !w-8 !rounded-lg" />
          <span class="min-w-0 flex-1 truncate text-[13px] font-medium text-neutral-100">{{ option.name }}</span>
          <svg v-if="model === option.slug" class="h-4 w-4 shrink-0 text-neutral-300" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="m3.5 8.2 2.8 2.7 6.2-6" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </button>
        <p v-if="filteredOptions.length === 0" class="px-2.5 py-3 text-xs text-neutral-500">{{ noResults }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.provider-picker-list { scrollbar-width: thin; scrollbar-color: rgba(255,255,255,.4) #f4f4f5; }
.provider-picker-list::-webkit-scrollbar { width: 9px; }
.provider-picker-list::-webkit-scrollbar-track { background: #f4f4f5; border-radius: 0 0 8px 0; }
.provider-picker-list::-webkit-scrollbar-thumb { background: #8a8a8d; border: 2px solid #f4f4f5; border-radius: 999px; }
input[type='search']::-webkit-search-cancel-button { display: none; }
</style>
