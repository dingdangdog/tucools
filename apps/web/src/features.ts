import { allNavIds, cropModeIds, isCropMode, type CropModeId, type NavItem } from "@/nav";
import { stripLocale } from "@/locale";

export const menuStorageKey = "tucools-features";

export const allFeatureIds = [...allNavIds];

const routeIds = new Set<string>([...allNavIds, ...cropModeIds]);

export function featureIdFromPath(path: string): string | null {
  const id = stripLocale(path).replace(/^\/+|\/+$/g, "");
  return routeIds.has(id) ? id : null;
}

/** 空值表示不限制。非空字符串只保留已知功能名，一个都不认识时返回空数组。 */
function pickedIds(raw: string | null | undefined): string[] | null {
  if (raw == null) return null;
  const text = raw.trim();
  if (!text) return null;
  const picked = new Set<string>();
  for (const part of text.split(",")) {
    const id = part.trim().toLowerCase();
    if (routeIds.has(id)) picked.add(id);
  }
  return [...picked];
}

export function parseFeatureAllowList(raw: string | null | undefined): string[] | null {
  const picked = pickedIds(raw);
  if (picked === null) return null;
  const set = new Set(picked);
  const opensCrop = picked.some((id) => isCropMode(id));
  return allFeatureIds.filter((id) => set.has(id) || (id === "cropping" && opensCrop));
}

/** `cropping` 表示整组裁剪都可用。只写出下级功能名时，只开放这些地址。 */
export function allowedCropModes(raw: string | null | undefined): CropModeId[] {
  const picked = pickedIds(raw);
  if (picked === null || picked.includes("cropping")) return [...cropModeIds];
  return cropModeIds.filter((id) => id !== "cropping" && picked.includes(id));
}

export function visibleItems(items: NavItem[], ids: readonly string[]): NavItem[] {
  const allowed = new Set(ids);
  return items.filter((item) => allowed.has(item.id));
}
