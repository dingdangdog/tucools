<template>
  <BatchLayout :lead="copy.tools.pdf.lead" :error="error">
    <template #actions>
      <button v-if="pages.length" type="button" class="btn btn-primary" :disabled="busy" @click="build">{{ copy.ui.buildPdf }}</button>
      <button v-if="pages.length" type="button" class="btn" :disabled="busy" @click="clear">{{ copy.clear }}</button>
    </template>
    <template #stage>
      <Stage
        ref="stageRef"
        share
        :filled="pages.length > 0"
        :busy="busy"
        :progress="copy.processing"
        @files="addFiles"
      >
        <div class="pdf-desk" @dragover="onDeskDragOver" @drop="onDeskDrop">
          <div class="pdf-preview flex min-h-0 min-w-0 flex-1 flex-col">
            <div ref="previewBox" class="flex min-h-0 flex-1 items-center justify-center overflow-hidden p-4">
              <canvas ref="previewCanvas" class="pdf-sheet" role="img" :aria-label="copy.ui.pdf.preview" />
            </div>
            <div class="flex shrink-0 flex-wrap items-center justify-center gap-2 px-3 pb-3">
              <p class="w-full text-center text-sm tabular-nums text-muted">
                {{ selected + 1 }} / {{ pages.length }}
                <template v-if="pageWidthMm && pageHeightMm"> · {{ pageWidthMm }} × {{ pageHeightMm }} mm</template>
              </p>
              <button type="button" class="btn" :disabled="busy" @click="rotate(-1)">{{ copy.ui.rotateLeft }}</button>
              <button type="button" class="btn" :disabled="busy" @click="rotate(1)">{{ copy.ui.rotateRight }}</button>
              <button type="button" class="btn" :disabled="busy || selected === 0" @click="move(selected, selected - 1)">
                {{ copy.ui.pdf.moveEarlier }}
              </button>
              <button type="button" class="btn" :disabled="busy || selected >= pages.length - 1" @click="move(selected, selected + 1)">
                {{ copy.ui.pdf.moveLater }}
              </button>
              <button type="button" class="btn" :disabled="busy" @click="removeCurrent">{{ copy.ui.remove }}</button>
            </div>
          </div>
          <div class="pdf-rail" role="group" :aria-label="copy.ui.pdf.pages">
            <button
              v-for="(page, index) in pages"
              :key="page.id"
              :ref="(element) => setThumbRef(element, index)"
              type="button"
              class="pdf-thumb"
              :class="{
                'is-current': index === selected,
                'is-target': dragOverIndex === index && draggingIndex !== index,
                'is-dragging': draggingIndex === index,
              }"
              :aria-current="index === selected ? 'page' : undefined"
              draggable="true"
              @click="selected = index"
              @dragstart="onDragStart($event, index)"
              @dragover="onThumbDragOver($event, index)"
              @drop="onThumbDrop($event, index)"
              @dragend="endDrag"
            >
              <img v-if="thumbs[index]" :src="thumbs[index]" alt="" draggable="false" />
              <span v-else class="pdf-thumb-pending"></span>
              <span>{{ index + 1 }}</span>
            </button>
            <button type="button" class="pdf-add" :disabled="busy" @click="stageRef?.openPicker()">
              <PlusIcon class="h-5 w-5" />
              <span>{{ copy.ui.pdf.add }}</span>
            </button>
          </div>
        </div>
      </Stage>
    </template>
    <template #settings>
      <div>
        <p class="mb-2 text-sm text-muted">{{ copy.ui.pdf.paper }}</p>
        <Chips v-model="paper" :options="papers" :label="copy.ui.pdf.paper" :disabled="busy" />
      </div>
      <div class="grid gap-3 lg:grid-cols-2">
        <div>
          <p class="mb-2 text-sm text-muted">{{ copy.ui.pdf.orientation }}</p>
          <Chips v-model="orientation" :options="orientations" :label="copy.ui.pdf.orientation" :disabled="busy" />
        </div>
        <div>
          <p class="mb-2 text-sm text-muted">{{ copy.ui.fit }}</p>
          <Chips v-model="fit" :options="fits" :label="copy.ui.fit" :disabled="busy" />
        </div>
      </div>
      <div class="grid gap-3 sm:grid-cols-2">
        <Field :label="`${copy.ui.pdf.margin} ${marginPercent}%`">
          <input v-model.number="marginPercent" class="range" type="range" min="0" max="20" step="1" :disabled="busy" />
        </Field>
        <div>
          <p class="mb-2 text-sm text-muted">{{ copy.ui.background }}</p>
          <div class="flex flex-wrap items-center gap-2">
            <button type="button" class="chip" :aria-pressed="backgroundMode === 'white'" :disabled="busy" @click="backgroundMode = 'white'">
              {{ copy.ui.store.white }}
            </button>
            <button type="button" class="chip" :aria-pressed="backgroundMode === 'black'" :disabled="busy" @click="backgroundMode = 'black'">
              {{ copy.ui.store.black }}
            </button>
            <button type="button" class="chip" :aria-pressed="backgroundMode === 'custom'" :disabled="busy" @click="backgroundMode = 'custom'">
              {{ copy.ui.store.custom }}
            </button>
            <input
              v-model="customColor"
              class="field-input pdf-color"
              type="color"
              :aria-label="copy.ui.store.custom"
              :disabled="busy"
              @input="backgroundMode = 'custom'"
            />
          </div>
        </div>
      </div>
    </template>
  </BatchLayout>
