<template>
  <BatchLayout :lead="copy.tools.store.lead" :error="state.error">
    <template #stage>
      <Stage docked :compact="state.items.length > 0" :multiple="false" :busy="state.busy" @files="open" />
    </template>
    <template #settings>
      <div>
        <p class="mb-2 text-sm text-muted">{{ copy.ui.store.platform }}</p>
        <Chips v-model="group" :options="groupOptions" :label="copy.ui.store.platform" />
      </div>
      <div>
        <div class="mb-2 flex flex-wrap items-center justify-between gap-2">
          <p class="text-sm text-muted">{{ copy.ui.store.size }}</p>
          <div class="flex flex-wrap gap-2">
            <button type="button" class="btn" @click="useRecommended">{{ copy.ui.store.recommended }}</button>
            <button type="button" class="btn" @click="selectVisible">{{ copy.ui.store.selectAll }}</button>
            <button type="button" class="btn" @click="clearVisible">{{ copy.ui.store.clearGroup }}</button>
          </div>
        </div>
        <Chips v-model="selected" :options="sizeOptions" :label="copy.ui.store.size" />
      </div>
      <div>
        <p class="mb-2 text-sm text-muted">{{ copy.ui.store.orientation }}</p>
        <Chips v-model="orientation" :options="orientations" :label="copy.ui.store.orientation" />
        <p class="mt-2 text-xs text-muted">{{ copy.ui.store.orientationHint }}</p>
      </div>
      <div>
        <p class="mb-2 text-sm text-muted">{{ copy.ui.fit }}</p>
        <Chips v-model="fit" :options="fits" :label="copy.ui.fit" />
        <p v-if="fit === 'tile'" class="mt-2 text-xs text-muted">{{ copy.ui.store.tileHint }}</p>
      </div>
      <div class="grid gap-3 sm:grid-cols-2">
        <div>
          <p class="mb-2 text-sm text-muted">{{ copy.ui.background }}</p>
          <div class="flex flex-wrap items-center gap-2">
            <button type="button" class="chip" :aria-pressed="backgroundMode === 'transparent'" @click="backgroundMode = 'transparent'">
              {{ copy.ui.store.transparent }}
            </button>
            <button type="button" class="chip" :aria-pressed="backgroundMode === 'white'" @click="backgroundMode = 'white'">
              {{ copy.ui.store.white }}
            </button>
            <button type="button" class="chip" :aria-pressed="backgroundMode === 'black'" @click="backgroundMode = 'black'">
              {{ copy.ui.store.black }}
            </button>
            <button type="button" class="chip" :aria-pressed="backgroundMode === 'custom'" @click="backgroundMode = 'custom'">
              {{ copy.ui.store.custom }}
            </button>
            <input
              v-model="customColor"
              class="field-input w-14"
              type="color"
              :aria-label="copy.ui.store.custom"
              @input="backgroundMode = 'custom'"
            />
          </div>
        </div>
        <div>
          <p class="mb-2 text-sm text-muted">{{ copy.ui.targetFormat }}</p>
          <Chips v-model="format" :options="formats" :label="copy.ui.targetFormat" />
        </div>
      </div>
      <p class="text-xs text-muted">{{ copy.ui.store.alphaNote }}</p>
      <p class="text-sm text-muted">{{ outputCount ? `${copy.ui.output} ${outputCount}` : copy.ui.store.needSize }}</p>
      <div v-if="source">
        <button type="button" class="btn btn-primary" :disabled="state.busy" @click="generate">
          {{ copy.ui.store.generate }}
        </button>
      </div>
    </template>
    <ResultGrid
      :items="state.items"
      show-copy
      :copied-name="copiedName"
      @clear="clearResults"
      @remove="state.remove"
      @download="state.download"
      @copy="copyItem"
      @download-all="state.downloadAll(zipName)"
    />
  </BatchLayout>
</template>

<script setup lang="ts">
import { computed, onUnmounted, ref } from "vue";
import BatchLayout from "@/components/BatchLayout.vue";
import Chips from "@/components/Chips.vue";
import ResultGrid, { type ResultItem } from "@/components/ResultGrid.vue";
import Stage from "@/components/Stage.vue";
import { useResults } from "@/composables/useResults";
import { copy } from "@/content";
import { canvasToBlob, fileToImage, formatBytes, isProcessableImage, loadImage, stem } from "@/utils/image";
import {
  drawStoreFrame,
  storeFileName,
  storeFrames,
  storeGroupOrder,
  storePresets,
  type StoreFit,
  type StoreGroup,
  type StoreOrientation,
} from "@/utils/store-sizes";

const state = useResults();
const group = ref<StoreGroup>("iphone");
const selected = ref<string[]>(storePresets.filter((item) => item.recommended).map((item) => item.id));
const orientation = ref<StoreOrientation>("portrait");
const fit = ref<StoreFit>("contain");
const backgroundMode = ref<"transparent" | "white" | "black" | "custom">("white");
const customColor = ref("#2563eb");
const format = ref<"png" | "jpg">("png");
const source = ref<HTMLImageElement | null>(null);
const fileName = ref("");
const copiedName = ref("");
let ticket = 0;
let copiedTimer = 0;

