<template>
  <BatchLayout :lead="copy.tools.pix.lead" :error="error">
    <template #actions>
      <button v-if="text" type="button" class="btn" @click="downloadJson">{{ copy.ui.exportJson }}</button>
    </template>
    <template #stage>
      <Stage :compact="Boolean(previewUrl)" :multiple="false" @files="run" />
    </template>
    <div v-if="previewUrl" class="grid items-start gap-3 xl:grid-cols-2">
      <figure class="panel min-w-0 overflow-hidden">
        <div class="checker flex min-h-64 items-center justify-center">
          <img :src="previewUrl" :alt="filename" class="max-h-[32rem] max-w-full object-contain" />
        </div>
        <figcaption class="truncate px-4 py-3 text-sm font-medium">{{ filename }}</figcaption>
      </figure>
      <pre v-if="text" class="panel max-h-[70vh] min-h-64 min-w-0 overflow-auto whitespace-pre-wrap break-words p-4 text-xs leading-5">{{ text }}</pre>
    </div>
  </BatchLayout>
</template>

<script setup lang="ts">
import { onUnmounted, ref } from "vue";
import ExifReader from "exifreader";
import BatchLayout from "@/components/BatchLayout.vue";
import Stage from "@/components/Stage.vue";
import { copy } from "@/content";
import { isProcessableImage, stem } from "@/utils/image";
import { saveOrDownload } from "@/utils/save";

const text = ref("");
const error = ref("");
const filename = ref("image");
const previewUrl = ref("");

function releasePreview() {
  if (!previewUrl.value) return;
  URL.revokeObjectURL(previewUrl.value);
  previewUrl.value = "";
}

onUnmounted(releasePreview);

async function run(files: File[]) {
  const file = files.find(isProcessableImage);
  if (!file) {
    error.value = copy.noImage;
    return;
  }
  error.value = "";
  filename.value = file.name;
  releasePreview();
  previewUrl.value = URL.createObjectURL(file);
  try {
    const tags = await ExifReader.load(file, { expanded: true });
    text.value = JSON.stringify(tags, null, 2);
  } catch (reason) {
    text.value = "";
    error.value = reason instanceof Error ? reason.message : copy.failed;
  }
}

function downloadJson() {
  void saveOrDownload(new Blob([text.value], { type: "application/json" }), `${stem(filename.value)}-exif.json`);
}
</script>
