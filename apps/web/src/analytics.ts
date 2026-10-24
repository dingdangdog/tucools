/** Google Analytics 4 测量 ID。容器入口和安装包静态服务使用同一规则。 */

let measurementId = "";

/** 接受 `G-` 加 6 到 20 位字母或数字，大小写不限。 */
export function parseAnalyticsId(raw: string | null | undefined): string {
  const text = String(raw ?? "").trim().toUpperCase();
  return /^G-[A-Z0-9]{6,20}$/.test(text) ? text : "";
}

/** 与 easyimage 相同：先写入 dataLayer 和 gtag，再加载 gtag.js。不在此时发送浏览，避免单页跳转被记两次。 */
export function installAnalytics(raw: string) {
  const id = parseAnalyticsId(raw);
  measurementId = id;
  if (!id || typeof document === "undefined") return;
  if (document.querySelector("script[data-tucools-analytics]")) return;
  const inline = document.createElement("script");
  inline.dataset.tucoolsAnalytics = "config";
  inline.textContent = [
    "window.dataLayer = window.dataLayer || [];",
    "function gtag(){dataLayer.push(arguments);}",
    "window.gtag = gtag;",
    "gtag('js', new Date());",
    `gtag('config', ${JSON.stringify(id)}, { send_page_view: false });`,
  ].join("\n");
  document.head.appendChild(inline);
  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`;
  document.head.appendChild(script);
}

/** 路由完成后发送当前地址。查询参数保留，片段不发送。 */
export function trackPageView(fullPath: string) {
  if (!measurementId || typeof window === "undefined" || typeof window.gtag !== "function") return;
  const pagePath = fullPath.split("#")[0] || "/";
  window.gtag("event", "page_view", {
    page_path: pagePath,
    page_location: `${window.location.origin}${pagePath}`,
    page_title: document.title,
    send_to: measurementId,
  });
}
