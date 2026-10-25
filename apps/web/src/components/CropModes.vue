<template>
  <nav v-if="onCrop && items.length > 1" class="mode-bar" :aria-label="copy.cropModes">
    <RouterLink
      v-for="item in items"
      :key="item.id"
      :to="item.to"
      class="chip"
      :aria-current="current === item.id ? 'page' : undefined"
    >
      {{ item.label }}
    </RouterLink>
  </nav>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";
import { copy } from "@/content";
import { featureIdFromPath } from "@/features";
import { cropModeNav, isCropMode } from "@/nav";
import { useMenuStore } from "@/stores/menus";

const menus = useMenuStore();
const route = useRoute();
const current = computed(() => featureIdFromPath(route.path));
const onCrop = computed(() => current.value !== null && isCropMode(current.value));
const items = computed(() => cropModeNav(menus.openCropModes));
</script>
