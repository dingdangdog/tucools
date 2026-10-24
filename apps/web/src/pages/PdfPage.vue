<template>
  <BatchLayout :lead="copy.tools.pdf.lead" :error="error">
    <template #actions>
      <button v-if="names.length" type="button" class="btn btn-primary" :disabled="busy" @click="build">{{ copy.ui.buildPdf }}</button>
      <button v-if="names.length" type="button" class="btn" :disabled="busy" @click="clear">{{ copy.ui.replaceFiles }}</button>
    </template>
    <Stage :filled="names.length > 0" :busy="busy" :progress="copy.processing" @files="remember">
      <div class="flex h-full flex-col justify-center gap-2 p-6">
        <p class="text-sm">{{ copy.ui.selected }} {{ names.length }} {{ copy.ui.sheets }}</p>
        <ul class="max-h-64 overflow-auto text-sm text-muted">
          <li v-for="name in names" :key="name" class="truncate">{{ name }}</li>
        </ul>
      </div>
    </Stage>
  </BatchLayout>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { PDFDocument } from "pdf-lib";
import BatchLayout from "@/components/BatchLayout.vue";
import Stage from "@/components/Stage.vue";
import { copy } from "@/content/zh";
import { canvasToBlob, fileToImage, isProcessableImage } from "@/utils/image";
import { saveOrDownload } from "@/utils/save";

const files = ref<File[]>([]);
const names = ref<string[]>([]);
const error = ref("");
const busy = ref(false);

function remember(incoming: File[]) {
  const images = incoming.filter(isProcessableImage);
  if (!images.length) {
    error.value = copy.noImage;
    return;
  }
  error.value = "";
  files.value = images;
  names.value = images.map((file) => file.name);
}

function clear() {
  files.value = [];
  names.value = [];
  error.value = "";
}

async function build() {
  error.value = "";
  busy.value = true;
  try {
    const pdf = await PDFDocument.create();
    for (const file of files.value) {
      const image = await fileToImage(file);
      const canvas = document.createElement("canvas");
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error(copy.ui.canvas);
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(image, 0, 0);
      const jpeg = await canvasToBlob(canvas, "image/jpeg", 0.92);
      const embedded = await pdf.embedJpg(new Uint8Array(await jpeg.arrayBuffer()));
      const page = pdf.addPage([embedded.width, embedded.height]);
      page.drawImage(embedded, { x: 0, y: 0, width: embedded.width, height: embedded.height });
    }
    const bytes = await pdf.save();
    await saveOrDownload(new Blob([new Uint8Array(bytes)], { type: "application/pdf" }), "images.pdf");
  } catch (reason) {
    error.value = reason instanceof Error ? reason.message : copy.failed;
  } finally {
    busy.value = false;
  }
}
</script>