</template>

<script setup lang="ts">
import { computed, markRaw, nextTick, onUnmounted, ref, watch } from "vue";
import { PlusIcon } from "@heroicons/vue/24/outline";
import BatchLayout from "@/components/BatchLayout.vue";
import Chips from "@/components/Chips.vue";
import Field from "@/components/Field.vue";
import Stage from "@/components/Stage.vue";
import { copy } from "@/content";
import { fileToImage, isProcessableImage, stem } from "@/utils/image";
import { layoutPdfPage, pointsToMm, type PdfFit, type PdfOrientation, type PdfPaper } from "@/utils/pdf-layout";
import { buildImagePdf, paintPdfPage, rotatedSource } from "@/utils/pdf-render";
import { saveOrDownload } from "@/utils/save";

type PdfSource = {
  id: string;
  name: string;
  image: HTMLImageElement;
  rotation: number;
};

const stageRef = ref<InstanceType<typeof Stage> | null>(null);
const previewBox = ref<HTMLElement | null>(null);
const previewCanvas = ref<HTMLCanvasElement | null>(null);
const pages = ref<PdfSource[]>([]);
const thumbs = ref<string[]>([]);
const selected = ref(0);
const error = ref("");
const busy = ref(false);
const paper = ref<PdfPaper>("a4");
const orientation = ref<PdfOrientation>("auto");
const fit = ref<PdfFit>("contain");
const marginPercent = ref(0);
const backgroundMode = ref<"white" | "black" | "custom">("white");
const customColor = ref("#f4f4f5");
const pageWidthMm = ref(0);
const pageHeightMm = ref(0);
const draggingIndex = ref<number | null>(null);
const dragOverIndex = ref<number | null>(null);
const thumbRefs = ref<HTMLButtonElement[]>([]);
const orientedCache = new Map<string, { turns: number; source: CanvasImageSource; width: number; height: number }>();
let sequence = 0;
let observed: HTMLElement | null = null;
let observer: ResizeObserver | null = null;
let thumbFrame = 0;
let thumbGeneration = 0;

const papers = [
  { value: "a4", label: copy.ui.pdf.paperA4 },
  { value: "a3", label: copy.ui.pdf.paperA3 },
  { value: "a5", label: copy.ui.pdf.paperA5 },
  { value: "letter", label: copy.ui.pdf.paperLetter },
  { value: "original", label: copy.ui.pdf.paperOriginal },
];
const orientations = [
  { value: "auto", label: copy.ui.pdf.orientationAuto },
  { value: "portrait", label: copy.ui.pdf.portrait },
  { value: "landscape", label: copy.ui.pdf.landscape },
];
const fits = [
  { value: "contain", label: copy.ui.fitContain },
  { value: "cover", label: copy.ui.fitCover },
  { value: "stretch", label: copy.ui.fitStretch },
];
const background = computed(() => {
  if (backgroundMode.value === "black") return "#000000";
  if (backgroundMode.value === "custom") return customColor.value || "#ffffff";
  return "#ffffff";
});

function fail(reason: unknown) {
  error.value = reason instanceof Error ? (reason.message === "canvas" ? copy.ui.canvas : reason.message) : copy.failed;
}

function layoutFor(width: number, height: number) {
  return layoutPdfPage(width, height, paper.value, orientation.value, fit.value, marginPercent.value / 100);
}

function orientedOf(page: PdfSource) {
  const cached = orientedCache.get(page.id);
  if (cached?.turns === page.rotation) return cached;
  const next = rotatedSource(page.image, Math.max(1, page.image.naturalWidth), Math.max(1, page.image.naturalHeight), page.rotation);
  const record = { turns: page.rotation, source: next.source, width: next.width, height: next.height };
  orientedCache.set(page.id, record);
  return record;
}

