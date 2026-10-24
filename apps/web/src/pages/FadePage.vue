<template>
  <BatchLayout :lead="copy.tools.fade.lead" :error="state.error">
    <Stage :compact="state.items.length > 0" :busy="state.busy" @files="run" />
    <ResultGrid
      :items="state.items"
      @clear="state.reset()"
      @remove="state.remove"
      @download="state.download"
      @download-all="state.downloadAll('gray.zip')"
    />
  </BatchLayout>
</template>

<script setup lang="ts">
import BatchLayout from "@/components/BatchLayout.vue";
import ResultGrid from "@/components/ResultGrid.vue";
import Stage from "@/components/Stage.vue";
import { useResults } from "@/composables/useResults";
import { copy } from "@/content";
import { canvasToBlob, fileToImage, formatBytes, stem } from "@/utils/image";

const state = useResults();

async function run(files: File[]) {
  const images = state.imagesOf(files);
  if (!images.length) return;
  state.reset();
  state.busy = true;
  try {
    for (const file of images) {
      const image = await fileToImage(file);
      const canvas = document.createElement("canvas");
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error(copy.ui.canvas);
      ctx.drawImage(image, 0, 0);
      const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < pixels.data.length; i += 4) {
        const gray = pixels.data[i] * 0.299 + pixels.data[i + 1] * 0.587 + pixels.data[i + 2] * 0.114;
        pixels.data[i] = gray;
        pixels.data[i + 1] = gray;
        pixels.data[i + 2] = gray;
      }
      ctx.putImageData(pixels, 0, 0);
      const blob = await canvasToBlob(canvas, "image/png");
      state.add(`${stem(file.name)}-gray.png`, blob, `${canvas.width}×${canvas.height} · ${formatBytes(blob.size)}`);
    }
  } catch (error) {
    state.error = error instanceof Error ? error.message : copy.failed;
  } finally {
    state.busy = false;
  }
}
</script>
