import { reactive, ref } from "vue";
import { defaultLocale, localeByCode, localeStorageKey, type LocaleCode } from "@/locale";
import { catalogs } from "./catalogs";
import { zh, type Copy, type ToolId } from "./zh";

export type { Copy, ToolId };

export const currentLocale = ref<LocaleCode>(defaultLocale);

export const copy = reactive(structuredClone(zh)) as Copy;

export function applyCatalog(code: LocaleCode) {
  const locale = localeByCode(code);
  if (currentLocale.value !== code) {
    currentLocale.value = code;
    Object.assign(copy, structuredClone(catalogs[code]));
  }
  if (typeof document !== "undefined") {
    document.documentElement.lang = locale.language;
    document.documentElement.dir = locale.dir;
  }
  try {
    localStorage.setItem(localeStorageKey, code);
  } catch {
    // 隐私模式仍使用地址上的语言。
  }
}
