<template>
  <div class="flex h-full min-h-0 flex-col gap-3 overflow-y-auto p-3 md:p-4">
    <header class="flex flex-wrap items-start justify-between gap-3">
      <p v-if="lead" class="max-w-3xl text-sm text-muted">{{ lead }}</p>
      <div v-if="$slots.actions" class="flex flex-wrap gap-2">
        <slot name="actions" />
      </div>
    </header>
    <div v-if="$slots.settings" class="panel flex flex-col gap-3 p-3">
      <slot name="settings" />
    </div>
    <p v-if="error" class="text-sm text-danger" role="alert">{{ error }}</p>
    <slot />
    <PageFacts />
  </div>
</template>

<script setup lang="ts">
import PageFacts from "@/components/PageFacts.vue";

defineProps<{ lead?: string; error?: string }>();
</script>
