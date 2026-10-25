<template>
  <StudioLayout :lead="copy.tools.erase.lead">
    <Stage v-if="!imageUrl" :multiple="false" :disabled="!usable" :hint="stageHint" @files="open">
      <template v-if="showModelChoices" #fallback>
        <ModelChoices />
      </template>
    </Stage>
    <div v-else class="stage relative min-h-[18rem] flex-1 overflow-hidden lg:h-full lg:min-h-0">
      <div v-show="!resultUrl" ref="frame" class="absolute inset-0">
        <img
          ref="imageEl"
          :src="imageUrl"
          :alt="fileName"
          class="absolute left-1/2 top-1/2 max-h-full max-w-full -translate-x-1/2 -translate-y-1/2"
          @load="place"
        />
        <canvas
          ref="maskCanvas"
          class="absolute cursor-crosshair touch-none opacity-70"
          :class="{ 'pointer-events-none': !usable }"
          :style="maskStyle"
          @pointerdown="drawStart"
          @pointermove="drawMove"
          @pointerup="drawing = false"
          @pointerleave="drawing = false"
        />
        <FileBadge :name="fileName" :detail="formatBytes(fileBytes)" />
      </div>
      <CompareView
        v-if="resultUrl"
        :original="imageUrl"
        :result="resultUrl"
        :original-label="originalLabel"
        :result-label="resultLabel"
      />
      <BusyCover :show="running" :text="progress" />
    </div>
    <template #panel>
      <EngineStatus ref="engine" tool="erase" @gate="gate = $event" />
      <template v-if="usable">
        <Field :label="`${copy.ui.brush} ${brush}`">
          <input v-model.number="brush" class="range" type="range" min="8" max="120" :disabled="running" />
        </Field>
        <p class="text-sm text-muted">{{ copy.ui.paintHint }}</p>
      </template>
      <p v-if="error" class="text-sm text-danger" role="alert">{{ error }}</p>
    </template>
    <template #actions>
      <button v-if="resultUrl" type="button" class="btn btn-primary" @click="download">{{ copy.ui.downloadResult }}</button>
      <button v-else type="button" class="btn btn-primary" :disabled="!usable || !fileRef || running" @click="submit">
        {{ copy.ui.startErase }}
      </button>
      <button v-if="resultUrl" type="button" class="btn" :disabled="!usable || running" @click="state.reset()">{{ copy.ui.repaint }}</button>
      <button type="button" class="btn" :disabled="!usable || !imageUrl || running" @click="clearMask">{{ copy.ui.clearMask }}</button>
      <button type="button" class="btn" :disabled="!imageUrl || running" @click="reset">{{ copy.ui.replace }}</button>
      <EngineHealthActions :gate="gate" @refresh="engine?.load()" />
    </template>
  </StudioLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import { runEngineJob } from "@/api/engine";
import { type ToolGate } from "@/engine-gate";
import BusyCover from "@/components/BusyCover.vue";
import CompareView from "@/components/CompareView.vue";
import EngineHealthActions from "@/components/EngineHealthActions.vue";
import EngineStatus from "@/components/EngineStatus.vue";
import ModelChoices from "@/components/ModelChoices.vue";
import Field from "@/components/Field.vue";
import FileBadge from "@/components/FileBadge.vue";
import Stage from "@/components/Stage.vue";
import StudioLayout from "@/components/StudioLayout.vue";
import { useResults } from "@/composables/useResults";
import { copy } from "@/content";
import { formatBytes, isProcessableImage, stem } from "@/utils/image";

const engine = ref<{ load: () => Promise<void> } | null>(null);
const gate = ref<ToolGate>({ phase: "checking", available: [], device: "", checking: true });
const usable = computed(() => gate.value.phase === "ready");
const showModelChoices = computed(() => gate.value.phase === "down" || gate.value.phase === "blocked");
const stageHint = computed(() => {
  if (usable.value) return "";
  return gate.value.phase === "checking" ? copy.modelChecking : copy.modelUnavailable;
});
const brush = ref(36);
const error = ref("");
const progress = ref("");
const running = ref(false);
const imageUrl = ref("");
const fileName = ref("");
const fileBytes = ref(0);
const fileRef = ref<File | null>(null);
const frame = ref<HTMLElement | null>(null);
const imageEl = ref<HTMLImageElement | null>(null);
const maskCanvas = ref<HTMLCanvasElement | null>(null);
const maskStyle = ref({ left: "0px", top: "0px", width: "0px", height: "0px" });
const drawing = ref(false);
const state = useResults();
const resultUrl = computed(() => state.items[0]?.url ?? "");
const originalLabel = computed(() => `${copy.ui.original} · ${formatBytes(fileBytes.value)}`);
const resultLabel = computed(() => `${copy.ui.result} · ${formatBytes(state.items[0]?.blob.size ?? 0)}`);
let observer: ResizeObserver | undefined;

