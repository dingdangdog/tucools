<template>
  <div class="flex h-full min-h-0 flex-col gap-3 overflow-y-auto p-3 lg:flex-row lg:overflow-hidden lg:p-4">
    <div class="flex min-h-[18rem] min-w-0 flex-1 flex-col lg:min-h-0">
      <slot />
    </div>
    <aside class="flex w-full shrink-0 lg:h-full lg:w-80">
      <div class="panel flex w-full flex-col gap-3 p-3 lg:h-full lg:min-h-0">
        <p v-if="lead" class="shrink-0 text-sm text-muted">{{ lead }}</p>
        <div class="flex flex-col gap-3 lg:min-h-0 lg:flex-1 lg:overflow-y-auto">
          <slot name="panel" />
        </div>
        <div v-if="$slots.actions" class="flex shrink-0 flex-col gap-2 border-t border-line pt-3">
          <slot name="actions" />
        </div>
      </div>
    </aside>
  </div>
</template>

<script setup lang="ts">
defineProps<{ lead?: string }>();
</script>
