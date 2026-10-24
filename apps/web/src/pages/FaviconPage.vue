<template>
  <BatchLayout :lead="copy.tools.favicon.lead" :error="state.error">
    <Stage :compact="state.items.length > 0" :multiple="false" :busy="state.busy" @files="run" />
    <ResultGrid
      :items="state.items"
      @clear="state.reset()"
      @remove="state.remove"
      @download="state.download"
      @download-all="state.downloadAll(zipName)"
    />
  </BatchLayout>
</template>

<script setup lang="ts">
import { ref } from "vue";
import BatchLayout from "@/components/BatchLayout.vue";
import ResultGrid from "@/components/ResultGrid.vue";
import Stage from "@/components/Stage.vue";
import { useResults } from "@/composables/useResults";
import { copy } from "@/content/zh";
import { canvasToIcoBlob } from "@/utils/ico";
import { canvasToBlob, drawContainCover, fileToImage, formatBytes, isProcessableImage, stem } from "@/utils/image";

const state = useResults();
const zipName = ref("favicon.zip");
const sizes = [16, 32, 48, 180];

async function run(files: File[]) {
  const file = files.find(isProcessableImage);
  if (!file) {
    state.error = copy.noImage;
    return;
  }
  state.reset();
  state.busy = true;
  try {
    const image = await fileToImage(file);
    const source = document.createElement("canvas");
    source.width = image.naturalWidth;
    source.height = image.naturalHeight;
    source.getContext("2d")?.drawImage(image, 0, 0);
    zipName.value = `${stem(file.name)}-favicon.zip`;
    for (const size of sizes) {
      const canvas = drawContainCover(image, image.naturalWidth, image.naturalHeight, size, size, "cover", "rgba(0,0,0,0)");
      const blob = await canvasToBlob(canvas, "image/png");
      state.add(`favicon-${size}.png`, blob, `${size}×${size} · ${formatBytes(blob.size)}`);
    }
    const ico = await canvasToIcoBlob(source);
    state.add("favicon.ico", ico, formatBytes(ico.size));
  } catch (reason) {
    state.error = reason instanceof Error ? reason.message : copy.failed;
  } finally {
    state.busy = false;
  }
}
</script>
