import { defineConfig, type Plugin } from "vite";
import vue from "@vitejs/plugin-vue";
import { fileURLToPath, URL } from "node:url";

function appConfigPlugin(): Plugin {
  return {
    name: "tucools-app-config",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const path = (req.url || "").split("?")[0];
        if (path !== "/app-config.json") {
          next();
          return;
        }
        const raw = String(process.env.TUCOOLS_FEATURES || "").replace(/[^A-Za-z0-9,-]/g, "");
        res.setHeader("content-type", "application/json; charset=utf-8");
        res.setHeader("cache-control", "no-store");
        res.end(JSON.stringify({ features: raw }));
      });
    },
  };
}

export default defineConfig({
  plugins: [
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
    port: 5173,
    proxy: {
      "/api/engine": "http://127.0.0.1:8787",
    },
  },
});