const groupOptions = computed(() =>
  storeGroupOrder.map((id) => {
    const count = storePresets.filter((item) => item.groups.includes(id) && selected.value.includes(item.id)).length;
    const name = copy.ui.store.groups[id];
    return { value: id, label: count ? `${name} ${count}` : name };
  })
);
const visible = computed(() => storePresets.filter((item) => item.groups.includes(group.value)));
const sizeOptions = computed(() =>
  visible.value.map((item) => ({
    value: item.id,
    label: `${storeName(item.id)} ${item.width}×${item.height}`,
  }))
);
const orientations = computed(() => [
  { value: "portrait", label: copy.ui.store.portrait },
  { value: "landscape", label: copy.ui.store.landscape },
  { value: "both", label: copy.ui.store.both },
]);
const fits = computed(() => [
  { value: "contain", label: copy.ui.fitContain },
  { value: "cover", label: copy.ui.fitCover },
  { value: "stretch", label: copy.ui.fitStretch },
  { value: "tile", label: copy.ui.fitTile },
]);
const formats = [
  { value: "png", label: "PNG" },
  { value: "jpg", label: "JPEG" },
];
const outputCount = computed(() => storeFrames(selected.value, orientation.value).length);
const zipName = computed(() => `${fileName.value ? stem(fileName.value) : "image"}-store.zip`);
const background = computed(() => {
  if (format.value === "jpg" && backgroundMode.value === "transparent") return "#ffffff";
  if (backgroundMode.value === "transparent") return "rgba(0,0,0,0)";
  if (backgroundMode.value === "white") return "#ffffff";
  if (backgroundMode.value === "black") return "#000000";
  return customColor.value;
});

function storeName(id: string) {
  const names = copy.ui.store.names as Record<string, string>;
  return names[id] ?? id;
}

function useRecommended() {
  const visibleIds = new Set(visible.value.map((item) => item.id));
  const kept = selected.value.filter((id) => !visibleIds.has(id));
  const next = visible.value.filter((item) => item.recommended).map((item) => item.id);
  selected.value = [...kept, ...next];
}

function selectVisible() {
  selected.value = [...new Set([...selected.value, ...visible.value.map((item) => item.id)])];
}

function clearVisible() {
  const visibleIds = new Set(visible.value.map((item) => item.id));
  selected.value = selected.value.filter((id) => !visibleIds.has(id));
}

function failure(error: unknown) {
  if (error instanceof Error && error.message === "canvas") return copy.ui.canvas;
  return error instanceof Error ? error.message : copy.failed;
}

async function open(files: File[]) {
  const file = files.find(isProcessableImage);
  if (!file) {
    state.error = copy.noImage;
    return;
  }
  state.error = "";
  try {
    source.value = await fileToImage(file);
    fileName.value = file.name;
  } catch (error) {
    state.error = failure(error);
    return;
  }
  await generate();
}

async function generate() {
  const image = source.value;
  if (!image) return;
  const frames = storeFrames(selected.value, orientation.value);
  if (!frames.length) {
    state.error = copy.ui.store.needSize;
    return;
  }
  const current = ++ticket;
  const fitMode = fit.value;
  const paint = background.value;
  const extension = format.value;
  const mime = extension === "jpg" ? "image/jpeg" : "image/png";
  state.reset();
  state.busy = true;
  state.error = "";
  try {
    for (const frame of frames) {
      if (current !== ticket) return;
      const canvas = drawStoreFrame(image, image.naturalWidth, image.naturalHeight, frame.width, frame.height, fitMode, paint);
      const blob = await canvasToBlob(canvas, mime, extension === "jpg" ? 0.92 : undefined);
      if (current !== ticket) return;
      state.add(
        storeFileName(frame, extension),
        blob,
        `${storeName(frame.id)} · ${frame.width}×${frame.height} · ${formatBytes(blob.size)}`
      );
    }
  } catch (error) {
    if (current === ticket) state.error = failure(error);
  } finally {
    if (current === ticket) state.busy = false;
  }
}

async function asPng(blob: Blob) {
  if (blob.type === "image/png") return blob;
  const url = URL.createObjectURL(blob);
  try {
    const image = await loadImage(url);
    const canvas = document.createElement("canvas");
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("canvas");
    ctx.drawImage(image, 0, 0);
    return await canvasToBlob(canvas, "image/png");
  } finally {
    URL.revokeObjectURL(url);
  }
}

async function copyItem(item: ResultItem) {
  try {
    if (!navigator.clipboard?.write || typeof ClipboardItem === "undefined") throw new Error("copy");
    await navigator.clipboard.write([new ClipboardItem({ "image/png": asPng(item.blob) })]);
    copiedName.value = item.name;
    window.clearTimeout(copiedTimer);
    copiedTimer = window.setTimeout(() => {
      if (copiedName.value === item.name) copiedName.value = "";
    }, 2000);
  } catch {
    state.error = copy.ui.copyFailed;
  }
}

function clearResults() {
  copiedName.value = "";
  state.reset();
}

onUnmounted(() => {
  ticket += 1;
  window.clearTimeout(copiedTimer);
  state.reset();
});
</script>
