<template>
  <BatchLayout :lead="copy.tools.converter.lead" :error="state.error">
    <template #stage>
      <Stage docked :compact="state.items.length > 0" :busy="state.busy" @files="run" />
    </template>
    <template #settings>
      <div>
        <p class="mb-2 text-sm text-muted">{{ copy.ui.targetFormat }}</p>
        <Chips v-model="selected" :options="formats" :label="copy.ui.targetFormat" />
      </div>
    </template>
    <ResultGrid
      :items="state.items"
      @clear="state.reset()"
      @remove="state.remove"
      @download="state.download"
      @download-all="state.downloadAll('convert.zip')"
    />
  </BatchLayout>
</template>

<script setup lang="ts">
import { ref } from "vue";
import BatchLayout from "@/components/BatchLayout.vue";
import Chips from "@/components/Chips.vue";
import ResultGrid from "@/components/ResultGrid.vue";
import Stage from "@/components/Stage.vue";
import { useResults } from "@/composables/useResults";
import { copy } from "@/content";
import { convertImageFile } from "@/utils/convert-image";
import { formatBytes } from "@/utils/image";

const formats = [
  { value: "png", label: "PNG" },
  { value: "jpg", label: "JPEG" },
  { value: "webp", label: "WebP" },
  { value: "bmp", label: "BMP" },
  { value: "ico", label: "ICO" },
];
const selected = ref<string[]>(["png"]);
const state = useResults();

async function run(files: File[]) {
  const images = state.imagesOf(files);
  if (!images.length || !selected.value.length) {
    if (!selected.value.length) state.error = copy.ui.needFormat;
    return;
  }
  state.reset();
  state.busy = true;
  try {
    for (const file of images) {
      const converted = await convertImageFile(file, selected.value);
      for (const item of converted) {
        const blob = await (await fetch(item.original)).blob();
        state.add(`${item.name}.${item.type}`, blob, formatBytes(blob.size));
      }
    }
    if (!state.items.length) state.error = copy.ui.cannotExport;
  } catch (error) {
    state.error = error instanceof Error ? error.message : copy.failed;
  } finally {
    state.busy = false;
  }
}
</script>
