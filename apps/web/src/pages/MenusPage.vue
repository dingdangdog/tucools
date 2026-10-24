<template>
  <div class="h-full overflow-y-auto p-4 md:p-6">
    <div class="max-w-3xl">
      <p class="text-sm text-muted">{{ lead }}</p>

      <template v-if="menus.client">
        <section v-for="group in menus.optionGroups" :key="group.id" class="mt-5">
          <h2 class="mb-2 text-sm text-muted">{{ group.label }}</h2>
          <div class="grid gap-2">
            <label v-for="item in group.items" :key="item.id" class="panel flex min-h-11 cursor-pointer items-start gap-3 p-3">
              <input
                class="menu-check"
                type="checkbox"
                :checked="menus.isVisible(item.id)"
                @change="onToggle(item.id, $event)"
              />
              <span class="min-w-0">
                <span class="block text-sm font-medium">{{ item.label }}</span>
                <span class="mt-1 block text-sm text-muted">{{ item.lead }}</span>
              </span>
            </label>
          </div>
        </section>
        <p v-if="!menus.optionGroups.length" class="mt-4 text-sm text-muted">{{ copy.menus.empty }}</p>
        <button v-if="menus.customized" type="button" class="btn mt-4" @click="menus.showAllowed()">
          {{ copy.menus.showAll }}
        </button>
      </template>

      <template v-else>
        <h2 class="mb-2 mt-5 text-sm text-muted">{{ copy.menus.browserCurrent }}</h2>
        <ul v-if="currentNames.length" class="list-disc space-y-1 pl-5 text-sm">
          <li v-for="name in currentNames" :key="name">{{ name }}</li>
        </ul>
        <p v-else class="text-sm text-muted">{{ copy.menus.empty }}</p>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { copy } from "@/content";
import { useMenuStore } from "@/stores/menus";

const menus = useMenuStore();
const lead = computed(() => {
  if (!menus.client) return copy.menus.browserLead;
  return menus.capped ? copy.menus.capped : copy.menus.lead;
});
const currentNames = computed(() => menus.groups.flatMap((group) => group.items.map((item) => item.label)));

function onToggle(id: string, event: Event) {
  const input = event.target;
  if (!(input instanceof HTMLInputElement)) return;
  menus.toggle(id, input.checked);
}
</script>
