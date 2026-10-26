/// <reference types="vite/client" />

export {};

declare global {
  interface Window {
    tucools?: {
      saveBytes: (filename: string, bytes: Uint8Array) => Promise<"saved" | "cancelled">;
      downloadModelPack?: () => Promise<{ ok: true; directory: string } | { ok: false; code: string }>;
      cancelModelPack?: () => Promise<void>;
      modelPackDirectory?: () => Promise<string>;
      onModelPackProgress?: (
        callback: (progress: { phase: "downloading" | "extracting"; received: number; total: number }) => void,
      ) => () => void;
    };
    adsbygoogle?: unknown[];
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}
