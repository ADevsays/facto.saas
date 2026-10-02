<script setup lang="ts">
defineProps<{
  label: string
  modelValue: string | number
  type?: string
  placeholder?: string
  readonly?: boolean
  required?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', val: string | number): void
}>()

const handleInput = (e: Event) => {
  const target = e.target as HTMLInputElement
  emit('update:modelValue', target.value)
}
</script>

<template>
  <div class="flex flex-col gap-2 font-sans">
    <label class="font-sans text-[11px] font-medium tracking-[0.15em] uppercase text-white/45">
      {{ label }} <span v-if="required" class="text-[#00D4FF]">*</span>
    </label>
    <input
      :type="type || 'text'"
      :value="modelValue"
      :placeholder="placeholder"
      :readonly="readonly"
      @input="handleInput"
      :class="[
        'w-full border rounded-xl py-3 px-4 text-white font-sans text-[14px] font-light transition-all duration-300 focus:outline-none',
        readonly
          ? 'bg-white/[0.02] border-white/[0.05] text-white/40 font-mono cursor-not-allowed'
          : 'bg-white/[0.04] border-white/[0.08] placeholder-white/20 focus:border-[#00D4FF]/40 focus:bg-[#00D4FF]/[0.03]'
      ]"
    />
  </div>
</template>
