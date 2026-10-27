<template>
  <BatchLayout :lead="copy.tools.compress.lead" :error="state.error">
    <template #stage>
      <Stage docked :compact="sources.length > 0" :busy="state.busy" @files="run" />
    </template>
    <template #settings>
      <div>
        <p class="mb-2 text-sm text-muted">{{ copy.ui.format }}</p>
        <Chips v-model="format" :options="formats" :label="copy.ui.format" />
      </div>
      <div class="grid gap-3 sm:grid-cols-3">
        <Field :label="`${copy.ui.quality} ${Math.round(quality * 100)}%`">
          <input v-model.number="quality" class="range" type="range" min="0.1" max="1" step="0.01" :disabled="format === 'png'" />
        </Field>
        <Field :label="`${copy.ui.maxEdge}（${copy.ui.maxEdgeHint}）`">
          <input v-model.number="maxEdge" class="field-input" type="number" min="0" step="1" />
        </Field>
        <Field :label="`${copy.ui.targetKb}（${copy.ui.targetKbHint}）`">
          <input v-model.number="targetKb" class="field-input" type="number" min="0" step="1" />
        </Field>
      </div>
      <p v-if="format === 'png'" class="text-sm text-muted">{{ copy.ui.pngNote }}</p>
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
      @download-all="state.downloadAll('compress.zip')"
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
import { compressImage, type CompressFormat } from "@/utils/compress";
import { fileToImage, formatBytes, stem } from "@/utils/image";

const state = useResults();
const format = ref<CompressFormat>("jpeg");
const quality = ref(0.8);
const maxEdge = ref(0);
const targetKb = ref(0);
const { files: sources, replace, clear: forget, start } = useBatchJob(
  [format, quality, maxEdge, targetKb],
  () => void run()
);
const formats = [
  { value: "jpeg", label: "JPEG" },
  { value: "png", label: "PNG" },
  { value: "webp", label: "WebP" },
];

async function run(incoming?: File[]) {
  if (incoming) {
    const images = state.imagesOf(incoming);
    if (!images.length) return;
    replace(images);
  }
  if (!sources.value.length) return;
  const edge = wholeNumber(maxEdge.value, 0, 16000);
  const kilobytes = wholeNumber(targetKb.value, 0, 102400);
  if (edge == null || kilobytes == null || !Number.isFinite(quality.value)) return;

  const alive = start();
  const batch = sources.value.slice();
  const currentFormat = format.value;
  const currentQuality = quality.value;
  state.busy = true;
  state.error = "";
  try {
    const produced: { name: string; blob: Blob; detail: string }[] = [];
    for (const file of batch) {
      const image = await fileToImage(file);
      if (!alive()) return;
      const result = await compressImage(image, {
        format: currentFormat,
        quality: currentQuality,
        maxEdge: edge,
        targetBytes: Math.round(kilobytes * 1024),
      });
      if (!alive()) return;
      produced.push({
        name: `${stem(file.name)}.${currentFormat === "jpeg" ? "jpg" : currentFormat}`,
        blob: result.blob,
        detail: `${formatBytes(file.size)} → ${formatBytes(result.blob.size)} · ${result.width}×${result.height}`,
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

function clearAll() {
  forget();
  state.reset();
  state.busy = false;
}

onUnmounted(clearAll);
</script>
