<template>
  <BatchLayout :lead="copy.tools.cutting.lead" :error="state.error">
    <template #settings>
      <div>
        <p class="mb-2 text-sm text-muted">{{ copy.ui.cutAction }}</p>
        <Chips v-model="action" :options="actions" :label="copy.ui.cutAction" />
      </div>
      <div>
        <p class="mb-2 text-sm text-muted">{{ copy.ui.cutWay }}</p>
        <Chips v-model="mode" :options="modes" :label="copy.ui.cutWay" />
      </div>
      <div class="grid gap-3 sm:grid-cols-2">
        <Field :label="mode === 'grid' ? copy.ui.rowCount : copy.ui.pieceCount">
          <input v-model.number="pieces" class="field-input" type="number" min="2" max="12" :disabled="mode === 'diagonal-x'" />
        </Field>
        <Field v-if="mode === 'grid'" :label="copy.ui.colCount">
          <input v-model.number="cols" class="field-input" type="number" min="2" max="12" />
        </Field>
      </div>
    </template>
    <Stage :compact="state.items.length > 0" :busy="state.busy" @files="run" />
    <ResultGrid
      :items="state.items"
      @clear="state.reset()"
      @remove="state.remove"
      @download="state.download"
      @download-all="state.downloadAll('cutting.zip')"
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
import { autoCutAndMerge, splitImage, type CutMode } from "@/utils/cutting";
import { canvasToBlob, fileToImage, formatBytes, stem } from "@/utils/image";

const state = useResults();
const mode = ref<CutMode | "grid">("vertical");
const action = ref<"split" | "auto">("split");
const pieces = ref(3);
const cols = ref(3);
const actions = [
  { value: "split", label: copy.ui.cut.split },
  { value: "auto", label: copy.ui.cut.auto },
];
const modes = [
  { value: "vertical", label: copy.ui.cut.vertical },
  { value: "horizontal", label: copy.ui.cut.horizontal },
  { value: "diagonal-left", label: copy.ui.cut.diagonalLeft },
  { value: "diagonal-right", label: copy.ui.cut.diagonalRight },
  { value: "diagonal-x", label: copy.ui.cut.diagonalX },
  { value: "grid", label: copy.ui.cut.grid },
];

function gridSplit(image: HTMLImageElement, rows: number, columns: number) {
  const pieceWidth = image.naturalWidth / columns;
  const pieceHeight = image.naturalHeight / rows;
  const result: HTMLCanvasElement[] = [];
  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < columns; col += 1) {
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(pieceWidth);
      canvas.height = Math.round(pieceHeight);
      const ctx = canvas.getContext("2d");
      if (!ctx) continue;
      ctx.drawImage(
        image,
        col * pieceWidth,
        row * pieceHeight,
        pieceWidth,
        pieceHeight,
        0,
        0,
        canvas.width,
        canvas.height
      );
      result.push(canvas);
    }
  }
  return result;
}

async function run(files: File[]) {
  const images = state.imagesOf(files);
  if (!images.length) return;
  if (action.value === "auto" && mode.value === "grid") {
    state.error = copy.ui.gridMergeUnsupported;
    return;
  }
  state.reset();
  state.busy = true;
  try {
    const loaded = await Promise.all(images.map((file) => fileToImage(file)));
    if (action.value === "auto") {
      const cutMode = mode.value === "grid" ? null : mode.value;
      if (!cutMode) throw new Error(copy.ui.gridMergeUnsupported);
      const canvas = autoCutAndMerge(loaded, cutMode, pieces.value);
      const blob = await canvasToBlob(canvas, "image/png");
      state.add("merged.png", blob, `${canvas.width}×${canvas.height} · ${formatBytes(blob.size)}`);
      return;
    }
    for (let index = 0; index < loaded.length; index += 1) {
      const parts =
        mode.value === "grid"
          ? gridSplit(loaded[index], pieces.value, cols.value)
          : splitImage(loaded[index], mode.value, pieces.value);
      for (let part = 0; part < parts.length; part += 1) {
        const blob = await canvasToBlob(parts[part], "image/png");
        state.add(
          `${stem(images[index].name)}-${part + 1}.png`,
          blob,
          `${parts[part].width}×${parts[part].height} · ${formatBytes(blob.size)}`
        );
      }
    }
  } catch (error) {
    state.error = error instanceof Error ? error.message : copy.failed;
  } finally {
    state.busy = false;
  }
}
</script>
