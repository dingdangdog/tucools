<template>
  <div class="flex h-full min-h-0 flex-col gap-3 overflow-y-auto p-3 lg:flex-row lg:overflow-hidden lg:p-4">
    <div
      class="flex min-w-0 flex-col gap-3 lg:grid lg:h-full lg:min-h-0 lg:flex-1 lg:grid-rows-[auto_minmax(12rem,1fr)_auto_auto] lg:overflow-y-auto"
    >
      <p v-if="lead" class="shrink-0 text-sm text-muted lg:row-start-1">{{ lead }}</p>
      <div class="flex min-h-[18rem] min-w-0 flex-col lg:row-start-2 lg:h-full lg:min-h-0">
        <slot />
      </div>
      <div v-if="$slots.panel" class="panel flex shrink-0 flex-col gap-3 overflow-y-auto p-3 lg:row-start-3 lg:max-h-80">
        <slot name="panel" />
      </div>
      <div v-if="$slots.actions" class="flex shrink-0 flex-wrap items-center gap-2 lg:row-start-4">
        <slot name="actions" />
      </div>
    </div>
    <ToolRail />
  </div>
</template>

<script setup lang="ts">
import ToolRail from "@/components/ToolRail.vue";

defineProps<{ lead?: string }>();
</script>
