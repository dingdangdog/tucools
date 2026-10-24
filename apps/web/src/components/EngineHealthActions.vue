<template>
  <div class="flex items-center gap-2">
    <span v-if="gate.phase === 'ready'" class="text-sm text-muted">
      {{ copy.featureReady }}
      <template v-if="gate.device">{{ copy.currentDevice }} {{ gate.device }}。</template>
    </span>
    <button type="button" class="btn" :disabled="gate.checking" @click="emit('refresh')">{{ copy.refreshHealth }}</button>
  </div>
</template>

<script setup lang="ts">
import { copy } from "@/content";
import { type ToolGate } from "@/engine-gate";

defineProps<{ gate: ToolGate }>();
const emit = defineEmits<{ refresh: [] }>();
</script>
