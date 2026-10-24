import { aiNav, localNav, type NavItem } from "@/nav";

export const menuStorageKey = "tucools-features";

export const allFeatureIds = [...localNav, ...aiNav].map((item) => item.id);

const known = new Set(allFeatureIds);

export function featureIdFromPath(path: string): string | null {
  const id = path.replace(/^\/+/, "").replace(/\/+$/, "");
  return known.has(id) ? id : null;
}

/** 空值表示不限制。非空字符串只保留已知功能名，一个都不认识时返回空数组。 */
export function parseFeatureAllowList(raw: string | null | undefined): string[] | null {
  if (raw == null) return null;
  const text = raw.trim();
  if (!text) return null;
  const picked = new Set<string>();
  for (const part of text.split(",")) {
    const id = part.trim().toLowerCase();
    if (known.has(id)) picked.add(id);
  }
  return allFeatureIds.filter((id) => picked.has(id));
}

export function visibleItems(items: NavItem[], ids: readonly string[]): NavItem[] {
  const allowed = new Set(ids);
  return items.filter((item) => allowed.has(item.id));
}
