<template>
  <StudioLayout :lead="lead">
    <Stage :filled="Boolean(previewUrl)" :multiple="false" :busy="rendering" @files="open">
      <div class="flex h-full w-full items-center justify-center p-4">
        <img v-if="previewUrl" :src="previewUrl" :alt="fileName" class="max-h-full max-w-full object-contain" />
      </div>
      <FileBadge v-if="fileName" :name="fileName" :detail="`${copy.ui.output} ${current.width}×${current.height}`" />
    </Stage>
    <template #panel>
      <div>
        <p class="mb-2 text-sm text-muted">{{ copy.ui.preset }}</p>
        <Chips v-model="presetId" :options="options" :label="copy.ui.preset" />
      </div>
      <div v-if="kind === 'id'">
        <p class="mb-2 text-sm text-muted">{{ copy.ui.background }}</p>
        <div class="flex flex-wrap gap-2" role="group" :aria-label="copy.ui.background">
          <button
            v-for="item in idBackgrounds"
            :key="item.id"
            type="button"
            class="chip"
            :aria-pressed="background === item.value"
            @click="background = item.value"
          >
            <span class="mr-1 inline-block h-3 w-3 rounded-full border border-line" :style="{ background: item.value }" />
            {{ item.label }}
          </button>
        </div>
      </div>
      <p class="text-sm text-muted">{{ copy.ui.output }} {{ current.width }}×{{ current.height }}</p>
      <p v-if="error" class="text-sm text-danger" role="alert">{{ error }}</p>
    </template>
    <template #actions>
      <button type="button" class="btn btn-primary" :disabled="!previewBlob" @click="exportPng">{{ copy.ui.exportPng }}</button>
      <button type="button" class="btn" :disabled="!image" @click="clear">{{ copy.ui.replace }}</button>
    </template>
  </StudioLayout>
</template>

<script setup lang="ts">
import { computed, onUnmounted, ref, watch } from "vue";
import Chips from "@/components/Chips.vue";
import FileBadge from "@/components/FileBadge.vue";
import Stage from "@/components/Stage.vue";
import StudioLayout from "@/components/StudioLayout.vue";
import { copy } from "@/content/zh";
import { canvasToBlob, drawContainCover, fileToImage, isProcessableImage, stem } from "@/utils/image";
import { idBackgrounds, idPhotoPresets, sizePresets } from "@/utils/presets";
import { saveOrDownload } from "@/utils/save";

const props = defineProps<{ kind: "id" | "social" }>();
const presets = computed(() => (props.kind === "id" ? idPhotoPresets : sizePresets));
const options = computed(() => presets.value.map((item) => ({ value: item.id, label: item.label })));
const presetId = ref(presets.value[0].id);
const background = ref("#ffffff");
const current = computed(() => presets.value.find((item) => item.id === presetId.value) ?? presets.value[0]);
const lead = computed(() => (props.kind === "id" ? copy.tools.idPhoto.lead : copy.tools.sizes.lead));
const image = ref<HTMLImageElement | null>(null);
const fileName = ref("");
const previewUrl = ref("");
const previewBlob = ref<Blob | null>(null);
const rendering = ref(false);
const error = ref("");
let ticket = 0;

async function render() {
  const source = image.value;
  if (!source) return;
  const currentTicket = ++ticket;
  rendering.value = true;
  try {
    const canvas = drawContainCover(
      source,
      source.naturalWidth,
      source.naturalHeight,
      current.value.width,
      current.value.height,
      "cover",
      props.kind === "id" ? background.value : "#ffffff"
    );
    const blob = await canvasToBlob(canvas, "image/png");
    if (currentTicket !== ticket) return;
    if (previewUrl.value) URL.revokeObjectURL(previewUrl.value);
    previewUrl.value = URL.createObjectURL(blob);
    previewBlob.value = blob;
  } catch (reason) {
    if (currentTicket === ticket) error.value = reason instanceof Error ? reason.message : copy.failed;
  } finally {
    if (currentTicket === ticket) rendering.value = false;
  }
}

async function open(files: File[]) {
  const file = files.find(isProcessableImage);
  if (!file) {
    error.value = copy.noImage;
    return;
  }
  error.value = "";
  fileName.value = file.name;
  image.value = await fileToImage(file);
  await render();
}

watch([presetId, background], () => {
  if (image.value) void render();
});

async function exportPng() {
  if (!previewBlob.value) return;
  await saveOrDownload(previewBlob.value, `${stem(fileName.value)}-${current.value.id}.png`);
}

function clear() {
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value);
  previewUrl.value = "";
  previewBlob.value = null;
  image.value = null;
  fileName.value = "";
  ticket += 1;
}

onUnmounted(clear);
</script>
