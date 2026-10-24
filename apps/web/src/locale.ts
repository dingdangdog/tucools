export const locales = [
  { code: "zh", language: "zh-CN", og: "zh_CN", name: "简体中文", dir: "ltr", prefix: "" },
  { code: "en", language: "en-US", og: "en_US", name: "English", dir: "ltr", prefix: "en" },
  { code: "zh_hant", language: "zh-Hant", og: "zh_Hant", name: "繁体中文", dir: "ltr", prefix: "zh_hant" },
  { code: "es", language: "es-ES", og: "es_ES", name: "Español", dir: "ltr", prefix: "es" },
  { code: "de", language: "de-DE", og: "de_DE", name: "Deutsch", dir: "ltr", prefix: "de" },
  { code: "ja", language: "ja-JP", og: "ja_JP", name: "日本語", dir: "ltr", prefix: "ja" },
  { code: "pt_br", language: "pt-BR", og: "pt_BR", name: "Português (Brasil)", dir: "ltr", prefix: "pt_br" },
  { code: "hi", language: "hi-IN", og: "hi_IN", name: "हिन्दी", dir: "ltr", prefix: "hi" },
  { code: "vn", language: "vi-VN", og: "vi_VN", name: "Tiếng Việt", dir: "ltr", prefix: "vn" },
  { code: "ar", language: "ar", og: "ar_AR", name: "العربية", dir: "rtl", prefix: "ar" },
  { code: "bn", language: "bn-BD", og: "bn_BD", name: "বাংলা", dir: "ltr", prefix: "bn" },
] as const;

export type LocaleCode = (typeof locales)[number]["code"];
export type LocaleDir = (typeof locales)[number]["dir"];

export const defaultLocale: LocaleCode = "zh";
export const localeStorageKey = "tucools-locale";

const prefixed = locales.filter((item) => item.prefix);
export const localePattern = prefixed.map((item) => item.prefix).join("|");

const localeCodes = new Set<string>(locales.map((item) => item.code));

export function isLocaleCode(value: string | null | undefined): value is LocaleCode {
  return !!value && localeCodes.has(value);
}

export function localeByCode(code: LocaleCode) {
  const found = locales.find((item) => item.code === code);
  if (!found) throw new Error(`未知语言 ${code}`);
  return found;
}

export function localeFromPath(path: string): LocaleCode {
  const parts = (path.split(/[?#]/)[0] || "/").split("/").filter(Boolean);
  if (!parts.length) return defaultLocale;
  const found = locales.find((item) => item.prefix === parts[0]);
  return found?.code ?? defaultLocale;
}

export function localeFromParam(value: unknown): LocaleCode {
  const raw = Array.isArray(value) ? value[0] : value;
  if (typeof raw !== "string") return defaultLocale;
  const found = locales.find((item) => item.prefix === raw);
  return found?.code ?? defaultLocale;
}

export function stripLocale(path: string): string {
  const pathname = path.split(/[?#]/)[0] || "/";
  const parts = pathname.split("/").filter(Boolean);
  if (parts.length && prefixed.some((item) => item.prefix === parts[0])) parts.shift();
  return parts.length ? `/${parts.join("/")}` : "/";
}

export function localePath(path: string, code: LocaleCode): string {
  const bare = stripLocale(path);
  const prefix = localeByCode(code).prefix;
  if (!prefix) return bare;
  return bare === "/" ? `/${prefix}` : `/${prefix}${bare}`;
}

export function absoluteUrl(origin: string, urlPath: string): string {
  const base = origin.trim().replace(/\/+$/, "");
  if (!base) return urlPath;
  return `${base}${urlPath}`;
}

export function readSavedLocale(): LocaleCode | null {
  try {
    const raw = localStorage.getItem(localeStorageKey);
    return isLocaleCode(raw) ? raw : null;
  } catch {
    return null;
  }
}

export function matchNavigator(input: string | undefined): LocaleCode {
  const value = (input || "").toLowerCase().replace(/_/g, "-");
  if (value.startsWith("zh")) {
    if (/(hant|tw|hk|mo)/.test(value)) return "zh_hant";
    return "zh";
  }
  const table: [string, LocaleCode][] = [
    ["pt", "pt_br"],
    ["vi", "vn"],
    ["en", "en"],
    ["es", "es"],
    ["de", "de"],
    ["ja", "ja"],
    ["hi", "hi"],
    ["ar", "ar"],
    ["bn", "bn"],
  ];
  for (const [prefix, code] of table) {
    if (value === prefix || value.startsWith(`${prefix}-`)) return code;
  }
  return defaultLocale;
}

export function systemLocale(): LocaleCode {
  const values = navigator.languages?.length ? [...navigator.languages] : [navigator.language];
  for (const value of values) {
    const code = matchNavigator(value);
    if (code !== defaultLocale) return code;
    if (value.toLowerCase().startsWith("zh")) return defaultLocale;
  }
  return defaultLocale;
}
