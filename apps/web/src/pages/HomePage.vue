<template>
  <div class="h-full overflow-y-auto px-4 py-4 md:px-5 md:py-5">
    <div class="mb-4 flex gap-2 overflow-x-auto pb-1" role="group" :aria-label="copy.allFeatures">
      <button type="button" class="chip shrink-0" :aria-pressed="filter === 'all'" @click="filter = 'all'">
        {{ copy.filterAll }}
      </button>
      <button
        v-for="group in menus.groups"
        :key="group.id"
        type="button"
        class="chip shrink-0"
        :aria-pressed="filter === group.id"
        @click="filter = group.id"
      >
        {{ group.label }}
      </button>
    </div>
    <p class="mb-5 max-w-3xl text-sm text-muted">{{ copy.homeLead }}</p>
    <p v-if="!menus.groups.length" class="max-w-3xl text-sm text-muted">
      {{ copy.menus.empty }}
      <RouterLink v-if="menus.client" :to="menusTo" class="text-link">{{ copy.menus.open }}</RouterLink>
    </p>
    <section v-for="group in visibleGroups" :key="group.id" class="mb-7">
      <h2 v-if="filter === 'all'" class="mb-3 text-xs text-muted">{{ group.label }}</h2>
      <div class="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
        <RouterLink v-for="item in group.items" :key="item.to" :to="item.to" class="tool-card">
          <span class="tool-card-well">
            <component :is="item.icon" class="h-8 w-8" />
          </span>
          <span class="tool-card-body">
            <span class="tool-card-title">{{ item.label }}</span>
            <span class="tool-card-lead">{{ item.lead }}</span>
          </span>
        </RouterLink>
      </div>
    </section>
    <PageFacts />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import PageFacts from "@/components/PageFacts.vue";
import { copy, currentLocale } from "@/content";
import { localePath } from "@/locale";
import { useMenuStore } from "@/stores/menus";

const menus = useMenuStore();
const menusTo = computed(() => localePath("/menus", currentLocale.value));
const filter = ref("all");
const visibleGroups = computed(() =>
  filter.value === "all" ? menus.groups : menus.groups.filter((group) => group.id === filter.value),
);
</script>
