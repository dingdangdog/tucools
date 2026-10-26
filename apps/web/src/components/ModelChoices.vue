<template>
  <ul class="flex w-fit max-w-full flex-col text-start">
    <li v-for="item in items" :key="item.id">
      <div v-if="item.id === 'models' && desktop" class="rounded-[10px] px-2.5 py-2">
        <span class="block text-sm font-medium">{{ item.title }}</span>
        <ModelPackDownload class="mt-1" />
      </div>
      <a
        v-else
        class="block rounded-[10px] px-2.5 py-2 text-inherit no-underline hover:bg-[var(--nav-hover)]"
        :href="item.href"
        target="_blank"
        rel="noopener noreferrer"
      >
        <span class="block text-sm font-medium">{{ item.title }}</span>
        <span class="mt-0.5 block text-sm text-muted">{{ item.detail }}</span>
        <span class="text-link mt-1 block break-all text-sm">{{ item.href }}</span>
      </a>
    </li>
  </ul>
</template>

<script setup lang="ts">
import { computed } from "vue";
import ModelPackDownload from "@/components/ModelPackDownload.vue";
import { copy } from "@/content";
import { canDownloadModelPack } from "@/model-pack-download";
import { modelChoiceLinks } from "@/release";

const desktop = canDownloadModelPack();

const items = computed(() => [
  { id: "docker", href: modelChoiceLinks.docker, ...copy.modelChoices.docker },
  { id: "client", href: modelChoiceLinks.client, ...copy.modelChoices.client },
  { id: "models", href: modelChoiceLinks.models, ...copy.modelChoices.models },
]);
</script>