function paintPreview() {
  const canvas = previewCanvas.value;
  const box = previewBox.value;
  const page = pages.value[selected.value];
  if (!canvas || !box || !page) return;
  const styles = getComputedStyle(box);
  const padX = (parseFloat(styles.paddingLeft) || 0) + (parseFloat(styles.paddingRight) || 0);
  const padY = (parseFloat(styles.paddingTop) || 0) + (parseFloat(styles.paddingBottom) || 0);
  const maxW = Math.floor(box.clientWidth - padX);
  const maxH = Math.floor(box.clientHeight - padY);
  if (maxW < 8 || maxH < 8) return;
  const oriented = orientedOf(page);
  const layout = layoutFor(oriented.width, oriented.height);
  pageWidthMm.value = pointsToMm(layout.pageWidth);
  pageHeightMm.value = pointsToMm(layout.pageHeight);
  const aspect = layout.pageWidth / layout.pageHeight;
  let cssW = maxW;
  let cssH = Math.max(1, Math.floor(cssW / aspect));
  if (cssH > maxH) {
    cssH = maxH;
    cssW = Math.max(1, Math.floor(cssH * aspect));
  }
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  paintPdfPage(canvas, oriented.source, layout, background.value, Math.round(cssW * dpr), Math.round(cssH * dpr));
  canvas.style.width = `${cssW}px`;
  canvas.style.height = `${cssH}px`;
}

function refreshThumbs() {
  const next: string[] = [];
  for (const page of pages.value) {
    const oriented = orientedOf(page);
    const layout = layoutFor(oriented.width, oriented.height);
    const canvas = document.createElement("canvas");
    const width = 160;
    const height = Math.max(1, Math.round((width * layout.pageHeight) / layout.pageWidth));
    paintPdfPage(canvas, oriented.source, layout, background.value, width, height);
    next.push(canvas.toDataURL("image/jpeg", 0.72));
  }
  thumbs.value = next;
}

function scheduleThumbs() {
  const generation = ++thumbGeneration;
  cancelAnimationFrame(thumbFrame);
  thumbFrame = requestAnimationFrame(() => {
    if (generation !== thumbGeneration) return;
    try {
      refreshThumbs();
    } catch (reason) {
      fail(reason);
    }
  });
}

function bindObserver() {
  const box = previewBox.value;
  if (!box || box === observed) return;
  observer?.disconnect();
  observed = box;
  observer = new ResizeObserver(() => {
    try {
      paintPreview();
    } catch (reason) {
      fail(reason);
    }
  });
  observer.observe(box);
}

function redraw() {
  try {
    if (!pages.value.length) {
      observer?.disconnect();
      observed = null;
      thumbs.value = [];
      pageWidthMm.value = 0;
      pageHeightMm.value = 0;
      return;
    }
    bindObserver();
    paintPreview();
    scheduleThumbs();
  } catch (reason) {
    fail(reason);
  }
}

watch([paper, orientation, fit, marginPercent, background, pages], redraw, { deep: true, flush: "post" });
watch(selected, () => {
  try {
    paintPreview();
  } catch (reason) {
    fail(reason);
  }
  nextTick(() => thumbRefs.value[selected.value]?.scrollIntoView({ block: "nearest", inline: "nearest" }));
}, { flush: "post" });

onUnmounted(() => {
  observer?.disconnect();
  cancelAnimationFrame(thumbFrame);
});

function setThumbRef(element: unknown, index: number) {
  if (element instanceof HTMLButtonElement) thumbRefs.value[index] = element;
}

async function addFiles(incoming: File[]) {
  const images = incoming.filter(isProcessableImage);
  if (!images.length) {
    error.value = copy.noImage;
    return;
  }
  error.value = "";
  busy.value = true;
  try {
    const added: PdfSource[] = [];
    let failed = "";
    for (const file of images) {
      try {
        const image = await fileToImage(file);
        added.push({ id: `page-${++sequence}`, name: file.name, image: markRaw(image), rotation: 0 });
      } catch (reason) {
        failed = reason instanceof Error ? reason.message : copy.failed;
      }
    }
    if (!added.length) {
      error.value = failed || copy.noImage;
      return;
    }
    const start = pages.value.length;
    pages.value = pages.value.concat(added);
    selected.value = start;
    if (failed) error.value = failed;
  } finally {
    busy.value = false;
  }
}

function clear() {
  pages.value = [];
  selected.value = 0;
  error.value = "";
  orientedCache.clear();
}

function removeCurrent() {
  const index = selected.value;
  const page = pages.value[index];
  if (!page) return;
  orientedCache.delete(page.id);
  const next = pages.value.slice();
  next.splice(index, 1);
  pages.value = next;
  selected.value = Math.min(index, Math.max(0, next.length - 1));
}

