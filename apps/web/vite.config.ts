import { defineConfig, type Plugin } from "vite";
import vue from "@vitejs/plugin-vue";
import { fileURLToPath, URL } from "node:url";
import { adsFromEnv, adsTxtForClient, parseAdsenseClient, parseAdsenseSlot } from "./src/ads";
import { parseAnalyticsId } from "./src/analytics";
import { parseIcpNumber } from "./src/icp";
import { seoPlugin } from "./seo-plugin";

function appConfigPlugin(): Plugin {
  let adsWarned = false;
  return {
    name: "tucools-app-config",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const path = (req.url || "").split("?")[0];
        if (path !== "/app-config.json" && path !== "/ads.txt") {
          next();
          return;
        }
        const clientRaw = String(process.env.TUCOOLS_ADSENSE_CLIENT || "").trim();
        const slotRaw = String(process.env.TUCOOLS_ADSENSE_SLOT || "").trim();
        const analyticsRaw = String(process.env.TUCOOLS_ANALYTICS_ID || "").trim();
        const icpRaw = String(process.env.TUCOOLS_ICP_NUMBER || "").trim();
        const ads = adsFromEnv(process.env);
        const analyticsId = parseAnalyticsId(analyticsRaw);
        const icpNumber = parseIcpNumber(icpRaw);
        if (!adsWarned) {
          adsWarned = true;
          if (clientRaw && !parseAdsenseClient(clientRaw)) {
            console.warn("忽略 TUCOOLS_ADSENSE_CLIENT：需要 ca-pub- 加 10 到 20 位数字，也可以只写数字。");
          }
          if (slotRaw && !parseAdsenseSlot(slotRaw)) {
            console.warn("忽略 TUCOOLS_ADSENSE_SLOT：需要 6 到 20 位数字。");
          } else if (slotRaw && !ads.adsenseClient) {
            console.warn("忽略 TUCOOLS_ADSENSE_SLOT：还没有有效的 TUCOOLS_ADSENSE_CLIENT。");
          }
          if (analyticsRaw && !analyticsId) {
            console.warn("忽略 TUCOOLS_ANALYTICS_ID：需要 G- 加 6 到 20 位字母或数字。");
          }
          if (icpRaw && !icpNumber) {
            console.warn("忽略 TUCOOLS_ICP_NUMBER：需要形如「京ICP备12345678号」，可以带「-1」。");
          }
        }
        res.setHeader("cache-control", "no-store");
        if (path === "/ads.txt") {
          const body = adsTxtForClient(ads.adsenseClient);
          if (!body) {
            res.statusCode = 404;
            res.end();
            return;
          }
          res.setHeader("content-type", "text/plain; charset=utf-8");
          res.end(body);
          return;
        }
        const raw = String(process.env.TUCOOLS_FEATURES || "").replace(/[^A-Za-z0-9,-]/g, "");
        res.setHeader("content-type", "application/json; charset=utf-8");
        res.end(JSON.stringify({ features: raw, ...ads, analyticsId, icpNumber }));
      });
    },
  };
}

export default defineConfig({
  plugins: [
    seoPlugin(),
    appConfigPlugin(),
    vue({
      template: {
        compilerOptions: {
          isCustomElement: (tag) => tag.startsWith("cropper-"),
        },
      },
    }),
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    host: "127.0.0.1",
    port: 13175,
    proxy: {
      "/api/engine": "http://127.0.0.1:8787",
    },
  },
});
