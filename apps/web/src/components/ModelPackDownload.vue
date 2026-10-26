<template>
  <div class="text-start">
    <p class="text-sm text-muted">{{ copy.modelDownload.hint }}</p>
    <p v-if="directory" class="mt-1 break-all text-sm text-muted">{{ copy.modelDownload.directory }} {{ directory }}</p>
    <div class="mt-2 flex flex-wrap items-center gap-2">
      <button type="button" class="btn btn-primary" :disabled="running" @click="start">
        {{ copy.modelDownload.action }}
      </button>
      <button v-if="running" type="button" class="btn" @click="cancel">{{ copy.modelDownload.cancel }}</button>
    </div>
    <p v-if="progressLabel" class="mt-1 text-sm text-muted" role="status">{{ progressLabel }}</p>
    <p
      v-if="errorText"
      class="mt-1 text-sm"
      :class="state.error === 'cancelled' ? 'text-muted' : 'text-danger'"
      :role="state.error === 'cancelled' ? undefined : 'alert'"
    >
      {{ errorText }}
    </p>
    <a
      v-if="state.phase === 'error'"
      class="text-link mt-1 inline-block text-sm"
      :href="modelChoiceLinks.models"
      target="_blank"
      rel="noopener noreferrer"
    >
      {{ copy.modelDownload.openRelease }}
    </a>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { copy } from "@/content";
import { modelChoiceLinks } from "@/release";
import { useModelPackDownload } from "@/model-pack-download";
import { formatBytes } from "@/utils/image";

const directory = ref("");
const { state, running, start, cancel } = useModelPackDownload();

onMounted(async () => {
  if (!window.tucools?.modelPackDirectory) return;
  try {
    directory.value = await window.tucools.modelPackDirectory();
  } catch {
    directory.value = "";
  }
});
const errors = copy.modelDownload.errors as Record<string, string>;

const progressLabel = computed(() => {
  if (state.phase === "downloading") {
    if (state.total > 0) {
      const percent = Math.min(100, Math.round((state.received / state.total) * 100));
      return `${copy.modelDownload.downloading} ${percent}%`;
    }
    if (state.received > 0) return `${copy.modelDownload.downloading} ${formatBytes(state.received)}`;
    return copy.modelDownload.downloading;
  }
  if (state.phase === "extracting") {
    if (state.total > 0) {
      const percent = Math.min(100, Math.round((state.received / state.total) * 100));
      return `${copy.modelDownload.extracting} ${percent}%`;
    }
    return copy.modelDownload.extracting;
  }
  if (state.phase === "done") return copy.modelDownload.done;
  return "";
});

const errorText = computed(() => (state.error ? errors[state.error] || copy.modelDownload.failed : ""));
</script>
