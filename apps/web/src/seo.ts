import { catalogs } from "./content/catalogs";
import type { Copy } from "./content/zh";
import { zh } from "./content/zh";
import { defaultLocale, localeByCode, localePath, locales, stripLocale, type LocaleCode } from "./locale";
import { projectRepo } from "./release";

const seoRevision = "2026-10-26";

const relatedPaths: Record<string, readonly string[]> = {
  "/cutout": ["/enhance", "/erase", "/cropping/id-photo"],
  "/enhance": ["/cutout", "/erase"],
  "/erase": ["/cutout", "/enhance"],
  "/compress": ["/resize", "/converter"],
  "/resize": ["/compress", "/cropping", "/cropping/sizes"],
  "/converter": ["/compress", "/favicon"],
  "/cropping": ["/resize", "/cropping/id-photo", "/cropping/tocircle"],
  "/cropping/id-photo": ["/cutout", "/cropping/sizes"],
  "/cropping/sizes": ["/cropping/store", "/resize"],
  "/cropping/store": ["/cropping/sizes", "/resize"],
  "/cutting": ["/cropping", "/resize"],
  "/watermark": ["/caption", "/fade"],
  "/caption": ["/watermark"],
  "/fade": ["/converter", "/watermark"],
  "/cropping/tocircle": ["/cropping", "/favicon"],
  "/pdf": ["/converter", "/compress"],
  "/favicon": ["/converter", "/cropping/tocircle"],
  "/exif": ["/pix", "/prompt"],
  "/pix": ["/exif", "/prompt"],
  "/prompt": ["/pix", "/exif"],
};

export type SeoGroup = "home" | "ai" | "local" | "info" | "system";

export interface SeoFaq {
  q: string;
  a: string;
}

export interface SeoPage {
  id: string;
  path: string;
  group: SeoGroup;
  heading: string;
  documentTitle: string;
  description: string;
  faqs: readonly SeoFaq[];
  index: boolean;
}

export interface LocaleBundle {
  code: LocaleCode;
  messages: Copy;
}

interface ToolSpec {
  id: string;
  path: string;
  group: Exclude<SeoGroup, "home" | "system">;
  title: string;
  documentTitle: string;
  description: string;
  faqs: readonly SeoFaq[];
}

const chineseName = "图酷";
const latinName = "TuCools";
const legacyBrand = "EasyImage";
const legacyHost = "easyimage.work";

function dedupeText(parts: readonly string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const part of parts) {
    for (const piece of part.split(/[,，]/)) {
      const item = piece.trim();
      const key = item.toLocaleLowerCase();
      if (!item || seen.has(key)) continue;
      seen.add(key);
      out.push(item);
    }
  }
  return out;
}

function brandNames(messages: Copy): string[] {
  return [messages.appName, chineseName, latinName, messages.seo.legacyName, legacyBrand, legacyHost];
}

function alternateNames(messages: Copy): string[] {
  return dedupeText(brandNames(messages)).filter((name) => name !== messages.appName);
}

function legacyAlias(messages: Copy, id: string): string {
  const aliases = messages.seo.aliases;
  if (Object.prototype.hasOwnProperty.call(aliases, id)) return aliases[id as keyof typeof aliases];
  return "";
}

function withLegacyFaq(messages: Copy, id: string, faqs: readonly SeoFaq[]): SeoFaq[] {
  const name = legacyAlias(messages, id);
  if (!name) return [...faqs];
  return [
    ...faqs,
    {
      q: messages.seo.legacyQuestion.replaceAll("{name}", name),
      a: messages.seo.legacyAnswer.replaceAll("{name}", name),
    },
  ];
}

function pageKeywords(page: SeoPage, messages: Copy): string {
  const alias = legacyAlias(messages, page.id);
  const topical = page.path === "/" ? messages.seo.keywords : [page.heading, alias].filter(Boolean).join(", ");
  return dedupeText([topical, ...brandNames(messages)]).join(", ");
}

function originHost(origin: string): string {
  try {
    return new URL(origin).hostname.toLowerCase();
  } catch {
    return "";
  }
}

function organizationSameAs(origin: string): string[] {
  const links = [projectRepo];
  const host = originHost(origin);
  if (host && host !== legacyHost && host !== `www.${legacyHost}`) links.push(`https://${legacyHost}/`);
  return links;
}

