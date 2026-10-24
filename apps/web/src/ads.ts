/** 发布商编号与广告位的校验。容器入口和安装包静态服务使用同一规则。 */

export const adsTxtAuthority = "f08c47fec0942fa0";

export type AdsPublic = {
  adsenseClient: string;
  adsenseSlot: string;
};

/** 接受 `ca-pub-`、`pub-` 或纯数字。合法时返回 `ca-pub-` 加 10 到 20 位数字。 */
export function parseAdsenseClient(raw: string | null | undefined): string {
  const text = String(raw ?? "").trim().toLowerCase();
  const prefixed = /^(?:ca-)?pub-(\d{10,20})$/.exec(text);
  const digits = prefixed?.[1] ?? (/^(\d{10,20})$/.exec(text)?.[1] || "");
  return digits ? `ca-pub-${digits}` : "";
}

/** AdSense 展示广告单元编号，6 到 20 位数字。 */
export function parseAdsenseSlot(raw: string | null | undefined): string {
  const text = String(raw ?? "").trim();
  return /^\d{6,20}$/.test(text) ? text : "";
}

export function adsFromEnv(env: {
  TUCOOLS_ADSENSE_CLIENT?: string;
  TUCOOLS_ADSENSE_SLOT?: string;
}): AdsPublic {
  const adsenseClient = parseAdsenseClient(env.TUCOOLS_ADSENSE_CLIENT);
  const adsenseSlot = adsenseClient ? parseAdsenseSlot(env.TUCOOLS_ADSENSE_SLOT) : "";
  return { adsenseClient, adsenseSlot };
}

export function adsTxtForClient(client: string): string {
  const parsed = parseAdsenseClient(client);
  if (!parsed) return "";
  return `google.com, ${parsed.replace(/^ca-/, "")}, DIRECT, ${adsTxtAuthority}\n`;
}

export function installAds(config: AdsPublic) {
  const client = parseAdsenseClient(config.adsenseClient);
  if (!client || typeof document === "undefined") return;
  if (!document.querySelector('meta[name="google-adsense-account"]')) {
    const meta = document.createElement("meta");
    meta.name = "google-adsense-account";
    meta.content = client;
    document.head.appendChild(meta);
  }
  if (document.querySelector("script[data-tucools-adsense]")) return;
  const script = document.createElement("script");
  script.async = true;
  script.dataset.tucoolsAdsense = "";
  script.crossOrigin = "anonymous";
  script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(client)}`;
  document.head.appendChild(script);
}
