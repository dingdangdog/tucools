<template>
  <StudioLayout :lead="lead">
    <Stage :filled="Boolean(image)" :multiple="false" @files="open">
      <div ref="box" class="flex h-full w-full items-center justify-center p-4">
        <canvas ref="view" class="max-h-full max-w-full" />
      </div>
      <FileBadge v-if="fileName" :name="fileName" :detail="detail" />
    </Stage>
    <template #panel>
      <Field :label="copy.ui.text">
        <input v-model="text" class="field-input" type="text" />
      </Field>
      <Field :label="copy.ui.fontSize">
        <input v-model.number="size" class="field-input" type="number" min="8" max="400" />
      </Field>
      <Field v-if="variant === 'watermark'" :label="copy.ui.position">
        <select v-model="position" class="field-input">
          <option v-for="item in positionOptions" :key="item.value" :value="item.value">{{ item.label }}</option>
        </select>
      </Field>
      <Field :label="copy.ui.font">
        <select v-model="font" class="field-input">
          <option>Microsoft YaHei</option>
          <option>SimHei</option>
          <option>Arial</option>
          <option>serif</option>
        </select>
      </Field>
      <Field :label="copy.ui.textColor">
        <input v-model="color" class="field-input" type="color" />
      </Field>
      <Field :label="`${copy.ui.opacity} ${Math.round(opacity * 100)}%`">
        <input v-model.number="opacity" class="range" type="range" min="0.05" max="1" step="0.05" />
      </Field>
      <label class="flex items-center gap-2 text-sm">
        <input v-model="stroke" type="checkbox" class="h-4 w-4 accent-[var(--accent)]" />
        {{ copy.ui.stroke }}
      </label>
      <p v-if="error" class="text-sm text-danger" role="alert">{{ error }}</p>
    </template>
    <template #actions>
      <button type="button" class="btn btn-primary" :disabled="!image" @click="exportPng">{{ copy.ui.exportPng }}</button>
      <button type="button" class="btn" :disabled="!image" @click="clear">{{ copy.ui.replace }}</button>
    </template>
  </StudioLayout>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from "vue";
import Field from "@/components/Field.vue";
import FileBadge from "@/components/FileBadge.vue";
import Stage from "@/components/Stage.vue";
import StudioLayout from "@/components/StudioLayout.vue";
import { copy } from "@/content";
import { canvasToBlob, fileToImage, isProcessableImage, stem } from "@/utils/image";
import { saveOrDownload } from "@/utils/save";

const props = defineProps<{ variant: "watermark" | "caption" }>();
const lead = computed(() => (props.variant === "caption" ? copy.tools.caption.lead : copy.tools.watermark.lead));
const text = ref("图酷");
const size = ref(props.variant === "caption" ? 96 : 36);
const position = ref(props.variant === "caption" ? "center-center" : "bottom-right");
const font = ref("Microsoft YaHei");
const color = ref("#ffffff");
const opacity = ref(0.85);
const stroke = ref(true);
const image = ref<HTMLImageElement | null>(null);
const fileName = ref("");
const detail = ref("");
const error = ref("");
const sample = ref("bottom-right");
const box = ref<HTMLElement | null>(null);
const view = ref<HTMLCanvasElement | null>(null);
let observer: ResizeObserver | undefined;

const positions = [
  "center-center",
  "center-top",
  "center-bottom",
  "left-center",
  "right-center",
  "top-left",
  "top-right",
  "bottom-left",
  "bottom-right",
];
const positionOptions = [
  { value: "random", label: copy.ui.place.random },
  { value: "center-center", label: copy.ui.place.center },
  { value: "center-top", label: copy.ui.place.top },
  { value: "center-bottom", label: copy.ui.place.bottom },
  { value: "left-center", label: copy.ui.place.left },
  { value: "right-center", label: copy.ui.place.right },
  { value: "top-left", label: copy.ui.place.topLeft },
  { value: "top-right", label: copy.ui.place.topRight },
  { value: "bottom-left", label: copy.ui.place.bottomLeft },
  { value: "bottom-right", label: copy.ui.place.bottomRight },
];

