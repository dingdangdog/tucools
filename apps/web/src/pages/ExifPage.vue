<template>
  <BatchLayout :lead="copy.tools.exif.lead" :error="state.error">
    <Stage :compact="Boolean(before || after || state.items.length)" :multiple="false" :busy="state.busy" @files="run" />
    <div v-if="before || after" class="grid gap-3 md:grid-cols-2">
      <section class="panel p-3">
        <h2 class="mb-2 text-sm font-medium">{{ copy.ui.before }}</h2>
        <pre class="max-h-80 overflow-auto whitespace-pre-wrap text-xs">{{ before || copy.ui.noExif }}</pre>
      </section>
      <section class="panel p-3">
        <h2 class="mb-2 text-sm font-medium">{{ copy.ui.after }}</h2>
        <pre class="max-h-80 overflow-auto whitespace-pre-wrap text-xs">{{ after || copy.ui.noExif }}</pre>
      </section>
    </div>
    <ResultGrid
      :items="state.items"
      @clear="clear"
      @remove="state.remove"
      @download="state.download"
      @download-all="state.downloadAll('exif.zip')"
    />
  </BatchLayout>
</template>

<script setup lang="ts">
import { ref } from "vue";
import ExifReader from "exifreader";
import BatchLayout from "@/components/BatchLayout.vue";
import ResultGrid from "@/components/ResultGrid.vue";
import Stage from "@/components/Stage.vue";
import { useResults } from "@/composables/useResults";
import { copy } from "@/content/zh";
import { canvasToBlob, fileToImage, formatBytes, isProcessableImage, stem } from "@/utils/image";

const state = useResults();
const before = ref("");
const after = ref("");

function summarize(tags: Awaited<ReturnType<typeof ExifReader.load>>) {
  const lines = Object.entries(tags)
    .filter(([key]) => !key.startsWith("Thumbnail") && key !== "Images")
    .slice(0, 40)
    .map(([key, value]) => `${key}: ${String((value as { description?: string }).description ?? "")}`);
  return lines.join("\n");
}

async function run(files: File[]) {
  const file = files.find(isProcessableImage);
  if (!file) {
    state.error = copy.noImage;
    return;
  }
  state.reset();
  state.busy = true;
  before.value = "";
  after.value = "";
  try {
    before.value = summarize(await ExifReader.load(file));
    const image = await fileToImage(file);
    const canvas = document.createElement("canvas");
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error(copy.ui.canvas);
    ctx.drawImage(image, 0, 0);
    const blob = await canvasToBlob(canvas, "image/png");
    after.value = summarize(await ExifReader.load(await blob.arrayBuffer()));
    state.add(`${stem(file.name)}-clean.png`, blob, `${canvas.width}×${canvas.height} · ${formatBytes(blob.size)}`);
  } catch (error) {
    state.error = error instanceof Error ? error.message : copy.failed;
  } finally {
    state.busy = false;
  }
}

function clear() {
  state.reset();
  before.value = "";
  after.value = "";
}
</script>
