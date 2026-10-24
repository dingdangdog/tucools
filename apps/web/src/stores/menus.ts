import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { aiNav, localNav } from "@/nav";
import {
  allFeatureIds,
  menuStorageKey,
  parseFeatureAllowList,
  visibleItems,
} from "@/features";

function readSaved(): string[] | null {
  try {
    const raw = localStorage.getItem(menuStorageKey);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return null;
    const known = new Set(allFeatureIds);
    const ids = parsed.filter((id): id is string => typeof id === "string" && known.has(id));
    if (!ids.length && parsed.length) return null;
    return ids;
  } catch {
    return null;
  }
}

async function readAllowRaw(): Promise<string> {
  try {
    const response = await fetch("/app-config.json", {
      cache: "no-store",
      signal: AbortSignal.timeout(3000),
    });
    if (!response.ok) return "";
    const data = (await response.json()) as { features?: unknown };
    return typeof data.features === "string" ? data.features : "";
  } catch {
    return "";
  }
}

export const useMenuStore = defineStore("menus", () => {
  const allowRaw = ref("");
  const saved = ref<string[] | null>(null);
  const client = ref(false);
  const ready = ref(false);

  const allowedIds = computed(() => parseFeatureAllowList(allowRaw.value));
  const catalogIds = computed(() => allowedIds.value ?? allFeatureIds);
  const capped = computed(() => allowedIds.value !== null);
  const customized = computed(() => client.value && saved.value !== null);

  const visibleIds = computed(() => {
    const cap = catalogIds.value;
    if (!client.value || saved.value === null) return cap;
    const chosen = new Set(saved.value);
    return cap.filter((id) => chosen.has(id));
  });

  const localItems = computed(() => visibleItems(localNav, visibleIds.value));
  const aiItems = computed(() => visibleItems(aiNav, visibleIds.value));
  const localOptions = computed(() => visibleItems(localNav, catalogIds.value));
  const aiOptions = computed(() => visibleItems(aiNav, catalogIds.value));

  function isVisible(id: string) {
    return visibleIds.value.includes(id);
  }

  function toggle(id: string, on: boolean) {
    if (!client.value || !catalogIds.value.includes(id)) return;
    const current = new Set(visibleIds.value);
    if (on) current.add(id);
    else current.delete(id);
    const next = catalogIds.value.filter((item) => current.has(item));
    localStorage.setItem(menuStorageKey, JSON.stringify(next));
    saved.value = next;
  }

  function showAllowed() {
    localStorage.removeItem(menuStorageKey);
    saved.value = null;
  }

  async function load() {
    client.value = typeof window !== "undefined" && Boolean(window.tucools);
    saved.value = client.value ? readSaved() : null;
    allowRaw.value = await readAllowRaw();
    ready.value = true;
  }

  return {
    client,
    ready,
    capped,
    customized,
    localItems,
    aiItems,
    localOptions,
    aiOptions,
    isVisible,
    toggle,
    showAllowed,
    load,
  };
});
