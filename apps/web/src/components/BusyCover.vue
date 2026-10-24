<template>
  <div v-if="show" class="absolute inset-0 z-20 flex items-center justify-center bg-black/60 p-6">
    <p class="max-w-sm rounded-lg bg-black/75 px-4 py-3 text-center text-sm text-white" role="status">
      {{ text || copy.processing }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { copy } from "@/content";

defineProps<{ show: boolean; text?: string }>();
</script>
