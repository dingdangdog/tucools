<template>
  <StudioLayout :lead="copy.tools.cropping.lead">
    <Stage v-if="!url" :multiple="false" @files="open" />
    <div
      v-else
      class="flex min-h-0 flex-1 flex-col gap-3 lg:h-full lg:flex-row"
      @dragover.prevent
      @drop.prevent="onDrop"
    >
      <div class="stage relative min-h-[16rem] min-w-0 flex-1 overflow-hidden">
        <cropper-canvas class="fit-canvas" background>
          <cropper-image ref="imageRef" :src="url" alt="" rotatable scalable translatable />
          <cropper-shade hidden />
          <cropper-handle action="select" plain />
          <cropper-selection
            id="crop-selection"
            ref="selectionRef"
            initial-coverage="0.8"
            :aspect-ratio="ratio > 0 ? ratio : undefined"
            movable
            resizable
            outlined
          >
            <cropper-handle action="move" />
            <cropper-handle action="n-resize" />
            <cropper-handle action="e-resize" />
            <cropper-handle action="s-resize" />
            <cropper-handle action="w-resize" />
            <cropper-handle action="ne-resize" />
            <cropper-handle action="nw-resize" />
            <cropper-handle action="se-resize" />
            <cropper-handle action="sw-resize" />
          </cropper-selection>
        </cropper-canvas>
        <FileBadge :name="fileName" :detail="detail" />
      </div>
      <div class="flex w-full shrink-0 flex-col gap-2 self-start lg:w-72">
        <p class="text-sm text-muted">{{ copy.ui.previewCrop }}</p>
        <button
          ref="previewBox"
          type="button"
          class="crop-live checker h-56 w-full sm:h-72"
          :aria-label="copy.ui.previewCropHint"
          @click="openPreview"
        >
          <cropper-viewer ref="viewerRef" selection="#crop-selection" resize="none" />
        </button>
        <p class="text-xs text-muted">{{ copy.ui.previewCropHint }}</p>
      </div>
    </div>
    <template #panel>
      <div>
        <p class="mb-2 text-sm text-muted">{{ copy.ui.ratio }}</p>
        <Chips :model-value="ratio" :options="ratios" :label="copy.ui.ratio" @update:model-value="setRatio(Number($event))" />
      </div>
      <div class="flex flex-wrap gap-2">
        <button type="button" class="btn" :disabled="!url" @click="rotate(-90)">{{ copy.ui.rotateLeft }}</button>
        <button type="button" class="btn" :disabled="!url" @click="rotate(90)">{{ copy.ui.rotateRight }}</button>
        <button type="button" class="btn" :disabled="!url" @click="flip('x')">{{ copy.ui.flipX }}</button>
        <button type="button" class="btn" :disabled="!url" @click="flip('y')">{{ copy.ui.flipY }}</button>
      </div>
      <p v-if="error" class="text-sm text-danger" role="alert">{{ error }}</p>
    </template>
    <template #actions>
      <button type="button" class="btn" :disabled="!url || previewing" @click="openPreview">{{ copy.ui.previewCrop }}</button>
      <button type="button" class="btn btn-primary" :disabled="!url" @click="exportPng">{{ copy.ui.exportPng }}</button>
      <button type="button" class="btn" :disabled="!url" @click="clear">{{ copy.ui.replace }}</button>
    </template>
  </StudioLayout>
  <Teleport to="body">
    <div
      v-if="previewUrl"
      ref="lightboxRef"
      class="crop-lightbox"
      role="dialog"
      aria-modal="true"
      tabindex="-1"
      :aria-label="copy.ui.previewCrop"
      @click.self="closePreview"
    >
      <button
        type="button"
        class="icon-btn inline-flex crop-lightbox-close"
        :aria-label="copy.ui.closePreview"
        @click="closePreview"
      >
        <XMarkIcon class="h-5 w-5" />
      </button>
      <img :src="previewUrl" alt="" class="crop-lightbox-image" />
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, ref, watch } from "vue";
import { XMarkIcon } from "@heroicons/vue/24/outline";
import type { CropperImage, CropperSelection, CropperViewer } from "cropperjs";
import Chips from "@/components/Chips.vue";
import FileBadge from "@/components/FileBadge.vue";
import Stage from "@/components/Stage.vue";
import StudioLayout from "@/components/StudioLayout.vue";
import { copy } from "@/content";
import { formatBytes, isProcessableImage, stem } from "@/utils/image";
import { saveOrDownload } from "@/utils/save";