function toolSpecs(messages: Copy): ToolSpec[] {
  const specs: ToolSpec[] = [
    { id: "cutout", path: "/cutout", group: "ai", title: messages.tools.cutout.title, ...messages.seo.tools.cutout },
    { id: "enhance", path: "/enhance", group: "ai", title: messages.tools.enhance.title, ...messages.seo.tools.enhance },
    { id: "erase", path: "/erase", group: "ai", title: messages.tools.erase.title, ...messages.seo.tools.erase },
    { id: "compress", path: "/compress", group: "local", title: messages.tools.compress.title, ...messages.seo.tools.compress },
    { id: "resize", path: "/resize", group: "local", title: messages.tools.resize.title, ...messages.seo.tools.resize },
    { id: "converter", path: "/converter", group: "local", title: messages.tools.converter.title, ...messages.seo.tools.converter },
    { id: "cropping", path: "/cropping", group: "local", title: messages.tools.cropping.title, ...messages.seo.tools.cropping },
    { id: "id-photo", path: "/cropping/id-photo", group: "local", title: messages.tools.idPhoto.title, ...messages.seo.tools["id-photo"] },
    { id: "sizes", path: "/cropping/sizes", group: "local", title: messages.tools.sizes.title, ...messages.seo.tools.sizes },
    { id: "store", path: "/cropping/store", group: "local", title: messages.tools.store.title, ...messages.seo.tools.store },
    { id: "cutting", path: "/cutting", group: "local", title: messages.tools.cutting.title, ...messages.seo.tools.cutting },
    { id: "watermark", path: "/watermark", group: "local", title: messages.tools.watermark.title, ...messages.seo.tools.watermark },
    { id: "caption", path: "/caption", group: "local", title: messages.tools.caption.title, ...messages.seo.tools.caption },
    { id: "fade", path: "/fade", group: "local", title: messages.tools.fade.title, ...messages.seo.tools.fade },
    { id: "tocircle", path: "/cropping/tocircle", group: "local", title: messages.tools.tocircle.title, ...messages.seo.tools.tocircle },
    { id: "pdf", path: "/pdf", group: "local", title: messages.tools.pdf.title, ...messages.seo.tools.pdf },
    { id: "favicon", path: "/favicon", group: "local", title: messages.tools.favicon.title, ...messages.seo.tools.favicon },
    { id: "exif", path: "/exif", group: "info", title: messages.tools.exif.title, ...messages.seo.tools.exif },
    { id: "pix", path: "/pix", group: "info", title: messages.tools.pix.title, ...messages.seo.tools.pix },
    { id: "prompt", path: "/prompt", group: "info", title: messages.tools.prompt.title, ...messages.seo.tools.prompt },
  ];
  return specs.map((spec) => ({ ...spec, faqs: withLegacyFaq(messages, spec.id, spec.faqs) }));
}

function pageOf(
  messages: Copy,
  spec: {
    id: string;
    path: string;
    group: SeoGroup;
    heading: string;
    description: string;
    documentTitle?: string;
    faqs: readonly SeoFaq[];
    index: boolean;
  },
): SeoPage {
  const fallback = spec.path === "/" ? messages.appName : `${spec.heading} · ${messages.appName}`;
  return {
    ...spec,
    documentTitle: spec.documentTitle || fallback,
  };
}

export function buildSeoPages(messages: Copy): SeoPage[] {
  return [
    pageOf(messages, {
      id: "home",
      path: "/",
      group: "home",
      heading: messages.appName,
      documentTitle: messages.seo.homeDocumentTitle,
      description: messages.seo.homeDescription,
      faqs: messages.seo.homeFaqs,
      index: true,
    }),
    ...toolSpecs(messages).map((spec) =>
      pageOf(messages, {
        id: spec.id,
        path: spec.path,
        group: spec.group,
        heading: spec.title,
        documentTitle: spec.documentTitle,
        description: spec.description,
        faqs: spec.faqs,
        index: true,
      }),
    ),
    pageOf(messages, {
      id: "menus",
      path: "/menus",
      group: "system",
      heading: messages.menus.title,
      description: messages.menus.lead,
      faqs: [],
      index: false,
    }),
    pageOf(messages, {
      id: "version",
      path: "/version",
      group: "system",
      heading: messages.version.title,
      description: messages.version.lead,
      faqs: [],
      index: false,
    }),
  ];
}

