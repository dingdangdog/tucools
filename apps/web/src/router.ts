import { createRouter, createWebHistory, type RouteLocationNormalized, type RouteRecordRaw } from "vue-router";
import { trackPageView } from "@/analytics";
import { applyDocumentSeo } from "@/apply-seo";
import { applyCatalog } from "@/content";
import { featureIdFromPath } from "@/features";
import {
  defaultLocale,
  localeFromParam,
  localePath,
  localePattern,
  readSavedLocale,
  stripLocale,
  systemLocale,
} from "@/locale";
import { assertSamePaths } from "@/seo";
import { useMenuStore } from "@/stores/menus";

const pageRoutes: RouteRecordRaw[] = [
  { path: "/", name: "home", component: () => import("@/pages/HomePage.vue") },
  { path: "/menus", component: () => import("@/pages/MenusPage.vue") },
  { path: "/compress", component: () => import("@/pages/CompressPage.vue") },
  { path: "/resize", component: () => import("@/pages/ResizePage.vue") },
  { path: "/converter", component: () => import("@/pages/ConverterPage.vue") },
  { path: "/cropping", component: () => import("@/pages/CropPage.vue") },
  { path: "/id-photo", component: () => import("@/pages/FramePage.vue"), props: { kind: "id" } },
  { path: "/sizes", component: () => import("@/pages/FramePage.vue"), props: { kind: "social" } },
  { path: "/store", component: () => import("@/pages/StorePage.vue") },
  { path: "/cutting", component: () => import("@/pages/CuttingPage.vue") },
  { path: "/watermark", component: () => import("@/pages/WatermarkPage.vue"), props: { variant: "watermark" } },
  { path: "/caption", component: () => import("@/pages/WatermarkPage.vue"), props: { variant: "caption" } },
  { path: "/fade", component: () => import("@/pages/FadePage.vue") },
  { path: "/tocircle", component: () => import("@/pages/CirclePage.vue") },
  { path: "/exif", component: () => import("@/pages/ExifPage.vue") },
  { path: "/pdf", component: () => import("@/pages/PdfPage.vue") },
  { path: "/favicon", component: () => import("@/pages/FaviconPage.vue") },
  { path: "/prompt", component: () => import("@/pages/PromptPage.vue") },
  { path: "/pix", component: () => import("@/pages/PixPage.vue") },
  { path: "/cutout", component: () => import("@/pages/CutoutPage.vue") },
  { path: "/enhance", component: () => import("@/pages/EnhancePage.vue") },
  { path: "/erase", component: () => import("@/pages/ErasePage.vue") },
];

assertSamePaths(pageRoutes.map((route) => route.path));

function withLocale(route: RouteRecordRaw): RouteRecordRaw {
  const { name, ...rest } = route;
  const path = route.path === "/" ? `/:locale(${localePattern})` : `/:locale(${localePattern})${route.path}`;
  return { ...rest, path };
}

const notFound = () => import("@/pages/NotFoundPage.vue");

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    ...pageRoutes,
    ...pageRoutes.map(withLocale),
    { path: "/zh", redirect: "/" },
    {
      path: "/zh/:rest(.*)",
      redirect: (to) => ({ path: `/${String(to.params.rest ?? "")}`, query: to.query, hash: to.hash }),
    },
    { path: `/:locale(${localePattern})/:pathMatch(.*)*`, component: notFound },
    { path: "/:pathMatch(.*)*", name: "not-found", component: notFound },
  ],
});

function entryRedirect(to: RouteLocationNormalized): string | null {
  if (typeof to.params.locale === "string") return null;
  if (stripLocale(to.path) !== "/") return null;
  // 只在进入根地址时采用已保存语言。语言菜单会先写入选择，避免切回简体中文时仍读到上一种语言。
  const saved = readSavedLocale();
  const next = saved ?? (window.tucools ? systemLocale() : null);
  if (!next || next === defaultLocale) return null;
  const target = localePath("/", next);
  return target === to.path ? null : target;
}

router.beforeEach((to) => {
  const entry = entryRedirect(to);
  if (entry) return entry;
  const code = localeFromParam(to.params.locale);
  applyCatalog(code);
  const id = featureIdFromPath(to.path);
  if (!id) return true;
  const menus = useMenuStore();
  if (!menus.ready || menus.isVisible(id)) return true;
  return localePath("/", code);
});

router.afterEach((to) => {
  applyDocumentSeo(to.path);
  trackPageView(to.fullPath);
});
