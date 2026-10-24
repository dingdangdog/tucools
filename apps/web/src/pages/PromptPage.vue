<template>
  <BatchLayout :lead="copy.tools.prompt.lead" :error="error">
    <template #actions>
      <button v-if="rows.length" type="button" class="btn" @click="exportJson">{{ copy.ui.exportJson }}</button>
    </template>
    <Stage :compact="rows.length > 0" @files="run" />
    <ul v-if="rows.length" class="flex flex-col gap-3">
      <li v-for="row in rows" :key="row.name" class="panel p-3">
        <p class="text-sm font-medium">{{ row.name }}</p>
        <pre class="mt-2 whitespace-pre-wrap text-sm">{{ row.text || copy.ui.noPrompt }}</pre>
      </li>
    </ul>
  </BatchLayout>
</template>

<script setup lang="ts">
import { ref } from "vue";
import BatchLayout from "@/components/BatchLayout.vue";
import Stage from "@/components/Stage.vue";
import { copy } from "@/content/zh";
import { isProcessableImage } from "@/utils/image";
import { readEmbeddedPrompt } from "@/utils/prompt";
import { saveOrDownload } from "@/utils/save";

const rows = ref<{ name: string; text: string }[]>([]);
const error = ref("");

async function run(files: File[]) {
  const images = files.filter(isProcessableImage);
  if (!images.length) {
    error.value = copy.noImage;
    return;
  }
  error.value = "";
  rows.value = [];
  for (const file of images) {
    rows.value.push({ name: file.name, text: await readEmbeddedPrompt(file) });
  }
}

function exportJson() {
  void saveOrDownload(new Blob([JSON.stringify(rows.value, null, 2)], { type: "application/json" }), "prompts.json");
}
</script>