function open(files: File[]) {
  if (!usable.value) return;
  const file = files.find(isProcessableImage);
  if (!file) {
    error.value = copy.noImage;
    return;
  }
  error.value = "";
  progress.value = "";
  if (imageUrl.value) URL.revokeObjectURL(imageUrl.value);
  state.reset();
  fileRef.value = file;
  fileName.value = file.name;
  fileBytes.value = file.size;
  imageUrl.value = URL.createObjectURL(file);
}

function place() {
  const box = frame.value;
  const image = imageEl.value;
  const canvas = maskCanvas.value;
  if (!box || !image || !canvas || !image.naturalWidth) return;
  const boxRect = box.getBoundingClientRect();
  const imageRect = image.getBoundingClientRect();
  maskStyle.value = {
    left: `${imageRect.left - boxRect.left}px`,
    top: `${imageRect.top - boxRect.top}px`,
    width: `${imageRect.width}px`,
    height: `${imageRect.height}px`,
  };
  if (canvas.width !== image.naturalWidth || canvas.height !== image.naturalHeight) {
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
  }
}

function point(event: PointerEvent) {
  const canvas = maskCanvas.value;
  if (!canvas) return null;
  const rect = canvas.getBoundingClientRect();
  if (!rect.width || !rect.height) return null;
  return {
    x: ((event.clientX - rect.left) / rect.width) * canvas.width,
    y: ((event.clientY - rect.top) / rect.height) * canvas.height,
  };
}

function paint(event: PointerEvent) {
  const canvas = maskCanvas.value;
  const pos = point(event);
  if (!canvas || !pos) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.fillStyle = "white";
  ctx.beginPath();
  ctx.arc(pos.x, pos.y, brush.value / 2, 0, Math.PI * 2);
  ctx.fill();
}

function drawStart(event: PointerEvent) {
  if (!usable.value) return;
  drawing.value = true;
  (event.target as HTMLCanvasElement).setPointerCapture(event.pointerId);
  paint(event);
}

function drawMove(event: PointerEvent) {
  if (!drawing.value) return;
  paint(event);
}

function clearMask() {
  const canvas = maskCanvas.value;
  const ctx = canvas?.getContext("2d");
  if (!canvas || !ctx) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function reset() {
  if (imageUrl.value) URL.revokeObjectURL(imageUrl.value);
  imageUrl.value = "";
  fileRef.value = null;
  fileName.value = "";
  fileBytes.value = 0;
  error.value = "";
  progress.value = "";
  state.reset();
}

async function maskBlob() {
  const canvas = maskCanvas.value;
  if (!canvas) throw new Error(copy.ui.needPaint);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error(copy.ui.canvas);
  const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height);
  let painted = false;
  for (let i = 3; i < pixels.data.length; i += 4) {
    if (pixels.data[i] > 0) {
      painted = true;
      break;
    }
  }
  if (!painted) throw new Error(copy.ui.needPaint);
  const exportCanvas = document.createElement("canvas");
  exportCanvas.width = canvas.width;
  exportCanvas.height = canvas.height;
  const out = exportCanvas.getContext("2d");
  if (!out) throw new Error(copy.ui.canvas);
  out.fillStyle = "black";
  out.fillRect(0, 0, exportCanvas.width, exportCanvas.height);
  out.drawImage(canvas, 0, 0);
  return new Promise<Blob>((resolve, reject) => {
    exportCanvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error(copy.ui.maskExport))), "image/png");
  });
}

async function submit() {
  const file = fileRef.value;
  if (!usable.value || !file) return;
  error.value = "";
  progress.value = copy.processing;
  running.value = true;
  state.reset();
  try {
    const mask = await maskBlob();
    const body = new FormData();
    body.append("image", file);
    body.append("mask", mask, "mask.png");
    body.append("device", "auto");
    const blob = await runEngineJob("/api/engine/erase", body, (event) => {
      progress.value = `${event.message} ${event.percentage}%`;
    });
    state.add(`${stem(file.name)}-erase.png`, blob, `${formatBytes(file.size)} → ${formatBytes(blob.size)}`);
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

watch(frame, (element) => {
  observer?.disconnect();
  if (element) observer?.observe(element);
});

onMounted(() => {
  observer = new ResizeObserver(() => place());
  if (frame.value) observer.observe(frame.value);
});

onUnmounted(() => {
  observer?.disconnect();
  if (imageUrl.value) URL.revokeObjectURL(imageUrl.value);
  state.reset();
});
</script>