const url = ref("");
const error = ref("");
const fileName = ref("");
const detail = ref("");
const name = ref("image");
const ratio = ref(0);
const previewUrl = ref("");
const previewing = ref(false);
const imageRef = ref<CropperImage>();
const selectionRef = ref<CropperSelection>();
const viewerRef = ref<CropperViewer>();
const previewBox = ref<HTMLButtonElement>();
const lightboxRef = ref<HTMLElement>();
let scaleX = 1;
let scaleY = 1;
let resizeObserver: ResizeObserver | undefined;
let selectionEl: CropperSelection | undefined;
const ratios = [
  { value: 0, label: copy.ui.ratioFree },
  { value: 1, label: "1:1" },
  { value: 4 / 3, label: "4:3" },
  { value: 3 / 2, label: "3:2" },
  { value: 16 / 9, label: "16:9" },
  { value: 9 / 16, label: "9:16" },
];

async function open(files: File[]) {
  const file = files.find(isProcessableImage);
  if (!file) {
    error.value = copy.noImage;
    return;
  }
  await import("cropperjs");
  error.value = "";
  unbindPreview();
  closePreview();
  if (url.value) URL.revokeObjectURL(url.value);
  fileName.value = file.name;
  detail.value = formatBytes(file.size);
  name.value = stem(file.name);
  scaleX = 1;
  scaleY = 1;
  ratio.value = 0;
  url.value = URL.createObjectURL(file);
}

function onDrop(event: DragEvent) {
  const list = event.dataTransfer?.files;
  if (list?.length) void open(Array.from(list));
}

function setRatio(value: number) {
  ratio.value = value;
  const selection = selectionRef.value;
  if (!selection) return;
  const aspect = value > 0 ? value : Number.NaN;
  selection.aspectRatio = aspect;
  const width = selection.width;
  const height = value > 0 ? width / value : selection.height;
  selection.$change(selection.x, selection.y, width, height, aspect);
}

function rotate(degree: number) {
  imageRef.value?.$rotate(`${degree}deg`);
}

function flip(axis: "x" | "y") {
  if (axis === "x") scaleX *= -1;
  else scaleY *= -1;
  imageRef.value?.$scale(scaleX, scaleY);
}

function selectionSize(event?: Event) {
  const detail = (event as CustomEvent<{ width?: number; height?: number }> | undefined)?.detail;
  return {
    width: Number(detail?.width ?? selectionRef.value?.width ?? 0),
    height: Number(detail?.height ?? selectionRef.value?.height ?? 0),
  };
}

function fitViewer(event?: Event) {
  const box = previewBox.value;
  const viewer = viewerRef.value;
  if (!box || !viewer) return;
  const { width: sw, height: sh } = selectionSize(event);
  const maxW = box.clientWidth;
  const maxH = box.clientHeight;
  if (!(sw > 0) || !(sh > 0) || !(maxW > 0) || !(maxH > 0)) return;
  const scale = Math.min(maxW / sw, maxH / sh);
  viewer.style.width = `${Math.max(1, Math.floor(sw * scale))}px`;
  viewer.style.height = `${Math.max(1, Math.floor(sh * scale))}px`;
}

function renderViewer() {
  (viewerRef.value as { $render?: () => void } | undefined)?.$render?.();
}

function onSelectionChange(event: Event) {
  fitViewer(event);
}

function onBoxResize() {
  fitViewer();
  renderViewer();
}

