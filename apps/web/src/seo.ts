import { catalogs } from "./content/catalogs";
import type { Copy } from "./content/zh";
import { zh } from "./content/zh";
import { defaultLocale, localeByCode, localePath, locales, stripLocale, type LocaleCode } from "./locale";

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
  description: string;
  faqs: readonly SeoFaq[];
}

function toolSpecs(messages: Copy): ToolSpec[] {
  return [
    { id: "cutout", path: "/cutout", group: "ai", title: messages.tools.cutout.title, ...messages.seo.tools.cutout },
    { id: "enhance", path: "/enhance", group: "ai", title: messages.tools.enhance.title, ...messages.seo.tools.enhance },
    { id: "erase", path: "/erase", group: "ai", title: messages.tools.erase.title, ...messages.seo.tools.erase },
    { id: "compress", path: "/compress", group: "local", title: messages.tools.compress.title, ...messages.seo.tools.compress },
    { id: "resize", path: "/resize", group: "local", title: messages.tools.resize.title, ...messages.seo.tools.resize },
    { id: "converter", path: "/converter", group: "local", title: messages.tools.converter.title, ...messages.seo.tools.converter },
    { id: "cropping", path: "/cropping", group: "local", title: messages.tools.cropping.title, ...messages.seo.tools.cropping },
    { id: "id-photo", path: "/id-photo", group: "local", title: messages.tools.idPhoto.title, ...messages.seo.tools["id-photo"] },
    { id: "sizes", path: "/sizes", group: "local", title: messages.tools.sizes.title, ...messages.seo.tools.sizes },
    { id: "store", path: "/store", group: "local", title: messages.tools.store.title, ...messages.seo.tools.store },
    { id: "cutting", path: "/cutting", group: "local", title: messages.tools.cutting.title, ...messages.seo.tools.cutting },
    { id: "watermark", path: "/watermark", group: "local", title: messages.tools.watermark.title, ...messages.seo.tools.watermark },
    { id: "caption", path: "/caption", group: "local", title: messages.tools.caption.title, ...messages.seo.tools.caption },
    { id: "fade", path: "/fade", group: "local", title: messages.tools.fade.title, ...messages.seo.tools.fade },
    { id: "tocircle", path: "/tocircle", group: "local", title: messages.tools.tocircle.title, ...messages.seo.tools.tocircle },
    { id: "pdf", path: "/pdf", group: "local", title: messages.tools.pdf.title, ...messages.seo.tools.pdf },
    { id: "favicon", path: "/favicon", group: "local", title: messages.tools.favicon.title, ...messages.seo.tools.favicon },
    { id: "exif", path: "/exif", group: "info", title: messages.tools.exif.title, ...messages.seo.tools.exif },
    { id: "pix", path: "/pix", group: "info", title: messages.tools.pix.title, ...messages.seo.tools.pix },
    { id: "prompt", path: "/prompt", group: "info", title: messages.tools.prompt.title, ...messages.seo.tools.prompt },
  ];
}

function pageOf(
  messages: Copy,
  spec: {
    id: string;
    path: string;
    group: SeoGroup;
    heading: string;
    description: string;
    faqs: readonly SeoFaq[];
    index: boolean;
  },
): SeoPage {
  return {
    ...spec,
    documentTitle: spec.path === "/" ? messages.appName : `${spec.heading} · ${messages.appName}`,
  };
}

