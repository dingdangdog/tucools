<template>
  <div class="text-sm">
    <p v-if="phase === 'checking'" class="text-muted">{{ copy.modelChecking }}</p>
    <p v-else-if="phase === 'down'" class="text-danger">{{ copy.engineDown }}</p>
    <template v-else-if="phase === 'blocked'">
      <p class="text-danger">{{ copy.modelBlocked }}</p>
      <p v-if="status?.missing.length" class="mt-1 break-all text-danger">
        {{ copy.engineMissing }}：{{ status.missing.join("、") }}
      </p>
      <p v-if="health?.modelPack" class="mt-1 break-all text-muted">
        {{ copy.modelPackHint }} {{ health.modelPack }}
      </p>
      <div class="mt-2">
        <p class="text-muted">{{ copy.modelLinksLead }}</p>
        <p class="mt-2">
          <span class="text-muted">{{ copy.modelRepo }}</span>
          <a class="text-link ml-1 break-all" :href="projectRepo" target="_blank" rel="noreferrer">{{ projectRepo }}</a>
        </p>
        <p class="mt-1">
          <span class="text-muted">{{ copy.modelReleases }}</span>
          <a class="text-link ml-1 break-all" :href="projectReleases" target="_blank" rel="noreferrer">{{ projectReleases }}</a>
        </p>
      </div>
    </template>
    <template v-else>
      <p class="text-muted">{{ copy.ui.engineReady }} {{ device }}。</p>
      <p v-if="status?.missing.length" class="mt-1 break-all text-muted">
        {{ copy.modelPartial }}：{{ status.missing.join("、") }}
      </p>
    </template>
    <button type="button" class="btn mt-2" :disabled="checking" @click="load">{{ copy.refreshHealth }}</button>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { engineHealth, type EngineHealth, type EngineToolStatus } from "@/api/engine";
import { copy } from "@/content/zh";
import { type ToolGate } from "@/engine-gate";
import { projectReleases, projectRepo } from "@/release";

const props = defineProps<{ tool: "cutout" | "enhance" | "erase" }>();
const emit = defineEmits<{ gate: [ToolGate] }>();
const health = ref<EngineHealth | null>(null);
const down = ref(false);
const loaded = ref(false);
const checking = ref(false);
const status = computed(() => health.value?.[props.tool] as EngineToolStatus | undefined);
const device = computed(() => health.value?.device ?? "cpu");
const phase = computed(() => snapshot().phase);

function snapshot(): ToolGate {
  if (!loaded.value) return { phase: "checking", available: [] };
  if (down.value || !health.value) return { phase: "down", available: [] };
  const current = health.value[props.tool];
  if (!current?.ready) return { phase: "blocked", available: [] };
  return { phase: "ready", available: current.available };
}

async function load() {
  if (checking.value) return;
  checking.value = true;
  try {
    health.value = await engineHealth();
    down.value = false;
  } catch {
    health.value = null;
    down.value = true;
  } finally {
    checking.value = false;
    loaded.value = true;
    emit("gate", snapshot());
  }
}

onMounted(load);
defineExpose({ load });
</script>
