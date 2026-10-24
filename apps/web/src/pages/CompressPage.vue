<template>
  <BatchLayout :lead="copy.tools.compress.lead" :error="state.error">
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
    </template>
    <Stage :compact="state.items.length > 0" :busy="state.busy" @files="run" />
    <ResultGrid
      :items="state.items"
      @clear="state.reset()"
      @remove="state.remove"
      @download="state.download"
      @download-all="state.downloadAll('compress.zip')"
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
import { compressImage, type CompressFormat } from "@/utils/compress";
import { fileToImage, formatBytes, stem } from "@/utils/image";

const state = useResults();
const format = ref<CompressFormat>("jpeg");
const quality = ref(0.8);
const maxEdge = ref(0);
const targetKb = ref(0);
const formats = [
  { value: "jpeg", label: "JPEG" },
  { value: "png", label: "PNG" },
  { value: "webp", label: "WebP" },
];

async function run(files: File[]) {
  const images = state.imagesOf(files);
  if (!images.length) return;
  state.reset();
  state.busy = true;
  try {
    for (const file of images) {
      const image = await fileToImage(file);
      const result = await compressImage(image, {
        format: format.value,
        quality: quality.value,
        maxEdge: maxEdge.value,
        targetBytes: Math.round(targetKb.value * 1024),
      });
      state.add(
        `${stem(file.name)}.${format.value === "jpeg" ? "jpg" : format.value}`,
        result.blob,
        `${formatBytes(file.size)} → ${formatBytes(result.blob.size)} · ${result.width}×${result.height}`
      );
    }
  } catch (error) {
    state.error = error instanceof Error ? error.message : copy.failed;
  } finally {
    state.busy = false;
  }
}
</script>
