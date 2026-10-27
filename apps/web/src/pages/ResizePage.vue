<template>
  <BatchLayout :lead="copy.tools.resize.lead" :error="state.error">
    <template #stage>
      <Stage docked :compact="sources.length > 0" :busy="state.busy" @files="run" />
    </template>
    <template #settings>
      <div class="grid gap-3 sm:grid-cols-2">
        <Field :label="copy.ui.width">
          <input v-model.number="width" class="field-input" type="number" min="1" />
        </Field>
        <Field :label="copy.ui.height">
          <input v-model.number="height" class="field-input" type="number" min="1" />
        </Field>
      </div>
      <div>
        <p class="mb-2 text-sm text-muted">{{ copy.ui.fit }}</p>
        <Chips v-model="fit" :options="fits" :label="copy.ui.fit" />
      </div>
      <div v-if="sources.length" class="flex flex-wrap justify-center">
        <button type="button" class="btn btn-primary" :disabled="state.busy" @click="run()">{{ copy.ui.again }}</button>
      </div>
    </template>
    <ResultGrid
      :items="state.items"
      :columns="4"
      @clear="clearAll"
      @remove="state.remove"
      @download="state.download"
      @download-all="state.downloadAll('resize.zip')"
    />
  </BatchLayout>
</template>

<script setup lang="ts">
import { onUnmounted, ref } from "vue";
import BatchLayout from "@/components/BatchLayout.vue";
import Chips from "@/components/Chips.vue";
import Field from "@/components/Field.vue";
import ResultGrid from "@/components/ResultGrid.vue";
import Stage from "@/components/Stage.vue";
import { useBatchJob, wholeNumber } from "@/composables/useBatchJob";
import { useResults } from "@/composables/useResults";
import { copy } from "@/content";
import { canvasToBlob, drawContainCover, fileToImage, formatBytes, stem } from "@/utils/image";

const state = useResults();
const width = ref(1280);
const height = ref(720);
const fit = ref<"contain" | "cover" | "stretch">("contain");
const { files: sources, replace, clear: forget, start } = useBatchJob([width, height, fit], () => void run());
const fits = [
  { value: "contain", label: copy.ui.fitContain },
  { value: "cover", label: copy.ui.fitCover },
  { value: "stretch", label: copy.ui.fitStretch },
];

async function run(incoming?: File[]) {
  if (incoming) {
    const images = state.imagesOf(incoming);
    if (!images.length) return;
    replace(images);
  }
  if (!sources.value.length) return;
  const targetWidth = wholeNumber(width.value, 1, 16000);
  const targetHeight = wholeNumber(height.value, 1, 16000);
  if (targetWidth == null || targetHeight == null) return;

  const alive = start();
  const batch = sources.value.slice();
  const currentFit = fit.value;
  state.busy = true;
  state.error = "";
  try {
    const produced: { name: string; blob: Blob; detail: string }[] = [];
    for (const file of batch) {
      const image = await fileToImage(file);
      if (!alive()) return;
      const canvas =
        currentFit === "stretch"
          ? stretch(image, targetWidth, targetHeight)
          : drawContainCover(image, image.naturalWidth, image.naturalHeight, targetWidth, targetHeight, currentFit, "#ffffff");
      const blob = await canvasToBlob(canvas, "image/png");
      if (!alive()) return;
      produced.push({
        name: `${stem(file.name)}-${targetWidth}x${targetHeight}.png`,
        blob,
        detail: `${targetWidth}×${targetHeight} · ${formatBytes(blob.size)}`,
      });
    }
    if (!alive()) return;
    state.reset();
    for (const item of produced) state.add(item.name, item.blob, item.detail);
  } catch (error) {
    if (alive()) state.error = error instanceof Error ? error.message : copy.failed;
  } finally {
    if (alive()) state.busy = false;
  }
}

function stretch(image: HTMLImageElement, targetWidth: number, targetHeight: number) {
  const canvas = document.createElement("canvas");
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error(copy.ui.canvas);
  ctx.drawImage(image, 0, 0, targetWidth, targetHeight);
  return canvas;
}

function clearAll() {
  forget();
  state.reset();
  state.busy = false;
}

onUnmounted(clearAll);
</script>
