import { installAds, parseAdsenseClient, parseAdsenseSlot, type AdsPublic } from "@/ads";
import { installAnalytics, parseAnalyticsId } from "@/analytics";
import { parseIcpNumber } from "@/icp";

export type RuntimeConfig = AdsPublic & { features: string; analyticsId: string; icpNumber: string };

const empty: RuntimeConfig = { features: "", adsenseClient: "", adsenseSlot: "", analyticsId: "", icpNumber: "" };

let current: RuntimeConfig | null = null;
let pending: Promise<RuntimeConfig> | null = null;

export function runtimeConfigNow(): RuntimeConfig | null {
  return current;
}

export function loadRuntimeConfig(): Promise<RuntimeConfig> {
  if (!pending) {
    pending = readRuntimeConfig().then((config) => {
      current = config;
      installAds(config);
      installAnalytics(config.analyticsId);
      return config;
    });
  }
  return pending;
}

async function readRuntimeConfig(): Promise<RuntimeConfig> {
  try {
    const response = await fetch("/app-config.json", {
      cache: "no-store",
      signal: AbortSignal.timeout(3000),
    });
    if (!response.ok) return empty;
    const data = (await response.json()) as {
      features?: unknown;
      adsenseClient?: unknown;
      adsenseSlot?: unknown;
      analyticsId?: unknown;
      icpNumber?: unknown;
    };
    const adsenseClient = parseAdsenseClient(typeof data.adsenseClient === "string" ? data.adsenseClient : "");
    return {
      features: typeof data.features === "string" ? data.features : "",
      adsenseClient,
      adsenseSlot: adsenseClient && typeof data.adsenseSlot === "string" ? parseAdsenseSlot(data.adsenseSlot) : "",
      analyticsId: parseAnalyticsId(typeof data.analyticsId === "string" ? data.analyticsId : ""),
      icpNumber: parseIcpNumber(typeof data.icpNumber === "string" ? data.icpNumber : ""),
    };
  } catch {
    return empty;
  }
}
