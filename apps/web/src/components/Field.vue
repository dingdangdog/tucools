<template>
  <label class="flex flex-col gap-1 text-sm">
    <span class="text-muted">{{ label }}</span>
    <slot />
  </label>
</template>

<script setup lang="ts">
defineProps<{ label: string }>();
</script>
