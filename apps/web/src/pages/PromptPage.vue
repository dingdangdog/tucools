<template>
  <BatchLayout :lead="copy.tools.prompt.lead" :error="error">
    <template #actions>
      <button v-if="rows.length" type="button" class="btn" @click="exportJson">{{ copy.ui.exportJson }}</button>
    </template>
    <template #stage>
      <Stage :compact="rows.length > 0" @files="run" />
    </template>
    <ul v-if="rows.length" class="flex flex-col gap-3">
      <li v-for="row in rows" :key="row.url" class="panel grid gap-4 p-4 xl:grid-cols-2">
        <figure class="min-w-0 self-start">
          <div class="checker flex min-h-52 items-center justify-center overflow-hidden rounded-xl">
            <img :src="row.url" :alt="row.name" class="max-h-80 max-w-full object-contain" />
          </div>
          <figcaption class="mt-3 truncate text-sm font-medium">{{ row.name }}</figcaption>
        </figure>
        <pre class="max-h-[32rem] min-h-24 min-w-0 overflow-auto whitespace-pre-wrap break-words rounded-xl bg-[var(--bg)] p-4 text-sm leading-6 xl:h-full">{{ row.text || copy.ui.noPrompt }}</pre>
      </li>
    </ul>
  </BatchLayout>
</template>

<script setup lang="ts">
import { onUnmounted, ref } from "vue";
import BatchLayout from "@/components/BatchLayout.vue";
import Stage from "@/components/Stage.vue";
import { copy } from "@/content";
import { isProcessableImage } from "@/utils/image";
import { readEmbeddedPrompt } from "@/utils/prompt";
import { saveOrDownload } from "@/utils/save";

type PromptRow = { name: string; text: string; url: string };

const rows = ref<PromptRow[]>([]);
const error = ref("");

function releaseRows() {
  for (const row of rows.value) URL.revokeObjectURL(row.url);
  rows.value = [];
}

onUnmounted(releaseRows);

async function run(files: File[]) {
  const images = files.filter(isProcessableImage);
  if (!images.length) {
    error.value = copy.noImage;
    return;
  }
  error.value = "";
  releaseRows();
  const next: PromptRow[] = [];
  for (const file of images) {
    next.push({
      name: file.name,
      text: await readEmbeddedPrompt(file),
      url: URL.createObjectURL(file),
    });
  }
  rows.value = next;
}

function exportJson() {
  const payload = rows.value.map(({ name, text }) => ({ name, text }));
  void saveOrDownload(new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" }), "prompts.json");
}
</script>
