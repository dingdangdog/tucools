<template>
  <p class="pointer-events-none absolute bottom-3 left-3 z-10 max-w-[min(100%-1.5rem,18rem)] rounded-md bg-black/55 px-2.5 py-1.5 text-xs text-white">
    <span class="block truncate">{{ name }}</span>
    <span v-if="detail" class="mt-0.5 block truncate text-white/80">{{ detail }}</span>
  </p>
</template>

<script setup lang="ts">
defineProps<{ name: string; detail?: string }>();
</script>
