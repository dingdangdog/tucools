<template>
  <BatchLayout :lead="copy.tools.tocircle.lead" :error="state.error">
    <template #stage>
      <Stage docked :compact="sources.length > 0" :busy="state.busy" @files="run" />
    </template>
    <template #settings>
      <Field :label="`${copy.ui.diameter}（${copy.ui.diameterHint}）`">
        <input v-model.number="diameter" class="field-input max-w-xs" type="number" min="0" />
      </Field>
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
      @download-all="state.downloadAll('circle.zip')"
    />
  </BatchLayout>
</template>

<script setup lang="ts">
import { onUnmounted, ref } from "vue";
import BatchLayout from "@/components/BatchLayout.vue";
import Field from "@/components/Field.vue";
import ResultGrid from "@/components/ResultGrid.vue";
import Stage from "@/components/Stage.vue";
import { useBatchJob, wholeNumber } from "@/composables/useBatchJob";
import { useResults } from "@/composables/useResults";
import { copy } from "@/content";
import { canvasToBlob, fileToImage, formatBytes, stem } from "@/utils/image";

const diameter = ref(0);
const state = useResults();
const { files: sources, replace, clear: forget, start } = useBatchJob([diameter], () => void run());

async function run(incoming?: File[]) {
  if (incoming) {
    const images = state.imagesOf(incoming);
    if (!images.length) return;
    replace(images);
  }
  if (!sources.value.length) return;
  const requested = wholeNumber(diameter.value, 0, 16000);
  if (requested == null) return;

  const alive = start();
  const batch = sources.value.slice();
  state.busy = true;
  state.error = "";
  try {
    const produced: { name: string; blob: Blob; detail: string }[] = [];
    for (const file of batch) {
      const image = await fileToImage(file);
      if (!alive()) return;
      const size = requested > 0 ? requested : Math.min(image.naturalWidth, image.naturalHeight);
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error(copy.ui.canvas);
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      const scale = Math.max(size / image.naturalWidth, size / image.naturalHeight);
      const width = image.naturalWidth * scale;
      const height = image.naturalHeight * scale;
      ctx.drawImage(image, (size - width) / 2, (size - height) / 2, width, height);
      const blob = await canvasToBlob(canvas, "image/png");
      if (!alive()) return;
      produced.push({
        name: `${stem(file.name)}-circle.png`,
        blob,
        detail: `${size}×${size} · ${formatBytes(blob.size)}`,
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
