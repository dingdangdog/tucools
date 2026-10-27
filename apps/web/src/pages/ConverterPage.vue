<template>
  <BatchLayout :lead="copy.tools.converter.lead" :error="state.error">
    <template #stage>
      <Stage docked :compact="sources.length > 0" :busy="state.busy" @files="run" />
    </template>
    <template #settings>
      <div>
        <p class="mb-2 text-sm text-muted">{{ copy.ui.targetFormat }}</p>
        <Chips v-model="selected" :options="formats" :label="copy.ui.targetFormat" />
      </div>
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
      @download-all="state.downloadAll('convert.zip')"
    />
  </BatchLayout>
</template>

<script setup lang="ts">
import { onUnmounted, ref } from "vue";
import BatchLayout from "@/components/BatchLayout.vue";
import Chips from "@/components/Chips.vue";
import ResultGrid from "@/components/ResultGrid.vue";
import Stage from "@/components/Stage.vue";
import { useBatchJob } from "@/composables/useBatchJob";
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
const { files: sources, replace, clear: forget, start } = useBatchJob([selected], () => void run());

async function run(incoming?: File[]) {
  if (incoming) {
    const images = state.imagesOf(incoming);
    if (!images.length) return;
    replace(images);
  }
  if (!sources.value.length) return;
  if (!selected.value.length) {
    start();
    state.reset();
    state.error = copy.ui.needFormat;
    state.busy = false;
    return;
  }

  const alive = start();
  const batch = sources.value.slice();
  const targets = selected.value.slice();
  state.busy = true;
  state.error = "";
  try {
    const produced: { name: string; blob: Blob; detail: string }[] = [];
    for (const file of batch) {
      const converted = await convertImageFile(file, targets);
      if (!alive()) return;
      for (const item of converted) {
        const blob = await (await fetch(item.original)).blob();
        if (!alive()) return;
        produced.push({ name: `${item.name}.${item.type}`, blob, detail: formatBytes(blob.size) });
      }
    }
    if (!alive()) return;
    state.reset();
    for (const item of produced) state.add(item.name, item.blob, item.detail);
    if (!state.items.length) state.error = copy.ui.cannotExport;
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
