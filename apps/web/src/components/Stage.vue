<template>
  <div
    class="stage relative"
    :class="[
      compact ? 'shrink-0' : docked ? 'h-52 shrink-0' : share ? 'min-h-[28rem] min-w-0 flex-1' : 'min-h-[18rem] flex-1 lg:h-full lg:min-h-0',
      filled ? '' : 'is-empty',
      over ? 'is-over' : '',
      disabled && !$slots.fallback ? 'is-disabled' : '',
      !filled && $slots.fallback ? 'lg:overflow-hidden' : 'overflow-hidden',
    ]"
    @dragover.prevent="onDragOver"
    @dragleave="onDragLeave"
    @drop.prevent="onDrop"
  >
    <input
      ref="input"
      class="hidden"
      type="file"
      :accept="accept"
      :multiple="multiple"
      @change="onChange"
    />
    <button
      v-if="!filled && !$slots.fallback"
      type="button"
      class="stage-pick flex w-full items-center justify-center text-center"
      :class="compact ? 'min-h-24 flex-row flex-wrap gap-x-3 gap-y-2 px-5 py-4' : 'absolute inset-0 flex-col gap-3 px-6'"
      :disabled="disabled"
      @click="openPicker"
    >
      <PhotoIcon class="shrink-0 text-muted" :class="compact ? 'h-6 w-6' : 'h-10 w-10'" />
      <span class="text-sm" :class="compact ? 'min-w-0 flex-1 text-start' : ''">{{ hint || copy.empty }}</span>
      <span class="btn btn-primary shrink-0">{{ copy.choose }}</span>
    </button>
    <div v-else-if="!filled" class="px-4 py-6 sm:px-6 lg:absolute lg:inset-0 lg:overflow-y-auto">
      <div class="flex min-h-full flex-col items-center justify-center gap-4 text-center">
        <p class="text-sm">{{ hint || copy.empty }}</p>
        <slot name="fallback" />
      </div>
    </div>
    <div v-else class="absolute inset-0">
      <slot />
    </div>
    <BusyCover :show="busy" :text="progress" />
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { PhotoIcon } from "@heroicons/vue/24/outline";
import BusyCover from "@/components/BusyCover.vue";
import { copy } from "@/content";

const props = withDefaults(
  defineProps<{
    filled?: boolean;
    multiple?: boolean;
    accept?: string;
    compact?: boolean;
    busy?: boolean;
    progress?: string;
    hint?: string;
    disabled?: boolean;
    docked?: boolean;
    share?: boolean;
  }>(),
  {
    filled: false,
    multiple: true,
    accept: "image/*",
    compact: false,
    busy: false,
    progress: "",
    hint: "",
    disabled: false,
    docked: false,
    share: false,
  }
);
const emit = defineEmits<{ files: [File[]] }>();
const over = ref(false);
const input = ref<HTMLInputElement | null>(null);

function onDragOver() {
  if (!props.disabled && !props.busy) over.value = true;
}

function openPicker() {
  if (props.disabled || props.busy) return;
  input.value?.click();
}

function emitFiles(list: FileList | null | undefined) {
  over.value = false;
  if (props.disabled || props.busy || !list?.length) return;
  emit("files", Array.from(list));
  if (input.value) input.value.value = "";
}

function onDrop(event: DragEvent) {
  emitFiles(event.dataTransfer?.files);
}

function onChange(event: Event) {
  emitFiles((event.target as HTMLInputElement).files);
}

function onDragLeave(event: DragEvent) {
  const next = event.relatedTarget;
  if (next instanceof Node && (event.currentTarget as Node).contains(next)) return;
  over.value = false;
}

defineExpose({ openPicker });
</script>
