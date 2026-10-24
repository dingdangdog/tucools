<template>
  <div
    class="stage relative overflow-hidden"
    :class="[
      compact ? 'h-32 shrink-0' : 'min-h-[18rem] flex-1 lg:h-full lg:min-h-0',
      filled ? '' : 'is-empty',
      over ? 'is-over' : '',
    ]"
    @dragover.prevent="over = true"
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
      v-if="!filled"
      type="button"
      class="stage-pick absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center"
      @click="openPicker"
    >
      <PhotoIcon class="h-10 w-10 text-muted" />
      <span class="text-sm">{{ hint || copy.empty }}</span>
      <span class="btn btn-primary">{{ copy.choose }}</span>
    </button>
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
import { copy } from "@/content/zh";

const props = withDefaults(
  defineProps<{
    filled?: boolean;
    multiple?: boolean;
    accept?: string;
    compact?: boolean;
    busy?: boolean;
    progress?: string;
    hint?: string;
  }>(),
  { filled: false, multiple: true, accept: "image/*", compact: false, busy: false, progress: "", hint: "" }
);
const emit = defineEmits<{ files: [File[]] }>();
const over = ref(false);
const input = ref<HTMLInputElement | null>(null);

function openPicker() {
  input.value?.click();
}

function emitFiles(list: FileList | null | undefined) {
  over.value = false;
  if (props.busy || !list?.length) return;
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
