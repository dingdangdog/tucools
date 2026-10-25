import { copy, currentLocale } from "@/content";
import { localeByCode } from "@/locale";
import { headTags, jsonLd, seoPageFor } from "@/seo";

function upsert(tagName: "meta" | "link", id: string, attrs: Record<string, string>) {
  let el = document.getElementById(id);
  if (!el) {
    el = document.createElement(tagName);
    el.id = id;
    document.head.appendChild(el);
  }
  for (const [key, value] of Object.entries(attrs)) el.setAttribute(key, value);
}

export function applyDocumentSeo(path: string) {
  const origin = window.location.origin.replace(/\/+$/, "");
  const code = currentLocale.value;
  const locale = localeByCode(code);
  const page = seoPageFor(copy, path);
  document.title = page.documentTitle;
  document.documentElement.lang = locale.language;
  document.documentElement.dir = locale.dir;
  document.getElementById("tucools-hreflang")?.remove();
  const tags = headTags(page, origin, copy, code);
  const nextIds = new Set(tags.map((tag) => tag.id));
  if (!nextIds.has("tucools-md")) document.getElementById("tucools-md")?.remove();
  for (const tag of tags) upsert(tag.tag, tag.id, tag.attrs);
  const scriptId = "tucools-jsonld";
  let script = document.getElementById(scriptId);
  if (!(script instanceof HTMLScriptElement)) {
    const created = document.createElement("script");
    created.id = scriptId;
    created.type = "application/ld+json";
    document.head.appendChild(created);
    script = created;
  }
  script.textContent = JSON.stringify(jsonLd(page, origin, copy, code)).replace(/</g, "\\u003c");
}
