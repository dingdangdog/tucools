<template>
  <BatchLayout :lead="copy.tools.exif.lead" :error="state.error">
    <template #stage>
      <Stage :compact="Boolean(originalUrl)" :multiple="false" :busy="state.busy" @files="run" />
    </template>
    <div v-if="originalUrl" class="flex flex-col gap-3">
      <div>
        <button type="button" class="btn" @click="clear">{{ copy.clear }}</button>
      </div>
      <div class="grid items-start gap-3 xl:grid-cols-3">
        <section class="panel flex min-w-0 flex-col p-4">
          <h2 class="text-sm font-medium">{{ copy.ui.original }}</h2>
          <div class="checker mt-3 flex aspect-[4/3] items-center justify-center overflow-hidden rounded-xl">
            <img :src="originalUrl" :alt="originalName" class="max-h-full max-w-full object-contain" />
          </div>
          <p class="mt-3 truncate text-sm">{{ originalName }}</p>
          <p v-if="originalDetail" class="truncate text-xs text-muted">{{ originalDetail }}</p>
        </section>
        <section class="panel flex min-w-0 flex-col p-4">
          <div class="flex items-center justify-between gap-3">
            <h2 class="text-sm font-medium">{{ copy.ui.result }}</h2>
            <button v-if="result" type="button" class="btn shrink-0" @click="state.download(result)">{{ copy.download }}</button>
          </div>
          <div class="checker mt-3 flex aspect-[4/3] items-center justify-center overflow-hidden rounded-xl">
            <img v-if="result" :src="result.url" :alt="result.name" class="max-h-full max-w-full object-contain" />
            <span v-else class="text-sm text-muted">{{ copy.processing }}</span>
          </div>
          <p v-if="result" class="mt-3 truncate text-sm">{{ result.name }}</p>
          <p v-if="result?.detail" class="truncate text-xs text-muted">{{ result.detail }}</p>
        </section>
        <section class="panel flex min-w-0 flex-col gap-4 p-4">
          <div class="min-w-0">
            <h2 class="text-sm font-medium">{{ copy.ui.before }}</h2>
            <pre class="mt-2 max-h-64 overflow-auto whitespace-pre-wrap break-words text-xs leading-5">{{ before || copy.ui.noExif }}</pre>
          </div>
          <div class="min-w-0">
            <h2 class="text-sm font-medium">{{ copy.ui.after }}</h2>
            <pre class="mt-2 max-h-64 overflow-auto whitespace-pre-wrap break-words text-xs leading-5">{{ after || copy.ui.noExif }}</pre>
          </div>
        </section>
      </div>
    </div>
  </BatchLayout>
</template>

<script setup lang="ts">
import { computed, onUnmounted, ref } from "vue";
import ExifReader from "exifreader";
import BatchLayout from "@/components/BatchLayout.vue";
import Stage from "@/components/Stage.vue";
import { useResults } from "@/composables/useResults";
import { copy } from "@/content";
import { canvasToBlob, fileToImage, formatBytes, isProcessableImage, stem } from "@/utils/image";

const state = useResults();
const before = ref("");
const after = ref("");
const originalUrl = ref("");
const originalName = ref("");
const originalDetail = ref("");
const result = computed(() => state.items[0]);

function releaseOriginal() {
  if (!originalUrl.value) return;
  URL.revokeObjectURL(originalUrl.value);
  originalUrl.value = "";
  originalName.value = "";
  originalDetail.value = "";
}

function clear() {
  releaseOriginal();
  state.reset();
  before.value = "";
  after.value = "";
}

onUnmounted(() => {
  releaseOriginal();
  state.reset();
});

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
  clear();
  state.busy = true;
  originalName.value = file.name;
  originalDetail.value = formatBytes(file.size);
  originalUrl.value = URL.createObjectURL(file);
  try {
    before.value = summarize(await ExifReader.load(file));
    const image = await fileToImage(file);
    originalDetail.value = `${image.naturalWidth}×${image.naturalHeight} · ${formatBytes(file.size)}`;
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
</script>
