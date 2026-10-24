<template>
  <BatchLayout :lead="copy.tools.tocircle.lead" :error="state.error">
    <template #settings>
      <Field :label="`${copy.ui.diameter}（${copy.ui.diameterHint}）`">
        <input v-model.number="diameter" class="field-input max-w-xs" type="number" min="0" />
      </Field>
    </template>
    <Stage :compact="state.items.length > 0" :busy="state.busy" @files="run" />
    <ResultGrid
      :items="state.items"
      @clear="state.reset()"
      @remove="state.remove"
      @download="state.download"
      @download-all="state.downloadAll('circle.zip')"
    />
  </BatchLayout>
</template>

<script setup lang="ts">
import { ref } from "vue";
import BatchLayout from "@/components/BatchLayout.vue";
import Field from "@/components/Field.vue";
import ResultGrid from "@/components/ResultGrid.vue";
import Stage from "@/components/Stage.vue";
import { useResults } from "@/composables/useResults";
import { copy } from "@/content";
import { canvasToBlob, fileToImage, formatBytes, stem } from "@/utils/image";

const diameter = ref(0);
const state = useResults();

async function run(files: File[]) {
  const images = state.imagesOf(files);
  if (!images.length) return;
  state.reset();
  state.busy = true;
  try {
    for (const file of images) {
      const image = await fileToImage(file);
      const size = diameter.value > 0 ? diameter.value : Math.min(image.naturalWidth, image.naturalHeight);
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
      state.add(`${stem(file.name)}-circle.png`, blob, `${size}×${size} · ${formatBytes(blob.size)}`);
    }
  } catch (error) {
    state.error = error instanceof Error ? error.message : copy.failed;
  } finally {
    state.busy = false;
  }
}
</script>
