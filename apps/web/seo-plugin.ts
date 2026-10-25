import fs from "node:fs";
import path from "node:path";
import type { IncomingMessage, ServerResponse } from "node:http";
import { loadEnv, type Plugin } from "vite";
import { catalogs } from "./src/content/catalogs";
import { localeFromPath, localePath, locales } from "./src/locale";
import { applySeoHtml, assertDiscoveryPatterns, buildSeoPages, discoveryFiles, localeBundles } from "./src/seo";

function requestOrigin(req: IncomingMessage): string {
  const host = req.headers.host || "";
  if (!/^[A-Za-z0-9.-]+(:[0-9]+)?$/.test(host)) return "";
  const forwarded = req.headers["x-forwarded-proto"];
  const proto = forwarded === "https" ? "https" : "http";
  return `${proto}://${host}`;
}

function sendText(res: ServerResponse, type: string, body: string) {
  res.statusCode = 200;
  res.setHeader("content-type", type);
  res.end(body);
}

function siteOrigin(root: string): string {
  const fromProcess = process.env.VITE_SITE_URL;
  const fromFile = loadEnv("production", root, "VITE_").VITE_SITE_URL;
  return String(fromProcess || fromFile || "").trim().replace(/\/+$/, "");
}

export function seoPlugin(): Plugin {
  let root = process.cwd();
  return {
    name: "tucools-seo",
    configResolved(config) {
      root = config.root;
    },
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const pathName = (req.url || "").split("?")[0] || "/";
        const files = discoveryFiles(requestOrigin(req), localeBundles());
        const key = pathName.replace(/^\//, "");
        if (!Object.prototype.hasOwnProperty.call(files, key)) {
          next();
          return;
        }
        const type = key.endsWith(".xml")
          ? "application/xml; charset=utf-8"
          : key.endsWith(".md")
            ? "text/markdown; charset=utf-8"
            : "text/plain; charset=utf-8";
        sendText(res, type, files[key]);
      });
    },
    transformIndexHtml: {
      order: "pre",
      handler(html, ctx) {
        if (!ctx.server) return html;
        const request = ctx.originalUrl || ctx.path || "/";
        const code = localeFromPath(request);
        return applySeoHtml(html, request, "", catalogs[code], code);
      },
    },
    writeBundle(options) {
      const dir = options.dir;
      if (!dir) return;
      assertDiscoveryPatterns();
      const templatePath = path.join(dir, "index.html");
      const template = fs.readFileSync(templatePath, "utf8");
      const origin = siteOrigin(root);
      for (const locale of locales) {
        const messages = catalogs[locale.code];
        for (const page of buildSeoPages(messages)) {
          const urlPath = localePath(page.path, locale.code);
          const html = applySeoHtml(template, page.path, origin, messages, locale.code);
          const parts = urlPath.split("/").filter(Boolean);
          const file = parts.length ? path.join(dir, ...parts, "index.html") : path.join(dir, "index.html");
          fs.mkdirSync(path.dirname(file), { recursive: true });
          fs.writeFileSync(file, html);
        }
      }
      for (const [fileName, source] of Object.entries(discoveryFiles(origin, localeBundles()))) {
        const dest = path.join(dir, fileName);
        fs.mkdirSync(path.dirname(dest), { recursive: true });
        fs.writeFileSync(dest, source);
      }
    },
  };
}