export function normalizeSeoPath(input: string): string {
  const bare = input.split("?")[0]?.split("#")[0] || "/";
  let path = bare.startsWith("/") ? bare : `/${bare}`;
  if (path.endsWith("/index.html")) path = path.slice(0, -"/index.html".length) || "/";
  if (path.length > 1 && path.endsWith("/")) path = path.slice(0, -1);
  return path || "/";
}

export function seoPageFor(messages: Copy, input: string): SeoPage {
  const path = stripLocale(normalizeSeoPath(input));
  return (
    buildSeoPages(messages).find((page) => page.path === path) ??
    pageOf(messages, {
      id: "missing",
      path,
      group: "system",
      heading: messages.seo.missingTitle,
      description: messages.seo.missingBody,
      faqs: [],
      index: false,
    })
  );
}

export function assertSamePaths(routePaths: readonly string[]) {
  const seo = new Set(buildSeoPages(zh).map((page) => page.path));
  const routes = new Set(routePaths);
  for (const path of seo) {
    if (!routes.has(path)) throw new Error(`收录页 ${path} 没有路由`);
  }
  for (const path of routes) {
    if (!seo.has(path)) throw new Error(`路由 ${path} 没有收录说明`);
  }
}

export function siteUrl(origin: string, path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return origin ? `${origin}${normalized}` : normalized;
}

export function markdownFilePath(pagePath: string, code: LocaleCode): string {
  const file = pagePath === "/" ? "/index.md" : `${pagePath}.md`;
  return localePath(file, code);
}

function llmsIndexPath(code: LocaleCode): string {
  const prefix = localeByCode(code).prefix;
  return prefix ? `/${prefix}/llms.txt` : "/llms.txt";
}

function fullGuidePath(code: LocaleCode): string {
  const prefix = localeByCode(code).prefix;
  return prefix ? `/${prefix}/llms-full.txt` : "/llms-full.txt";
}

export function relatedSeoPages(messages: Copy, page: SeoPage): SeoPage[] {
  const wanted = relatedPaths[page.path] ?? [];
  const pages = buildSeoPages(messages);
  return wanted.flatMap((path) => {
    const found = pages.find((item) => item.path === path && item.index);
    return found ? [found] : [];
  });
}

interface HeadTag {
  id: string;
  tag: "meta" | "link";
  attrs: Record<string, string>;
}

export function jsonLd(page: SeoPage, origin: string, messages: Copy, code: LocaleCode): unknown {
  const locale = localeByCode(code);
  const url = siteUrl(origin, localePath(page.path, code));
  const home = siteUrl(origin, localePath("/", code));
  const organizationId = siteUrl(origin, "/#organization");
  const websiteId = `${home}#website`;
  const image = siteUrl(origin, "/logo.webp");
  const pages = buildSeoPages(messages);
  const graph: Record<string, unknown>[] = [
    {
      "@type": "Organization",
      "@id": organizationId,
      name: messages.appName,
      alternateName: alternateNames(messages),
      url: siteUrl(origin, "/"),
      logo: image,
      sameAs: organizationSameAs(origin),
    },
    {
      "@type": "WebSite",
      "@id": websiteId,
      name: messages.appName,
      alternateName: alternateNames(messages),
      url: home,
      description: messages.seo.homeDescription,
      inLanguage: locale.language,
      publisher: { "@id": organizationId },
    },
  ];
  if (page.path === "/") {
    graph.push({
      "@type": "ItemList",
      name: messages.seo.listName,
      itemListElement: pages
        .filter((item) => item.index && item.path !== "/")
        .map((item, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: item.heading,
          url: siteUrl(origin, localePath(item.path, code)),
          description: item.description,
        })),
    });
  }
  graph.push({
    "@type": page.index ? "WebApplication" : "WebPage",
    name: page.documentTitle,
    ...(legacyAlias(messages, page.id) ? { alternateName: legacyAlias(messages, page.id) } : {}),
    url,
    description: page.description,
    inLanguage: locale.language,
    isAccessibleForFree: true,
    isPartOf: { "@id": websiteId },
    publisher: { "@id": organizationId },
    ...(page.index
      ? {
          applicationCategory: "MultimediaApplication",
          operatingSystem: "Web",
          offers: { "@type": "Offer", price: "0", priceCurrency: "CNY" },
        }
      : {}),
  });
  if (page.path !== "/") {
    graph.push({
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: messages.appName, item: home },
        { "@type": "ListItem", position: 2, name: page.heading, item: url },
      ],
    });
  }
  if (page.index && page.faqs.length) {
    graph.push({
      "@type": "FAQPage",
      mainEntity: page.faqs.map((item) => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: { "@type": "Answer", text: item.a },
      })),
    });
  }
  return { "@context": "https://schema.org", "@graph": graph };
}

