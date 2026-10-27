<template>
  <BatchLayout :lead="copy.tools.cutting.lead" :error="state.error">
    <template #stage>
      <Stage docked :compact="sources.length > 0" :busy="state.busy" @files="run" />
    </template>
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
      <div v-if="sources.length" class="flex flex-wrap justify-center">
        <button type="button" class="btn btn-primary" :disabled="state.busy" @click="run()">{{ copy.ui.again }}</button>
      </div>
    </template>
    <ResultGrid
      :items="state.items"
      :columns="5"
      @clear="clearAll"
      @remove="state.remove"
      @download="state.download"
      @download-all="state.downloadAll('cutting.zip')"
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
import { autoCutAndMerge, splitImage, type CutMode } from "@/utils/cutting";
import { canvasToBlob, fileToImage, formatBytes, stem } from "@/utils/image";

const state = useResults();
const mode = ref<CutMode | "grid">("vertical");
const action = ref<"split" | "auto">("split");
const pieces = ref(3);
const cols = ref(3);
const { files: sources, replace, clear: forget, start } = useBatchJob([mode, action, pieces, cols], () => void run());
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
      canvas.width = Math.max(1, Math.round(pieceWidth));
      canvas.height = Math.max(1, Math.round(pieceHeight));
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

async function run(incoming?: File[]) {
  if (incoming) {
    const images = state.imagesOf(incoming);
    if (!images.length) return;
    replace(images);
  }
  if (!sources.value.length) return;
  if (action.value === "auto" && mode.value === "grid") {
    start();
    state.reset();
    state.error = copy.ui.gridMergeUnsupported;
    state.busy = false;
    return;
  }
  const count = mode.value === "diagonal-x" ? 4 : wholeNumber(pieces.value, 2, 12);
  const columns = mode.value === "grid" ? wholeNumber(cols.value, 2, 12) : 1;
  if (count == null || columns == null) return;

  const alive = start();
  const batch = sources.value.slice();
  const currentAction = action.value;
  const currentMode = mode.value;
  state.busy = true;
  state.error = "";
  try {
    const loaded = await Promise.all(batch.map((file) => fileToImage(file)));
    if (!alive()) return;
    const produced: { name: string; blob: Blob; detail: string }[] = [];
    if (currentAction === "auto") {
      const cutMode = currentMode === "grid" ? null : currentMode;
      if (!cutMode) throw new Error(copy.ui.gridMergeUnsupported);
      const canvas = autoCutAndMerge(loaded, cutMode, count);
      const blob = await canvasToBlob(canvas, "image/png");
      if (!alive()) return;
      produced.push({ name: "merged.png", blob, detail: `${canvas.width}×${canvas.height} · ${formatBytes(blob.size)}` });
    } else {
      for (let index = 0; index < loaded.length; index += 1) {
        const parts =
          currentMode === "grid" ? gridSplit(loaded[index], count, columns) : splitImage(loaded[index], currentMode, count);
        for (let part = 0; part < parts.length; part += 1) {
          const blob = await canvasToBlob(parts[part], "image/png");
          if (!alive()) return;
          produced.push({
            name: `${stem(batch[index].name)}-${part + 1}.png`,
            blob,
            detail: `${parts[part].width}×${parts[part].height} · ${formatBytes(blob.size)}`,
          });
        }
      }
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

function clearAll() {
  forget();
  state.reset();
  state.busy = false;
}

onUnmounted(clearAll);
</script>