function place(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, actual: string, fontSize: number) {
  ctx.textAlign = actual.includes("left") ? "left" : actual.includes("right") ? "right" : "center";
  ctx.textBaseline = "middle";
  if (actual === "top-left") return { x: 16, y: fontSize };
  if (actual === "top-right") return { x: canvas.width - 16, y: fontSize };
  if (actual === "bottom-left") return { x: 16, y: canvas.height - fontSize };
  if (actual === "bottom-right") return { x: canvas.width - 16, y: canvas.height - fontSize };
  if (actual === "center-top") return { x: canvas.width / 2, y: fontSize };
  if (actual === "center-bottom") return { x: canvas.width / 2, y: canvas.height - fontSize };
  if (actual === "left-center") return { x: 16, y: canvas.height / 2 };
  if (actual === "right-center") return { x: canvas.width - 16, y: canvas.height / 2 };
  return { x: canvas.width / 2, y: canvas.height / 2 };
}

function placement(randomize: boolean) {
  if (props.variant === "caption") return "center-center";
  if (position.value !== "random") return position.value;
  if (randomize) return positions[Math.floor(Math.random() * positions.length)];
  return sample.value;
}

function draw(source: HTMLImageElement, actual: string) {
  const canvas = document.createElement("canvas");
  canvas.width = source.naturalWidth;
  canvas.height = source.naturalHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error(copy.ui.canvas);
  ctx.drawImage(source, 0, 0);
  const value = text.value.trim();
  if (!value) return canvas;
  ctx.font = `${size.value}px ${font.value}`;
  ctx.fillStyle = hex(color.value, opacity.value);
  ctx.strokeStyle = "#111111";
  ctx.lineWidth = Math.max(1, size.value / 12);
  const point = place(ctx, canvas, actual, size.value);
  if (stroke.value) ctx.strokeText(value, point.x, point.y);
  ctx.fillText(value, point.x, point.y);
  return canvas;
}

function drawPreview() {
  const source = image.value;
  const target = view.value;
  const frame = box.value;
  if (!source || !target || !frame || !frame.clientWidth || !frame.clientHeight) return;
  const full = draw(source, placement(false));
  const frameStyle = getComputedStyle(frame);
  const frameWidth = frame.clientWidth - parseFloat(frameStyle.paddingLeft) - parseFloat(frameStyle.paddingRight);
  const frameHeight = frame.clientHeight - parseFloat(frameStyle.paddingTop) - parseFloat(frameStyle.paddingBottom);
  if (frameWidth < 1 || frameHeight < 1) return;
  const scale = Math.min(frameWidth / full.width, frameHeight / full.height);
  target.width = Math.max(1, Math.round(full.width * scale));
  target.height = Math.max(1, Math.round(full.height * scale));
  target.getContext("2d")?.drawImage(full, 0, 0, target.width, target.height);
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
  detail.value = `${image.value.naturalWidth}×${image.value.naturalHeight}`;
  sample.value = positions[Math.floor(Math.random() * positions.length)];
  await nextTick();
  drawPreview();
}

async function exportPng() {
  if (!image.value) return;
  if (!text.value.trim()) {
    error.value = copy.ui.needText;
    return;
  }
  error.value = "";
  try {
    const canvas = draw(image.value, placement(true));
    const blob = await canvasToBlob(canvas, "image/png");
    await saveOrDownload(blob, `${props.variant}-${stem(fileName.value)}.png`);
  } catch (reason) {
    error.value = reason instanceof Error ? reason.message : copy.failed;
  }
}

function clear() {
  image.value = null;
  fileName.value = "";
  detail.value = "";
}

function hex(value: string, alpha: number) {
  const raw = value.replace("#", "");
  const r = Number.parseInt(raw.slice(0, 2), 16);
  const g = Number.parseInt(raw.slice(2, 4), 16);
  const b = Number.parseInt(raw.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

watch([text, size, position, font, color, opacity, stroke], () => drawPreview());
watch(box, (element) => {
  observer?.disconnect();
  if (element) observer?.observe(element);
});

onMounted(() => {
  observer = new ResizeObserver(() => drawPreview());
  if (box.value) observer.observe(box.value);
});

onUnmounted(() => observer?.disconnect());
</script>