function unbindPreview() {
  selectionEl?.removeEventListener("change", onSelectionChange, true);
  selectionEl = undefined;
  resizeObserver?.disconnect();
  resizeObserver = undefined;
}

function bindPreview() {
  unbindPreview();
  const selection = selectionRef.value;
  const box = previewBox.value;
  if (!selection || !box) return;
  selectionEl = selection;
  selection.addEventListener("change", onSelectionChange, true);
  resizeObserver = new ResizeObserver(() => onBoxResize());
  resizeObserver.observe(box);
  onBoxResize();
}

watch(url, async (value) => {
  if (!value) {
    unbindPreview();
    return;
  }
  for (let attempt = 0; attempt < 8; attempt += 1) {
    await nextTick();
    if (selectionRef.value && previewBox.value && viewerRef.value) {
      bindPreview();
      return;
    }
  }
});

async function croppedBlob() {
  const selection = selectionRef.value;
  const image = imageRef.value;
  if (!selection) throw new Error(copy.failed);
  let options: { width: number; height: number } | undefined;
  if (image && selection.width > 0 && selection.height > 0) {
    const [a, b, c, d] = image.$getTransform();
    const displayScale = Math.hypot(a, b) || Math.hypot(c, d);
    if (displayScale > 0) {
      let width = Math.round(selection.width / displayScale);
      let height = Math.round(selection.height / displayScale);
      const maxEdge = 16384;
      const edge = Math.max(width, height);
      if (edge > maxEdge) {
        const factor = maxEdge / edge;
        width = Math.round(width * factor);
        height = Math.round(height * factor);
      }
      if (width > 0 && height > 0) options = { width, height };
    }
  }
  const canvas = await selection.$toCanvas(options);
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((value) => (value ? resolve(value) : reject(new Error(copy.failed))), "image/png");
  });
}

async function openPreview() {
  if (!selectionRef.value || previewing.value) return;
  previewing.value = true;
  error.value = "";
  try {
    const blob = await croppedBlob();
    if (previewUrl.value) URL.revokeObjectURL(previewUrl.value);
    previewUrl.value = URL.createObjectURL(blob);
    await nextTick();
    lightboxRef.value?.focus();
  } catch (reason) {
    error.value = reason instanceof Error ? reason.message : copy.failed;
  } finally {
    previewing.value = false;
  }
}

function closePreview() {
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value);
  previewUrl.value = "";
}

async function exportPng() {
  if (!selectionRef.value) return;
  error.value = "";
  try {
    await saveOrDownload(await croppedBlob(), `${name.value}-crop.png`);
  } catch (reason) {
    error.value = reason instanceof Error ? reason.message : copy.failed;
  }
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === "Escape" && previewUrl.value) {
    event.preventDefault();
    closePreview();
  }
}

function clear() {
  unbindPreview();
  closePreview();
  if (url.value) URL.revokeObjectURL(url.value);
  url.value = "";
  fileName.value = "";
  detail.value = "";
}

onMounted(() => window.addEventListener("keydown", onKeydown));
onUnmounted(() => {
  window.removeEventListener("keydown", onKeydown);
  clear();
});
</script>

<style scoped>
.fit-canvas {
  display: block;
  width: 100%;
  height: 100%;
}

.crop-live {
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  padding: 0;
  border: 1px solid var(--line);
  border-radius: 16px;
  cursor: zoom-in;
}

.crop-live:hover {
  border-color: var(--accent);
}

.crop-live:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}

.crop-lightbox {
  position: fixed;
  inset: 0;
  z-index: 80;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  background: rgb(0 0 0 / 88%);
}

.crop-lightbox-image {
  width: min(92vw, 92vh);
  height: min(92vw, 92vh);
  object-fit: contain;
}

.crop-lightbox-close {
  position: absolute;
  top: 0.75rem;
  inset-inline-end: 0.75rem;
  color: white;
  background: rgb(255 255 255 / 16%);
}

.crop-lightbox-close:hover {
  color: white;
  background: rgb(255 255 255 / 28%);
}
</style>
