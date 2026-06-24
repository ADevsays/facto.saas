<script setup lang="ts">
const props = defineProps<{
  label: string
  modelValue?: string | null
  type?: string
  placeholder?: string
  required?: boolean
}>()

const emit = defineEmits(['update:modelValue'])

const updateValue = (e: Event) => {
  const target = e.target as HTMLInputElement
  emit('update:modelValue', target.value)
}
</script>

<template>
  <div class="flex flex-col gap-2">
    <label class="text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-neutral-500">
      {{ label }}{{ required ? ' *' : '' }}
    </label>
    <input
      :type="type || 'text'"
      :value="modelValue"
      @input="updateValue"
      :placeholder="placeholder"
      class="w-full bg-white/[0.06] border border-white/10 rounded-xl px-4 py-4 text-white text-sm font-sans font-light placeholder:text-neutral-600 focus:outline-none focus:border-[#00D4FF]/50 transition-all duration-300"
    />
  </div>
</template>
