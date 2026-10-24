<template>
  <div ref="root" class="relative">
    <button
      type="button"
      class="btn max-w-[9.5rem] shrink-0"
      :aria-label="copy.language"
      aria-haspopup="listbox"
      :aria-expanded="open"
      @click="open = !open"
    >
      <GlobeAltIcon class="h-4 w-4 shrink-0" />
      <span class="truncate">{{ currentName }}</span>
    </button>
    <div
      v-if="open"
      class="absolute end-0 z-50 mt-1 max-h-[70vh] w-52 overflow-y-auto rounded-lg border border-line bg-[var(--surface)] py-1 shadow-[var(--shadow)]"
      role="listbox"
    >
      <button
        v-for="item in locales"
        :key="item.code"
        type="button"
        class="block w-full px-3 py-2 text-start text-sm"
        role="option"
        :aria-selected="item.code === currentLocale"
        :class="item.code === currentLocale ? 'bg-[var(--nav-active)] font-medium text-[var(--nav-active-ink)]' : 'hover:bg-[var(--nav-hover)]'"
        @click="choose(item.code)"
      >
        {{ item.name }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { GlobeAltIcon } from "@heroicons/vue/24/outline";
import { copy, currentLocale } from "@/content";
import { localePath, locales, stripLocale, type LocaleCode } from "@/locale";

const open = ref(false);
const root = ref<HTMLElement | null>(null);
const route = useRoute();
const router = useRouter();
const currentName = computed(() => locales.find((item) => item.code === currentLocale.value)?.name ?? copy.language);

function choose(code: LocaleCode) {
  open.value = false;
  void router.push(localePath(stripLocale(route.path), code));
}

function onPointer(event: PointerEvent) {
  if (!root.value?.contains(event.target as Node)) open.value = false;
}

function onKey(event: KeyboardEvent) {
  if (event.key === "Escape") open.value = false;
}

onMounted(() => {
  document.addEventListener("pointerdown", onPointer);
  document.addEventListener("keydown", onKey);
});

onUnmounted(() => {
  document.removeEventListener("pointerdown", onPointer);
  document.removeEventListener("keydown", onKey);
});
</script>
