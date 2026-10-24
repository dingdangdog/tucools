<template>
  <StudioLayout :lead="copy.tools.cropping.lead">
    <Stage v-if="!url" :multiple="false" @files="open" />
    <div
      v-else
      class="stage relative min-h-[18rem] flex-1 overflow-hidden lg:h-full lg:min-h-0"
      @dragover.prevent
      @drop.prevent="onDrop"
    >
      <cropper-canvas class="fit-canvas" background>
        <cropper-image ref="imageRef" :src="url" alt="" rotatable scalable translatable />
        <cropper-shade hidden />
        <cropper-handle action="select" plain />
        <cropper-selection
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
      <button type="button" class="btn btn-primary" :disabled="!url" @click="exportPng">{{ copy.ui.exportPng }}</button>
      <button type="button" class="btn" :disabled="!url" @click="clear">{{ copy.ui.replace }}</button>
    </template>
  </StudioLayout>
</template>

<script setup lang="ts">
import { onUnmounted, ref } from "vue";
import type { CropperImage, CropperSelection } from "cropperjs";
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
const imageRef = ref<CropperImage>();
const selectionRef = ref<CropperSelection>();
let scaleX = 1;
let scaleY = 1;
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

async function exportPng() {
  const selection = selectionRef.value;
  if (!selection) return;
  error.value = "";
  try {
    const canvas = await selection.$toCanvas();
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((value) => (value ? resolve(value) : reject(new Error(copy.failed))), "image/png");
    });
    await saveOrDownload(blob, `${name.value}-crop.png`);
  } catch (reason) {
    error.value = reason instanceof Error ? reason.message : copy.failed;
  }
}

function clear() {
  if (url.value) URL.revokeObjectURL(url.value);
  url.value = "";
  fileName.value = "";
  detail.value = "";
}

onUnmounted(clear);
</script>

<style scoped>
.fit-canvas {
  display: block;
  width: 100%;
  height: 100%;
}
</style>
