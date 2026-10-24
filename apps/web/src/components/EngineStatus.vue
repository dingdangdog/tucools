<template>
  <div class="text-sm">
    <p v-if="down" class="text-danger">{{ copy.engineDown }}</p>
    <p v-else-if="status && !status.ready" class="text-danger">
      {{ copy.engineMissing }}：{{ status.missing.join("、") }}
    </p>
    <p v-if="!down && health?.modelPack && status && !status.ready" class="mt-1 text-muted">
      {{ copy.modelPackHint }} {{ health.modelPack }}
    </p>
    <p v-else-if="status && status.ready" class="text-muted">{{ copy.ui.engineReady }} {{ device }}。</p>
    <button type="button" class="btn mt-2" @click="load">{{ copy.refreshHealth }}</button>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { engineHealth, type EngineHealth, type EngineToolStatus } from "@/api/engine";
import { copy } from "@/content/zh";

const props = defineProps<{ tool: "cutout" | "enhance" | "erase" }>();
const emit = defineEmits<{ health: [EngineHealth | null] }>();
const health = ref<EngineHealth | null>(null);
const down = ref(false);
const status = computed(() => health.value?.[props.tool] as EngineToolStatus | undefined);
const device = computed(() => health.value?.device ?? "cpu");

async function load() {
  try {
    health.value = await engineHealth();
    down.value = false;
  } catch {
    health.value = null;
    down.value = true;
  }
  emit("health", health.value);
}

onMounted(load);
defineExpose({ load });
</script>
