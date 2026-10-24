<template>
  <div v-if="phase !== 'ready' || status?.missing.length" class="text-sm">
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
    <p v-else-if="status?.missing.length" class="break-all text-muted">
      {{ copy.modelPartial }}：{{ status.missing.join("、") }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { engineHealth, type EngineToolHealth, type EngineToolName } from "@/api/engine";
import { copy } from "@/content";
import { type ToolGate } from "@/engine-gate";
import { projectReleases, projectRepo } from "@/release";

const props = defineProps<{ tool: EngineToolName }>();
const emit = defineEmits<{ gate: [ToolGate] }>();
const health = ref<EngineToolHealth | null>(null);
const down = ref(false);
const loaded = ref(false);
const checking = ref(false);
const status = computed(() => health.value ?? undefined);
const phase = computed(() => snapshot().phase);

function snapshot(): ToolGate {
  const device = health.value?.device ?? "";
  const busy = checking.value;
  if (!loaded.value) return { phase: "checking", available: [], device, checking: busy };
  if (down.value || !health.value) return { phase: "down", available: [], device, checking: busy };
  if (!health.value.ready) return { phase: "blocked", available: [], device, checking: busy };
  return { phase: "ready", available: health.value.available, device, checking: busy };
}

function publish() {
  emit("gate", snapshot());
}

async function load() {
  if (checking.value) return;
  checking.value = true;
  publish();
  try {
    health.value = await engineHealth(props.tool);
    down.value = false;
  } catch {
    health.value = null;
    down.value = true;
  } finally {
    checking.value = false;
    loaded.value = true;
    publish();
  }
}

onMounted(load);
defineExpose({ load });
</script>
