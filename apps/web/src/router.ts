import { createRouter, createWebHistory } from "vue-router";
import { copy } from "@/content/zh";

const routes = [
  { path: "/", name: "home", component: () => import("@/pages/HomePage.vue"), meta: { title: copy.tools.home.title } },
  { path: "/compress", component: () => import("@/pages/CompressPage.vue"), meta: { title: copy.tools.compress.title } },
  { path: "/resize", component: () => import("@/pages/ResizePage.vue"), meta: { title: copy.tools.resize.title } },
  { path: "/converter", component: () => import("@/pages/ConverterPage.vue"), meta: { title: copy.tools.converter.title } },
  { path: "/cropping", component: () => import("@/pages/CropPage.vue"), meta: { title: copy.tools.cropping.title } },
  { path: "/id-photo", component: () => import("@/pages/FramePage.vue"), props: { kind: "id" }, meta: { title: copy.tools.idPhoto.title } },
  { path: "/sizes", component: () => import("@/pages/FramePage.vue"), props: { kind: "social" }, meta: { title: copy.tools.sizes.title } },
  { path: "/cutting", component: () => import("@/pages/CuttingPage.vue"), meta: { title: copy.tools.cutting.title } },
  { path: "/watermark", component: () => import("@/pages/WatermarkPage.vue"), props: { variant: "watermark" }, meta: { title: copy.tools.watermark.title } },
  { path: "/caption", component: () => import("@/pages/WatermarkPage.vue"), props: { variant: "caption" }, meta: { title: copy.tools.caption.title } },
  { path: "/fade", component: () => import("@/pages/FadePage.vue"), meta: { title: copy.tools.fade.title } },
  { path: "/tocircle", component: () => import("@/pages/CirclePage.vue"), meta: { title: copy.tools.tocircle.title } },
  { path: "/exif", component: () => import("@/pages/ExifPage.vue"), meta: { title: copy.tools.exif.title } },
  { path: "/pdf", component: () => import("@/pages/PdfPage.vue"), meta: { title: copy.tools.pdf.title } },
  { path: "/favicon", component: () => import("@/pages/FaviconPage.vue"), meta: { title: copy.tools.favicon.title } },
  { path: "/prompt", component: () => import("@/pages/PromptPage.vue"), meta: { title: copy.tools.prompt.title } },
  { path: "/pix", component: () => import("@/pages/PixPage.vue"), meta: { title: copy.tools.pix.title } },
  { path: "/cutout", component: () => import("@/pages/CutoutPage.vue"), meta: { title: copy.tools.cutout.title } },
  { path: "/enhance", component: () => import("@/pages/EnhancePage.vue"), meta: { title: copy.tools.enhance.title } },
  { path: "/erase", component: () => import("@/pages/ErasePage.vue"), meta: { title: copy.tools.erase.title } },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.afterEach((to) => {
  const title = typeof to.meta.title === "string" ? to.meta.title : copy.appName;
  document.title = title === copy.tools.home.title ? copy.appName : `${title} · ${copy.appName}`;
});
