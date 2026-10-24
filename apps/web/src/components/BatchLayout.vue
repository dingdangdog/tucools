<template>
  <div class="flex h-full min-h-0 flex-col gap-3 overflow-y-auto p-3 lg:flex-row lg:overflow-hidden lg:p-4">
    <div class="flex min-w-0 flex-1 flex-col gap-3 lg:min-h-0 lg:overflow-y-auto">
      <div v-if="lead || $slots.actions" class="flex flex-wrap items-start justify-between gap-3">
        <p v-if="lead" class="max-w-3xl text-sm text-muted">{{ lead }}</p>
        <div v-if="$slots.actions" class="flex flex-wrap gap-2">
          <slot name="actions" />
        </div>
      </div>
      <div v-if="$slots.settings" class="panel flex shrink-0 flex-col gap-3 p-3">
        <slot name="settings" />
      </div>
      <p v-if="error" class="text-sm text-danger" role="alert">{{ error }}</p>
      <slot />
    </div>
    <ToolRail />
  </div>
</template>

<script setup lang="ts">
import ToolRail from "@/components/ToolRail.vue";

defineProps<{ lead?: string; error?: string }>();
</script>