export function headTags(page: SeoPage, origin: string, messages: Copy, code: LocaleCode): HeadTag[] {
  const locale = localeByCode(code);
  const url = siteUrl(origin, localePath(page.path, code));
  const image = siteUrl(origin, "/logo.webp");
  const alternates: HeadTag[] = locales.map((item) => ({
    id: `tucools-alt-${item.code}`,
    tag: "link",
    attrs: {
      rel: "alternate",
      hreflang: item.language,
      href: siteUrl(origin, localePath(page.path, item.code)),
    },
  }));
  alternates.push({
    id: "tucools-xdefault",
    tag: "link",
    attrs: {
      rel: "alternate",
      hreflang: "x-default",
      href: siteUrl(origin, localePath(page.path, defaultLocale)),
    },
  });
  const ogAlternates: HeadTag[] = locales
    .filter((item) => item.code !== code)
    .map((item) => ({
      id: `tucools-og-alt-${item.code}`,
      tag: "meta",
      attrs: { property: "og:locale:alternate", content: item.og },
    }));
  return [
    { id: "tucools-description", tag: "meta", attrs: { name: "description", content: page.description } },
    { id: "tucools-keywords", tag: "meta", attrs: { name: "keywords", content: pageKeywords(page, messages) } },
    {
      id: "tucools-robots",
      tag: "meta",
      attrs: {
        name: "robots",
        content: page.index
          ? "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"
          : "noindex, follow",
      },
    },
    { id: "tucools-canonical", tag: "link", attrs: { rel: "canonical", href: url } },
    {
      id: "tucools-describedby",
      tag: "link",
      attrs: { rel: "describedby", href: siteUrl(origin, llmsIndexPath(code)) },
    },
    ...(page.index
      ? [
          {
            id: "tucools-md",
            tag: "link" as const,
            attrs: {
              rel: "alternate",
              type: "text/markdown",
              href: siteUrl(origin, markdownFilePath(page.path, code)),
            },
          },
        ]
      : []),
    ...alternates,
    { id: "tucools-og-title", tag: "meta", attrs: { property: "og:title", content: page.documentTitle } },
    { id: "tucools-og-description", tag: "meta", attrs: { property: "og:description", content: page.description } },
    { id: "tucools-og-url", tag: "meta", attrs: { property: "og:url", content: url } },
    { id: "tucools-og-type", tag: "meta", attrs: { property: "og:type", content: "website" } },
    { id: "tucools-og-site", tag: "meta", attrs: { property: "og:site_name", content: messages.appName } },
    { id: "tucools-og-locale", tag: "meta", attrs: { property: "og:locale", content: locale.og } },
    ...ogAlternates,
    { id: "tucools-og-image", tag: "meta", attrs: { property: "og:image", content: image } },
    { id: "tucools-og-image-alt", tag: "meta", attrs: { property: "og:image:alt", content: `${messages.appName} · ${messages.tagline}` } },
    { id: "tucools-twitter-card", tag: "meta", attrs: { name: "twitter:card", content: "summary" } },
    { id: "tucools-twitter-title", tag: "meta", attrs: { name: "twitter:title", content: page.documentTitle } },
    { id: "tucools-twitter-description", tag: "meta", attrs: { name: "twitter:description", content: page.description } },
    { id: "tucools-twitter-image", tag: "meta", attrs: { name: "twitter:image", content: image } },
    { id: "tucools-twitter-image-alt", tag: "meta", attrs: { name: "twitter:image:alt", content: `${messages.appName} · ${messages.tagline}` } },
  ];
}

