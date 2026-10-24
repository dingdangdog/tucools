import { installAds, parseAdsenseClient, parseAdsenseSlot, type AdsPublic } from "@/ads";

export type RuntimeConfig = AdsPublic & { features: string };

const empty: RuntimeConfig = { features: "", adsenseClient: "", adsenseSlot: "" };

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
    };
    const adsenseClient = parseAdsenseClient(typeof data.adsenseClient === "string" ? data.adsenseClient : "");
    return {
      features: typeof data.features === "string" ? data.features : "",
      adsenseClient,
      adsenseSlot: adsenseClient && typeof data.adsenseSlot === "string" ? parseAdsenseSlot(data.adsenseSlot) : "",
    };
  } catch {
    return empty;
  }
}
