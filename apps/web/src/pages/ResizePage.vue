<template>
  <BatchLayout :lead="copy.tools.resize.lead" :error="state.error">
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
    </template>
    <Stage :compact="state.items.length > 0" :busy="state.busy" @files="run" />
    <ResultGrid
      :items="state.items"
      @clear="state.reset()"
      @remove="state.remove"
      @download="state.download"
      @download-all="state.downloadAll('resize.zip')"
    />
  </BatchLayout>
</template>

<script setup lang="ts">
import { ref } from "vue";
import BatchLayout from "@/components/BatchLayout.vue";
import Chips from "@/components/Chips.vue";
import Field from "@/components/Field.vue";
import ResultGrid from "@/components/ResultGrid.vue";
import Stage from "@/components/Stage.vue";
import { useResults } from "@/composables/useResults";
import { copy } from "@/content/zh";
import { canvasToBlob, drawContainCover, fileToImage, formatBytes, stem } from "@/utils/image";

const state = useResults();
const width = ref(1280);
const height = ref(720);
const fit = ref<"contain" | "cover" | "stretch">("contain");
const fits = [
  { value: "contain", label: copy.ui.fitContain },
  { value: "cover", label: copy.ui.fitCover },
  { value: "stretch", label: copy.ui.fitStretch },
];

async function run(files: File[]) {
  const images = state.imagesOf(files);
  if (!images.length) return;
  state.reset();
  state.busy = true;
  try {
    for (const file of images) {
      const image = await fileToImage(file);
      const canvas =
        fit.value === "stretch"
          ? stretch(image)
          : drawContainCover(image, image.naturalWidth, image.naturalHeight, width.value, height.value, fit.value, "#ffffff");
      const blob = await canvasToBlob(canvas, "image/png");
      state.add(`${stem(file.name)}-${width.value}x${height.value}.png`, blob, `${width.value}×${height.value} · ${formatBytes(blob.size)}`);
    }
  } catch (error) {
    state.error = error instanceof Error ? error.message : copy.failed;
  } finally {
    state.busy = false;
  }
}

function stretch(image: HTMLImageElement) {
  const canvas = document.createElement("canvas");
  canvas.width = width.value;
  canvas.height = height.value;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error(copy.ui.canvas);
  ctx.drawImage(image, 0, 0, width.value, height.value);
  return canvas;
}
</script>
