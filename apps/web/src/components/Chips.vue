<template>
  <div class="flex flex-wrap gap-2" role="group" :aria-label="label">
    <button
      v-for="option in options"
      :key="String(option.value)"
      type="button"
      class="chip"
      :aria-pressed="isOn(option.value)"
      :disabled="disabled || option.disabled"
      @click="pick(option.value)"
    >
      {{ option.label }}
    </button>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  modelValue: string | number | (string | number)[];
  options: { value: string | number; label: string; disabled?: boolean }[];
  label: string;
  disabled?: boolean;
}>();
const emit = defineEmits(["update:modelValue"]);

function isOn(value: string | number) {
  return Array.isArray(props.modelValue) ? props.modelValue.includes(value) : props.modelValue === value;
}

function pick(value: string | number) {
  if (Array.isArray(props.modelValue)) {
    const next = props.modelValue.includes(value)
      ? props.modelValue.filter((item) => item !== value)
      : [...props.modelValue, value];
    emit("update:modelValue", next);
    return;
  }
  emit("update:modelValue", value);
}
</script>
