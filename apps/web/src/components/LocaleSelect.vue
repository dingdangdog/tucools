<template>
  <div ref="root" class="relative min-w-0">
    <button
      type="button"
      class="btn btn-ghost min-w-0 max-w-full"
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
      class="absolute end-0 z-50 mt-1 max-h-[70vh] w-52 overflow-y-auto rounded-xl border border-line bg-[var(--surface)] py-1 shadow-[var(--shadow)]"
      role="listbox"
    >
      <button
        v-for="item in locales"
        :key="item.code"
        type="button"
        class="menu-option block w-full px-3 py-2 text-start text-sm hover:bg-[var(--nav-hover)]"
        role="option"
        :aria-selected="item.code === currentLocale"
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
import { localePath, localeStorageKey, locales, stripLocale, type LocaleCode } from "@/locale";

const open = ref(false);
const root = ref<HTMLElement | null>(null);
const route = useRoute();
const router = useRouter();
const currentName = computed(() => locales.find((item) => item.code === currentLocale.value)?.name ?? copy.language);

function choose(code: LocaleCode) {
  open.value = false;
  try {
    localStorage.setItem(localeStorageKey, code);
  } catch {
    // 隐私模式仍按这次点击后的地址切换。
  }
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
