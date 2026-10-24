<template>
  <div class="h-full overflow-y-auto p-4 md:p-6">
    <p class="mb-5 max-w-3xl text-sm text-muted">{{ copy.homeLead }}</p>
    <p v-if="!menus.localItems.length && !menus.aiItems.length" class="max-w-3xl text-sm text-muted">
      {{ copy.menus.empty }}
      <RouterLink v-if="menus.client" to="/menus" class="text-link">{{ copy.menus.open }}</RouterLink>
    </p>
    <section v-if="menus.localItems.length" class="mb-6">
      <h2 class="mb-2 text-sm text-muted">{{ copy.localGroup }}</h2>
      <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <RouterLink v-for="item in menus.localItems" :key="item.to" :to="item.to" class="panel flex items-start gap-3 p-3 hover:bg-[var(--nav-hover)]">
          <span class="tile" :data-tone="item.tone">
            <component :is="item.icon" class="h-5 w-5" />
          </span>
          <span class="min-w-0">
            <span class="block text-sm font-medium">{{ item.label }}</span>
            <span class="mt-1 block text-sm text-muted">{{ item.lead }}</span>
          </span>
        </RouterLink>
      </div>
    </section>
    <section v-if="menus.aiItems.length">
      <h2 class="mb-2 text-sm text-muted">{{ copy.aiGroup }}</h2>
      <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <RouterLink v-for="item in menus.aiItems" :key="item.to" :to="item.to" class="panel flex items-start gap-3 p-3 hover:bg-[var(--nav-hover)]">
          <span class="tile" :data-tone="item.tone">
            <component :is="item.icon" class="h-5 w-5" />
          </span>
          <span class="min-w-0">
            <span class="block text-sm font-medium">{{ item.label }}</span>
            <span class="mt-1 block text-sm text-muted">{{ item.lead }}</span>
          </span>
        </RouterLink>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { copy } from "@/content/zh";
import { useMenuStore } from "@/stores/menus";

const menus = useMenuStore();
</script>
