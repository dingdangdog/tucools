<template>
  <StudioLayout :lead="copy.tools.enhance.lead">
    <Stage
      :filled="Boolean(sourceUrl)"
      :multiple="false"
      :busy="running"
      :progress="progress"
      :disabled="!usable"
      :hint="stageHint"
      @files="open"
    >
      <div class="relative h-full w-full">
        <CompareView
          v-if="resultUrl"
          :original="sourceUrl"
          :result="resultUrl"
          :original-label="originalLabel"
          :result-label="resultLabel"
        />
        <div v-else class="flex h-full w-full items-center justify-center">
          <img :src="sourceUrl" :alt="sourceName" class="max-h-full max-w-full object-contain" />
          <FileBadge :name="sourceName" :detail="formatBytes(sourceBytes)" />
        </div>
      </div>
    </Stage>
    <template #panel>
      <EngineStatus tool="enhance" @gate="gate = $event" />
      <template v-if="usable">
        <div>
          <p class="mb-2 text-sm text-muted">{{ copy.ui.effect }}</p>
          <Chips v-model="model" :options="modelOptions" :label="copy.ui.effect" :disabled="running" />
        </div>
        <div>
          <p class="mb-2 text-sm text-muted">{{ copy.ui.scale }}</p>
          <Chips v-model="scale" :options="scales" :label="copy.ui.scale" :disabled="running" />
        </div>
      </template>
      <p v-if="error" class="text-sm text-danger" role="alert">{{ error }}</p>
    </template>
    <template #actions>
      <button v-if="resultUrl" type="button" class="btn btn-primary" @click="download">{{ copy.ui.downloadResult }}</button>
      <button v-else type="button" class="btn btn-primary" :disabled="!usable || !sourceFile || running" @click="run">
        {{ copy.ui.startEnhance }}
      </button>
      <button v-if="resultUrl" type="button" class="btn" :disabled="!usable || running" @click="run">{{ copy.ui.again }}</button>
      <button v-if="sourceUrl" type="button" class="btn" :disabled="running" @click="clear">{{ copy.ui.replace }}</button>
    </template>
  </StudioLayout>
</template>

<script setup lang="ts">
import { computed, onUnmounted, ref, watch } from "vue";
import { runEngineJob } from "@/api/engine";
import { type ToolGate } from "@/engine-gate";
import Chips from "@/components/Chips.vue";
import CompareView from "@/components/CompareView.vue";
import EngineStatus from "@/components/EngineStatus.vue";
import FileBadge from "@/components/FileBadge.vue";
import Stage from "@/components/Stage.vue";
import StudioLayout from "@/components/StudioLayout.vue";
import { useResults } from "@/composables/useResults";
import { copy } from "@/content";
import { formatBytes, isProcessableImage, stem } from "@/utils/image";

const models = [
  { value: "balanced", label: copy.ui.effects.balanced },
  { value: "standard", label: copy.ui.effects.standard },
  { value: "premium", label: copy.ui.effects.premium },
  { value: "anime", label: copy.ui.effects.anime },
  { value: "anime_pro", label: copy.ui.effects.animePro },
];
const scales = [
  { value: 1, label: "1" },
  { value: 2, label: "2" },
  { value: 3, label: "3" },
  { value: 4, label: "4" },
];
const gate = ref<ToolGate>({ phase: "checking", available: [] });
const usable = computed(() => gate.value.phase === "ready");
const stageHint = computed(() => {
  if (usable.value) return "";
  return gate.value.phase === "checking" ? copy.modelChecking : copy.modelUnavailable;
});
const modelOptions = computed(() => {
  const names = new Set(gate.value.available);
  return models.filter((item) => names.has(item.value));
});
const model = ref("balanced");

watch(modelOptions, (options) => {
  if (!options.length) return;
  if (!options.some((item) => item.value === model.value)) model.value = options[0].value;
});
const scale = ref(2);
const error = ref("");
const progress = ref("");
const running = ref(false);
const sourceUrl = ref("");
const sourceName = ref("");
const sourceBytes = ref(0);
const sourceFile = ref<File | null>(null);
const state = useResults();
const resultUrl = computed(() => state.items[0]?.url ?? "");
const originalLabel = computed(() => `${copy.ui.original} · ${formatBytes(sourceBytes.value)}`);
const resultLabel = computed(() => `${copy.ui.result} · ${formatBytes(state.items[0]?.blob.size ?? 0)}`);

function open(files: File[]) {
  if (!usable.value) return;
  const file = files.find(isProcessableImage);
  if (!file) {
    error.value = copy.noImage;
    return;
  }
  error.value = "";
  progress.value = "";
  if (sourceUrl.value) URL.revokeObjectURL(sourceUrl.value);
  state.reset();
  sourceFile.value = file;
  sourceName.value = file.name;
  sourceBytes.value = file.size;
  sourceUrl.value = URL.createObjectURL(file);
}

async function run() {
  const file = sourceFile.value;
  if (!usable.value || !file) return;
  error.value = "";
  progress.value = copy.processing;
  running.value = true;
  state.reset();
  const body = new FormData();
  body.append("image", file);
  body.append("model", model.value);
  body.append("scale", String(scale.value));
  body.append("gpu", "false");
  try {
    const blob = await runEngineJob("/api/engine/enhance", body, (event) => {
      progress.value = `${event.message} ${event.percentage}%`;
    });
    state.add(`${stem(file.name)}-enhance.png`, blob, `${formatBytes(file.size)} → ${formatBytes(blob.size)}`);
    progress.value = "";
  } catch (reason) {
    error.value = reason instanceof Error ? reason.message : copy.failed;
    progress.value = "";
  } finally {
    running.value = false;
  }
}

function download() {
  const item = state.items[0];
  if (item) void state.download(item);
}

function clear() {
  if (sourceUrl.value) URL.revokeObjectURL(sourceUrl.value);
  sourceUrl.value = "";
  sourceFile.value = null;
  sourceName.value = "";
  sourceBytes.value = 0;
  progress.value = "";
  error.value = "";
  state.reset();
}

onUnmounted(clear);
</script>
