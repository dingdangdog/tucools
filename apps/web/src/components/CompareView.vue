<template>
  <div
    ref="root"
    class="checker relative h-full w-full select-none overflow-hidden"
    tabindex="0"
    role="slider"
    :aria-valuemin="0"
    :aria-valuemax="100"
    :aria-valuenow="Math.round(position)"
    :aria-label="copy.ui.compare"
    @pointerdown="start"
    @pointermove="move"
    @pointerup="stop"
    @pointercancel="stop"
    @keydown.left.prevent="nudge(-4)"
    @keydown.right.prevent="nudge(4)"
  >
    <img :src="result" :alt="resultLabel" class="pointer-events-none absolute inset-0 h-full w-full object-contain" />
    <div class="pointer-events-none absolute inset-0 overflow-hidden bg-[var(--stage)]" :style="{ clipPath: `inset(0 ${100 - position}% 0 0)` }">
      <img :src="original" :alt="originalLabel" class="absolute inset-0 h-full w-full object-contain" />
    </div>
    <div class="absolute inset-y-0 z-10 w-0.5 bg-accent" :style="{ left: `${position}%` }">
      <div class="absolute left-1/2 top-1/2 flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-accent text-accent-ink shadow-[var(--shadow)]">
        <ChevronLeftIcon class="h-3.5 w-3.5" />
        <ChevronRightIcon class="h-3.5 w-3.5" />
      </div>
    </div>
    <span class="pointer-events-none absolute bottom-3 left-3 rounded-md bg-black/55 px-2 py-1 text-xs text-white">{{ originalLabel }}</span>
    <span class="pointer-events-none absolute bottom-3 right-3 rounded-md bg-black/55 px-2 py-1 text-xs text-white">{{ resultLabel }}</span>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/vue/24/outline";
import { copy } from "@/content";

defineProps<{
  original: string;
  result: string;
  originalLabel: string;
  resultLabel: string;
}>();

const root = ref<HTMLElement | null>(null);
const position = ref(50);
const dragging = ref(false);

function start(event: PointerEvent) {
  dragging.value = true;
  root.value?.setPointerCapture(event.pointerId);
  move(event);
}

function move(event: PointerEvent) {
  if (!dragging.value || !root.value) return;
  const rect = root.value.getBoundingClientRect();
  if (!rect.width) return;
  const ratio = (event.clientX - rect.left) / rect.width;
  position.value = Math.min(100, Math.max(0, ratio * 100));
}

function stop() {
  dragging.value = false;
}

function nudge(delta: number) {
  position.value = Math.min(100, Math.max(0, position.value + delta));
}
</script>
