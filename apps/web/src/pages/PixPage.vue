<template>
  <BatchLayout :lead="copy.tools.pix.lead" :error="error">
    <template #actions>
      <button v-if="text" type="button" class="btn" @click="downloadJson">{{ copy.ui.exportJson }}</button>
    </template>
    <template #stage>
      <Stage :compact="Boolean(text)" :multiple="false" @files="run" />
    </template>
    <pre v-if="text" class="panel max-h-[70vh] overflow-auto whitespace-pre-wrap p-3 text-xs">{{ text }}</pre>
  </BatchLayout>
</template>

<script setup lang="ts">
import { ref } from "vue";
import ExifReader from "exifreader";
import BatchLayout from "@/components/BatchLayout.vue";
import Stage from "@/components/Stage.vue";
import { copy } from "@/content";
import { isProcessableImage, stem } from "@/utils/image";
import { saveOrDownload } from "@/utils/save";

const text = ref("");
const error = ref("");
const filename = ref("image");

async function run(files: File[]) {
  const file = files.find(isProcessableImage);
  if (!file) {
    error.value = copy.noImage;
    return;
  }
  error.value = "";
  filename.value = stem(file.name);
  try {
    const tags = await ExifReader.load(file, { expanded: true });
    text.value = JSON.stringify(tags, null, 2);
  } catch (reason) {
    text.value = "";
    error.value = reason instanceof Error ? reason.message : copy.failed;
  }
}

function downloadJson() {
  void saveOrDownload(new Blob([text.value], { type: "application/json" }), `${filename.value}-exif.json`);
}
</script>