function esc(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function jsonScript(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

function renderTag(tag: HeadTag): string {
  const attrs = Object.entries(tag.attrs)
    .map(([key, value]) => `${key}="${esc(value)}"`)
    .join(" ");
  return `<${tag.tag} id="${tag.id}" ${attrs}>`;
}

export function renderSeoBlock(page: SeoPage, origin: string, messages: Copy, code: LocaleCode): string {
  const lines = [`<title>${esc(page.documentTitle)}</title>`, ...headTags(page, origin, messages, code).map(renderTag)];
  lines.push(`<script id="tucools-jsonld" type="application/ld+json">${jsonScript(jsonLd(page, origin, messages, code))}</script>`);
  return lines.join("\n    ");
}

function renderFaqs(page: SeoPage, messages: Copy): string {
  if (!page.faqs.length) return "";
  const items = page.faqs.map((item) => `<h3>${esc(item.q)}</h3><p>${esc(item.a)}</p>`).join("");
  return `<h2>${esc(messages.seo.faqHeading)}</h2>${items}`;
}

function renderHomeLinks(messages: Copy, code: LocaleCode): string {
  const pages = buildSeoPages(messages);
  const groups: Array<{ label: string; group: SeoGroup }> = [
    { label: messages.aiGroup, group: "ai" },
    { label: messages.localGroup, group: "local" },
    { label: messages.infoGroup, group: "info" },
  ];
  return groups
    .map((group) => {
      const items = pages
        .filter((page) => page.group === group.group)
        .map((page) => `<li><a href="${esc(localePath(page.path, code))}">${esc(page.heading)}</a>：${esc(page.description)}</li>`)
        .join("");
      return `<h2>${esc(group.label)}</h2><ul>${items}</ul>`;
    })
    .join("");
}

function renderRelatedHtml(page: SeoPage, messages: Copy, code: LocaleCode): string {
  const items = relatedSeoPages(messages, page);
  if (!items.length) return "";
  const links = items.map((item) => `<li><a href="${esc(localePath(item.path, code))}">${esc(item.heading)}</a></li>`).join("");
  return `<h2>${esc(messages.seo.relatedHeading)}</h2><ul>${links}</ul>`;
}

function renderArticle(page: SeoPage, messages: Copy, code: LocaleCode): string {
  const home = page.path === "/" ? "" : `<p><a href="${esc(localePath("/", code))}">${esc(messages.seo.backHome)}</a></p>`;
  const links = page.path === "/" ? renderHomeLinks(messages, code) : "";
  const boundary = page.path === "/" ? `<p>${esc(messages.seo.boundary)}</p>` : "";
  return `<article class="seo-fallback"><h1>${esc(page.documentTitle)}</h1><p>${esc(page.description)}</p>${boundary}${renderFaqs(page, messages)}${renderRelatedHtml(page, messages, code)}${links}${home}</article>`;
}

export function applySeoHtml(html: string, requestPath: string, origin: string, messages: Copy, code: LocaleCode): string {
  const page = seoPageFor(messages, requestPath);
  const locale = localeByCode(code);
  const block = `<!--tucools-seo-->\n    ${renderSeoBlock(page, origin, messages, code)}\n    <!--/tucools-seo-->`;
  if (!/<!--tucools-seo-->[\s\S]*?<!--\/tucools-seo-->/.test(html)) throw new Error("index.html 缺少 tucools-seo 标记");
  if (!/<noscript id="tucools-noscript">[\s\S]*?<\/noscript>/.test(html)) throw new Error("index.html 缺少 tucools-noscript");
  if (!/<div id="app">[\s\S]*?<\/div>/.test(html)) throw new Error("index.html 缺少 #app");
  return html
    .replace(/<html\b[^>]*>/i, `<html lang="${esc(locale.language)}" dir="${locale.dir}">`)
    .replace(/<!--tucools-seo-->[\s\S]*?<!--\/tucools-seo-->/, block)
    .replace(/<noscript id="tucools-noscript">[\s\S]*?<\/noscript>/, `<noscript id="tucools-noscript"></noscript>`)
    .replace(/<div id="app">[\s\S]*?<\/div>/, `<div id="app">${renderArticle(page, messages, code)}</div>`);
}

function groupLabel(messages: Copy, group: SeoGroup): string {
  if (group === "ai") return messages.aiGroup;
  if (group === "local") return messages.localGroup;
  if (group === "info") return messages.infoGroup;
  return messages.appName;
}

function renderLlms(bundle: LocaleBundle, origin: string, bundles: readonly LocaleBundle[]): string {
  const { messages, code } = bundle;
  const pages = buildSeoPages(messages);
  const sections = (["ai", "local", "info"] as const)
    .map((group) => {
      const lines = pages
        .filter((page) => page.group === group)
        .map((page) => `- [${page.heading}](${siteUrl(origin, markdownFilePath(page.path, code))}): ${page.description}`);
      return `## ${groupLabel(messages, group)}\n\n${lines.join("\n")}`;
    })
    .join("\n\n");
  const languages = bundles
    .map((item) => {
      const meta = localeByCode(item.code);
      const href = siteUrl(origin, meta.prefix ? `/${meta.prefix}/llms.txt` : "/llms.txt");
      return `- [${meta.name}](${href})`;
    })
    .join("\n");
  return [
    `# ${messages.appName}`,
    ``,
    `> ${messages.seo.homeDescription}`,
    ``,
    messages.seo.boundary,
    ``,
    `## ${messages.allFeatures}`,
    ``,
    `- [${messages.appName}](${siteUrl(origin, markdownFilePath("/", code))}): ${messages.seo.homeDescription}`,
    ``,
    sections,
    ``,
    `## ${messages.language}`,
    ``,
    languages,
    ``,
    `## ${messages.seo.fullLabel}`,
    ``,
    `- [${messages.seo.fullLabel}](${siteUrl(origin, fullGuidePath(code))})`,
    ``,
    `## ${messages.seo.omitHeading}`,
    ``,
    `- [${messages.menus.title}](${siteUrl(origin, localePath("/menus", code))}): ${messages.menus.lead}`,
    `- [${messages.version.title}](${siteUrl(origin, localePath("/version", code))}): ${messages.version.lead}`,
    ``,
  ].join("\n");
}

function renderMarkdown(page: SeoPage, messages: Copy, code: LocaleCode, origin: string): string {
  const lines = [`# ${page.documentTitle}`, ``, page.description, ``];
  if (page.path === "/") lines.push(messages.seo.boundary, ``);
  lines.push(`[${messages.seo.htmlLabel}](${siteUrl(origin, localePath(page.path, code))})`, ``);
  if (page.faqs.length) {
    lines.push(`## ${messages.seo.faqHeading}`, ``);
    for (const item of page.faqs) lines.push(`### ${item.q}`, ``, item.a, ``);
  }
  const related = relatedSeoPages(messages, page);
  if (related.length) {
    lines.push(`## ${messages.seo.relatedHeading}`, ``);
    for (const item of related) {
      lines.push(`- [${item.heading}](${siteUrl(origin, markdownFilePath(item.path, code))}): ${item.description}`);
    }
    lines.push(``);
  }
  if (page.path === "/") {
    const pages = buildSeoPages(messages);
    for (const group of ["ai", "local", "info"] as const) {
      lines.push(`## ${groupLabel(messages, group)}`, ``);
      for (const item of pages.filter((entry) => entry.group === group)) {
        lines.push(`- [${item.heading}](${siteUrl(origin, markdownFilePath(item.path, code))}): ${item.description}`);
      }
      lines.push(``);
    }
  }
  return lines.join("\n");
}

function renderLlmsFull(bundle: LocaleBundle, origin: string): string {
  const { messages, code } = bundle;
  const pages = buildSeoPages(messages).filter((page) => page.index);
  return [
    `# ${messages.appName}`,
    ``,
    `> ${messages.seo.homeDescription}`,
    ``,
    ...pages.flatMap((page) => [
      `## ${page.heading}`,
      ``,
      `- [${page.heading}](${siteUrl(origin, localePath(page.path, code))})`,
      ``,
      page.description,
      ``,
      ...page.faqs.flatMap((item) => [`### ${item.q}`, ``, item.a, ``]),
    ]),
    ``,
  ].join("\n");
}

export function localeBundles(): LocaleBundle[] {
  return locales.map((item) => ({ code: item.code, messages: catalogs[item.code] }));
}

export function discoveryFiles(origin = "", bundles: readonly LocaleBundle[] = localeBundles()): Record<string, string> {
  const sample = bundles.find((item) => item.code === defaultLocale) ?? bundles[0];
  if (!sample) throw new Error("没有语言包");
  const indexable = buildSeoPages(sample.messages).filter((page) => page.index);
  const urls = indexable.flatMap((page) =>
    bundles.map((bundle) => {
      const loc = siteUrl(origin, localePath(page.path, bundle.code));
      const links = [
        ...bundles.map((item) => {
          const href = siteUrl(origin, localePath(page.path, item.code));
          return `<xhtml:link rel="alternate" hreflang="${esc(localeByCode(item.code).language)}" href="${esc(href)}"/>`;
        }),
        `<xhtml:link rel="alternate" hreflang="x-default" href="${esc(siteUrl(origin, localePath(page.path, defaultLocale)))}"/>`,
      ].join("");
      return `<url><loc>${esc(loc)}</loc><lastmod>${seoRevision}</lastmod>${links}</url>`;
    }),
  );
  const sitemap = [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">`,
    ...urls,
    `</urlset>`,
    ``,
  ].join("\n");
  const robots = [
    `# 搜索引擎和生成式引擎都可以抓取这些工具页。`,
    `# Content-Signal 见 https://contentsignals.org/ 。search 是普通搜索，ai-input 是生成式回答引用，ai-train 是模型训练。`,
    `# 公开站点若要拒绝训练，把 ai-train 改成 no，并删掉对应的训练用爬虫分组。保留 User-agent: * 。`,
    ``,
    `User-agent: *`,
    `Content-Signal: search=yes, ai-input=yes, ai-train=yes`,
    `Allow: /`,
    ``,
    `User-agent: GPTBot`,
    `Allow: /`,
    ``,
    `User-agent: OAI-SearchBot`,
    `Allow: /`,
    ``,
    `User-agent: ChatGPT-User`,
    `Allow: /`,
    ``,
    `User-agent: ClaudeBot`,
    `Allow: /`,
    ``,
    `User-agent: Claude-SearchBot`,
    `Allow: /`,
    ``,
    `User-agent: Claude-User`,
    `Allow: /`,
    ``,
    `User-agent: PerplexityBot`,
    `Allow: /`,
    ``,
    `User-agent: Perplexity-User`,
    `Allow: /`,
    ``,
    `User-agent: Google-Extended`,
    `Allow: /`,
    ``,
    `User-agent: Applebot-Extended`,
    `Allow: /`,
    ``,
    `User-agent: Amazonbot`,
    `Allow: /`,
    ``,
    `User-agent: Meta-ExternalAgent`,
    `Allow: /`,
    ``,
    `User-agent: CCBot`,
    `Allow: /`,
    ``,
    `User-agent: Bytespider`,
    `Allow: /`,
    ``,
    `Sitemap: ${siteUrl(origin, "/sitemap.xml")}`,
    ``,
  ].join("\n");
  const files: Record<string, string> = { "robots.txt": robots, "sitemap.xml": sitemap };
  for (const bundle of bundles) {
    const prefix = localeByCode(bundle.code).prefix;
    files[prefix ? `${prefix}/llms.txt` : "llms.txt"] = renderLlms(bundle, origin, bundles);
    files[prefix ? `${prefix}/llms-full.txt` : "llms-full.txt"] = renderLlmsFull(bundle, origin);
    for (const page of buildSeoPages(bundle.messages)) {
      if (!page.index) continue;
      files[markdownFilePath(page.path, bundle.code).replace(/^\//, "")] = renderMarkdown(page, bundle.messages, bundle.code, origin);
    }
  }
  return files;
}

export function assertDiscoveryPatterns() {
  const files = discoveryFiles("");
  const required = [
    ["sitemap.xml", "<loc>/</loc>"],
    ["sitemap.xml", "<loc>/compress</loc>"],
    ["sitemap.xml", "<loc>/en/compress</loc>"],
    ["sitemap.xml", `<lastmod>${seoRevision}</lastmod>`],
    ["sitemap.xml", 'hreflang="en-US"'],
    ["sitemap.xml", 'hreflang="x-default"'],
    ["robots.txt", "Content-Signal: search=yes, ai-input=yes, ai-train=yes"],
    ["robots.txt", "Sitemap: /sitemap.xml"],
    ["llms.txt", "](/compress.md)"],
    ["llms.txt", "](/index.md)"],
    ["en/llms.txt", "](/en/compress.md)"],
    ["compress.md", "在线压缩图片，不上传"],
    ["en/compress.md", "](/en/resize.md)"],
  ] as const;
  for (const [name, pattern] of required) {
    if (!files[name]?.includes(pattern)) throw new Error(`${name} 缺少 ${pattern}`);
  }
  if (files["sitemap.xml"].includes("<loc>/menus</loc>") || files["sitemap.xml"].includes("<loc>/en/menus</loc>")) {
    throw new Error("功能菜单不应进入站点地图");
  }
  if (files["sitemap.xml"].includes("<loc>/version</loc>") || files["sitemap.xml"].includes("<loc>/en/version</loc>")) {
    throw new Error("版本页不应进入站点地图");
  }
  if (files["sitemap.xml"].includes("<loc>/compress.md</loc>")) throw new Error("Markdown 不应进入站点地图");
  const sample = `<html lang="zh-CN"><head><!--tucools-seo--><title>图酷</title><!--/tucools-seo--></head><body><noscript id="tucools-noscript"></noscript><div id="app"></div></body></html>`;
  const html = applySeoHtml(sample, "/compress", "", zh, "zh");
  const htmlChecks = [
    ["标题", "在线压缩图片，不上传 · 图酷"],
    ["markdown", 'type="text/markdown" href="/compress.md"'],
    ["describedby", 'rel="describedby" href="/llms.txt"'],
    ["正文", 'class="seo-fallback"'],
    ["相关工具", 'href="/resize"'],
    ["空 noscript", '<noscript id="tucools-noscript"></noscript>'],
  ] as const;
  for (const [name, pattern] of htmlChecks) {
    if (!html.includes(pattern)) throw new Error(`压缩页 HTML 缺少${name}`);
  }
  const aliasKeys = Object.keys(zh.seo.aliases).sort().join(",");
  for (const bundle of localeBundles()) {
    const keys = Object.keys(bundle.messages.seo.aliases).sort().join(",");
    if (keys !== aliasKeys) throw new Error(`${bundle.code} 的旧工具名称不完整`);
    if (!bundle.messages.seo.legacyQuestion.includes("{name}") || !bundle.messages.seo.legacyAnswer.includes("{name}")) {
      throw new Error(`${bundle.code} 的旧工具说明缺少 {name}`);
    }
  }
  if (!files["compress.md"]?.includes("图片压缩") || !files["compress.md"]?.includes("EasyImage")) {
    throw new Error("压缩说明没有 EasyImage 对应名称");
  }
  if (!files["llms.txt"]?.includes("TuCools") || !files["llms.txt"]?.includes("简单图片")) {
    throw new Error("简体中文 llms.txt 没有品牌别名");
  }
  if (!html.includes('name="keywords"') || !html.includes("TuCools") || !html.includes("简单图片")) {
    throw new Error("压缩页 HTML 缺少品牌关键词");
  }
  if (html.includes("https://easyimage.work/")) throw new Error("未设置站点根时不应写入 easyimage.work 绝对地址");
  const enHtml = applySeoHtml(sample, "/compress", "https://easyimage.work", catalogs.en, "en");
  if (!enHtml.includes("TuCools")) throw new Error("英语压缩页没有 TuCools");
  const selfSameAs = `"sameAs":["${projectRepo}","https://easyimage.work/"]`;
  if (enHtml.includes(selfSameAs)) throw new Error("部署在 easyimage.work 时不应把本站写成 sameAs");
  const other = applySeoHtml(sample, "/", "https://tucools.example", zh, "zh");
  if (!other.includes(selfSameAs)) throw new Error("其他域名应在 sameAs 中保留 easyimage.work");
}
