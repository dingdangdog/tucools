import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { createNavGroups, cropModePath, isCropMode, type CropModeId } from "@/nav";
import { loadRuntimeConfig } from "@/runtime-config";
import {
  allFeatureIds,
  allowedCropModes,
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
    const known = new Set<string>(allFeatureIds);
    const ids = parsed.filter((id): id is string => typeof id === "string" && known.has(id));
    const keptCrop = parsed.some((id) => typeof id === "string" && isCropMode(id));
    if (keptCrop && known.has("cropping") && !ids.includes("cropping")) ids.push("cropping");
    if (!ids.length && parsed.length) return null;
    return ids;
  } catch {
    return null;
  }
}

async function readAllowRaw(): Promise<string> {
  const config = await loadRuntimeConfig();
  return config.features;
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

  const openCropModes = computed((): CropModeId[] => {
    if (!visibleIds.value.includes("cropping")) return [];
    return allowedCropModes(allowRaw.value);
  });
  const cropEntryPath = computed(() => cropModePath(openCropModes.value[0] ?? "cropping"));

  const groups = computed(() =>
    createNavGroups()
      .map((group) => ({
        id: group.id,
        label: group.label,
        items: visibleItems(group.items, visibleIds.value),
      }))
      .filter((group) => group.items.length > 0),
  );
  const optionGroups = computed(() =>
    createNavGroups()
      .map((group) => ({
        id: group.id,
        label: group.label,
        items: visibleItems(group.items, catalogIds.value),
      }))
      .filter((group) => group.items.length > 0),
  );

  function isVisible(id: string) {
    return visibleIds.value.includes(id);
  }

  function allowsCropMode(id: string) {
    return isCropMode(id) && openCropModes.value.includes(id);
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
    groups,
    optionGroups,
    openCropModes,
    cropEntryPath,
    isVisible,
    allowsCropMode,
    toggle,
    showAllowed,
    load,
  };
});
