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
        {{ desktop ? copy.modelDownload.directory : copy.modelPackHint }} {{ health.modelPack }}
      </p>
    </template>
    <p v-else-if="status?.missing.length" class="break-all text-muted">
      {{ copy.modelPartial }}：{{ status.missing.join("、") }}
    </p>
    <ModelPackDownload v-if="desktop && phase === 'ready' && status?.missing.length" class="mt-2" />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue";
import { engineHealth, type EngineToolHealth, type EngineToolName } from "@/api/engine";
import ModelPackDownload from "@/components/ModelPackDownload.vue";
import { copy } from "@/content";
import { type ToolGate } from "@/engine-gate";
import { canDownloadModelPack } from "@/model-pack-download";

const desktop = canDownloadModelPack();

const props = defineProps<{ tool: EngineToolName }>();
const emit = defineEmits<{ gate: [ToolGate] }>();
const health = ref<EngineToolHealth | null>(null);
const down = ref(false);
const loaded = ref(false);
const checking = ref(false);
const status = computed(() => health.value ?? undefined);
const phase = computed(() => snapshot().phase);
let queued = false;

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
  if (checking.value) {
    queued = true;
    return;
  }
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
    if (queued) {
      queued = false;
      void load();
    }
  }
}

function onInstalled() {
  void load();
}

onMounted(() => {
  void load();
  window.addEventListener("tucools-models-installed", onInstalled);
});
onUnmounted(() => {
  window.removeEventListener("tucools-models-installed", onInstalled);
});
defineExpose({ load });
</script>