function rotate(delta: number) {
  const page = pages.value[selected.value];
  if (!page) return;
  page.rotation = (((page.rotation + delta) % 4) + 4) % 4;
}

function move(from: number, to: number) {
  if (from === to || from < 0 || to < 0 || from >= pages.value.length || to >= pages.value.length) return;
  const next = pages.value.slice();
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  pages.value = next;
  selected.value = to;
}

function endDrag() {
  draggingIndex.value = null;
  dragOverIndex.value = null;
}

function onDragStart(event: DragEvent, index: number) {
  draggingIndex.value = index;
  event.dataTransfer?.setData("text/plain", String(index));
  if (event.dataTransfer) event.dataTransfer.effectAllowed = "move";
}

function onThumbDragOver(event: DragEvent, index: number) {
  if (draggingIndex.value == null) return;
  event.preventDefault();
  event.stopPropagation();
  dragOverIndex.value = index;
  if (event.dataTransfer) event.dataTransfer.dropEffect = "move";
}

function onThumbDrop(event: DragEvent, index: number) {
  if (draggingIndex.value == null) return;
  event.preventDefault();
  event.stopPropagation();
  move(draggingIndex.value, index);
  endDrag();
}

function onDeskDragOver(event: DragEvent) {
  if (draggingIndex.value == null) return;
  event.preventDefault();
  event.stopPropagation();
}

function onDeskDrop(event: DragEvent) {
  if (draggingIndex.value == null) return;
  event.preventDefault();
  event.stopPropagation();
  endDrag();
}

async function build() {
  if (!pages.value.length || busy.value) return;
  error.value = "";
  busy.value = true;
  try {
    const bytes = await buildImagePdf(
      pages.value.map((page) => {
        const oriented = orientedOf(page);
        return { source: oriented.source, width: oriented.width, height: oriented.height };
      }),
      {
        paper: paper.value,
        orientation: orientation.value,
        fit: fit.value,
        marginRatio: marginPercent.value / 100,
        background: background.value,
      },
    );
    await saveOrDownload(new Blob([new Uint8Array(bytes)], { type: "application/pdf" }), `${stem(pages.value[0].name)}.pdf`);
  } catch (reason) {
    fail(reason);
  } finally {
    busy.value = false;
  }
}
</script>

<style scoped>
.pdf-desk {
  display: flex;
  height: 100%;
  min-height: 0;
  flex-direction: column;
}

.pdf-preview {
  order: 1;
}

.pdf-rail {
  display: flex;
  flex: none;
  gap: 0.5rem;
  order: 2;
  overflow: auto;
  border-top: 1px solid var(--line);
  padding: 0.5rem;
}

.pdf-thumb,
.pdf-add {
  display: flex;
  flex: none;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  width: 4.75rem;
  border-radius: 8px;
  background: transparent;
  color: var(--muted);
  cursor: grab;
}

.pdf-thumb:active {
  cursor: grabbing;
}

.pdf-thumb {
  border: 0;
  padding: 0.25rem;
}

.pdf-thumb img,
.pdf-thumb-pending {
  width: 4.25rem;
  height: 4.5rem;
  object-fit: contain;
  border-radius: 4px;
  background: transparent;
}

.pdf-thumb-pending {
  border: 1px solid var(--line);
}

.pdf-thumb > span:last-child {
  font-size: 0.75rem;
  line-height: 1;
  font-variant-numeric: tabular-nums;
}

.pdf-thumb.is-current {
  color: var(--ink);
}

.pdf-thumb.is-current img,
.pdf-thumb.is-target img {
  box-shadow: 0 0 0 2px var(--accent);
}

.pdf-thumb.is-dragging {
  opacity: 0.45;
}

.pdf-add {
  min-height: 5.75rem;
  cursor: pointer;
  border: 1px dashed color-mix(in srgb, var(--ink) 32%, transparent);
  padding: 0.5rem;
  font-size: 0.75rem;
  line-height: 1.2;
  text-align: center;
}

.pdf-add span {
  overflow-wrap: anywhere;
}

.pdf-add:hover {
  color: var(--ink);
  background: color-mix(in srgb, var(--accent) 8%, transparent);
}

.pdf-add:disabled {
  cursor: not-allowed;
  opacity: 0.45;
}

.pdf-color {
  width: 3.5rem;
  padding: 0.2rem;
}

.pdf-sheet {
  display: block;
  background: var(--surface);
  box-shadow: var(--shadow);
}

@media (min-width: 1024px) {
  .pdf-desk {
    flex-direction: row;
  }

  .pdf-preview {
    order: 2;
  }

  .pdf-rail {
    order: 1;
    flex-direction: column;
    width: 7.25rem;
    border-top: 0;
    border-inline-end: 1px solid var(--line);
  }
}
</style>
