<template>
  <div v-if="items.length" class="flex flex-col gap-3">
    <div class="flex flex-wrap gap-2">
      <button type="button" class="btn" @click="$emit('clear')">{{ copy.clear }}</button>
      <button v-if="items.length > 1" type="button" class="btn btn-primary" @click="$emit('downloadAll')">
        {{ copy.downloadAll }}
      </button>
    </div>
    <ul class="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      <li v-for="(item, index) in items" :key="item.url" class="panel overflow-hidden">
        <div class="checker flex h-56 items-center justify-center">
          <img :src="item.url" :alt="item.name" class="max-h-full max-w-full object-contain" />
        </div>
        <div class="flex flex-wrap items-center gap-2 px-3 py-2">
          <div class="min-w-0 flex-1">
            <p class="truncate text-sm">{{ item.name }}</p>
            <p v-if="item.detail" class="truncate text-xs text-muted">{{ item.detail }}</p>
          </div>
          <button v-if="showCopy" type="button" class="btn" aria-live="polite" @click="$emit('copy', item)">
            {{ copiedName === item.name ? copy.ui.copied : copy.ui.copyImage }}
          </button>
          <button type="button" class="btn" @click="$emit('download', item)">{{ copy.download }}</button>
          <button type="button" class="btn" :aria-label="copy.ui.remove" @click="$emit('remove', index)">
            <XMarkIcon class="h-4 w-4" />
          </button>
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { XMarkIcon } from "@heroicons/vue/24/outline";
import { copy } from "@/content";

export interface ResultItem {
  name: string;
  url: string;
  blob: Blob;
  detail?: string;
}

withDefaults(
  defineProps<{
    items: ResultItem[];
    showCopy?: boolean;
    copiedName?: string;
  }>(),
  { showCopy: false, copiedName: "" }
);
defineEmits<{
  clear: [];
  downloadAll: [];
  download: [ResultItem];
  copy: [ResultItem];
  remove: [number];
}>();
</script>