export function buildSeoPages(messages: Copy): SeoPage[] {
  return [
    pageOf(messages, {
      id: "home",
      path: "/",
      group: "home",
      heading: messages.appName,
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

interface HeadTag {
  id: string;
  tag: "meta" | "link";
  attrs: Record<string, string>;
}

export function jsonLd(page: SeoPage, origin: string, messages: Copy, code: LocaleCode): unknown {
  const locale = localeByCode(code);
  const url = siteUrl(origin, localePath(page.path, code));
  const home = siteUrl(origin, localePath("/", code));
  const pages = buildSeoPages(messages);
  const graph: Record<string, unknown>[] = [];
  if (page.path === "/") {
    graph.push({
      "@type": "WebSite",
      name: messages.appName,
      url,
      description: page.description,
      inLanguage: locale.language,
    });
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
    url,
    description: page.description,
    inLanguage: locale.language,
    isAccessibleForFree: true,
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
    {
      id: "tucools-robots",
      tag: "meta",
      attrs: { name: "robots", content: page.index ? "index, follow" : "noindex, follow" },
    },
    { id: "tucools-canonical", tag: "link", attrs: { rel: "canonical", href: url } },
    ...alternates,
    { id: "tucools-og-title", tag: "meta", attrs: { property: "og:title", content: page.documentTitle } },
    { id: "tucools-og-description", tag: "meta", attrs: { property: "og:description", content: page.description } },
    { id: "tucools-og-url", tag: "meta", attrs: { property: "og:url", content: url } },
    { id: "tucools-og-type", tag: "meta", attrs: { property: "og:type", content: "website" } },
    { id: "tucools-og-site", tag: "meta", attrs: { property: "og:site_name", content: messages.appName } },
    { id: "tucools-og-locale", tag: "meta", attrs: { property: "og:locale", content: locale.og } },
    ...ogAlternates,
    { id: "tucools-og-image", tag: "meta", attrs: { property: "og:image", content: image } },
    { id: "tucools-twitter-card", tag: "meta", attrs: { name: "twitter:card", content: "summary" } },
    { id: "tucools-twitter-title", tag: "meta", attrs: { name: "twitter:title", content: page.documentTitle } },
    { id: "tucools-twitter-description", tag: "meta", attrs: { name: "twitter:description", content: page.description } },
    { id: "tucools-twitter-image", tag: "meta", attrs: { name: "twitter:image", content: image } },
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

export function renderNoscript(page: SeoPage, messages: Copy, code: LocaleCode): string {
  const home = page.path === "/" ? "" : `<p><a href="${esc(localePath("/", code))}">${esc(messages.seo.backHome)}</a></p>`;
  const links = page.path === "/" ? renderHomeLinks(messages, code) : "";
  return `<article><h1>${esc(page.heading)}</h1><p>${esc(page.description)}</p>${renderFaqs(page, messages)}${links}${home}</article>`;
}

export function applySeoHtml(html: string, requestPath: string, origin: string, messages: Copy, code: LocaleCode): string {
  const page = seoPageFor(messages, requestPath);
  const locale = localeByCode(code);
  const block = `<!--tucools-seo-->\n    ${renderSeoBlock(page, origin, messages, code)}\n    <!--/tucools-seo-->`;
  const noscript = `<noscript id="tucools-noscript">${renderNoscript(page, messages, code)}</noscript>`;
  if (!/<!--tucools-seo-->[\s\S]*?<!--\/tucools-seo-->/.test(html)) throw new Error("index.html 缺少 tucools-seo 标记");
  if (!/<noscript id="tucools-noscript">[\s\S]*?<\/noscript>/.test(html)) throw new Error("index.html 缺少 tucools-noscript");
  return html
    .replace(/<html\b[^>]*>/i, `<html lang="${esc(locale.language)}" dir="${locale.dir}">`)
    .replace(/<!--tucools-seo-->[\s\S]*?<!--\/tucools-seo-->/, block)
    .replace(/<noscript id="tucools-noscript">[\s\S]*?<\/noscript>/, noscript);
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
        .map((page) => `- [${page.heading}](${siteUrl(origin, localePath(page.path, code))}): ${page.description}`);
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
    `- [${messages.appName}](${siteUrl(origin, localePath("/", code))}): ${messages.seo.homeDescription}`,
    ``,
    sections,
    ``,
    `## ${messages.language}`,
    ``,
    languages,
    ``,
    `## ${messages.seo.omitHeading}`,
    ``,
    `- [${messages.menus.title}](${siteUrl(origin, localePath("/menus", code))}): ${messages.menus.lead}`,
    ``,
  ].join("\n");
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
      return `<url><loc>${esc(loc)}</loc>${links}</url>`;
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
    `# 公开站点若要关闭某一类生成式引擎，保留 User-agent: * ，并删掉对应分组。`,
    ``,
    `User-agent: *`,
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
    `User-agent: PerplexityBot`,
    `Allow: /`,
    ``,
    `User-agent: Google-Extended`,
    `Allow: /`,
    ``,
    `User-agent: Applebot-Extended`,
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
  }
  return files;
}

export function assertDiscoveryPatterns() {
  const files = discoveryFiles("");
  const required = [
    ["sitemap.xml", "<loc>/</loc>"],
    ["sitemap.xml", "<loc>/compress</loc>"],
    ["sitemap.xml", "<loc>/en/compress</loc>"],
    ["sitemap.xml", 'hreflang="en-US"'],
    ["sitemap.xml", 'hreflang="x-default"'],
    ["robots.txt", "Sitemap: /sitemap.xml"],
    ["llms.txt", "](/compress)"],
    ["llms.txt", "](/)"],
    ["en/llms.txt", "](/en/compress)"],
  ] as const;
  for (const [name, pattern] of required) {
    if (!files[name]?.includes(pattern)) throw new Error(`${name} 缺少 ${pattern}`);
  }
  if (files["sitemap.xml"].includes("<loc>/menus</loc>") || files["sitemap.xml"].includes("<loc>/en/menus</loc>")) {
    throw new Error("功能菜单不应进入站点地图");
  }
}
