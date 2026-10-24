/// <reference types="vite/client" />

export {};

declare global {
  interface Window {
    tucools?: {
      saveBytes: (filename: string, bytes: Uint8Array) => Promise<"saved" | "cancelled">;
    };
    adsbygoogle?: unknown[];
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}
