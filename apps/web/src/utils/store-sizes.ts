// 像素来自 2026-10-24 的商店公开规范，说明见 design/006-store-sizes.md。

export const storeGroupOrder = ["iphone", "ipad", "mac", "duo", "play", "chrome"] as const;

export type StoreGroup = (typeof storeGroupOrder)[number];
export type StoreFit = "contain" | "cover" | "stretch" | "tile";
export type StoreOrientation = "portrait" | "landscape" | "both";

export interface StorePreset {
  id: string;
  groups: StoreGroup[];
  width: number;
  height: number;
  rotatable: boolean;
  recommended: boolean;
}

export const storePresets: StorePreset[] = [
  { id: "iphone-1206x2622", groups: ["iphone"], width: 1206, height: 2622, rotatable: true, recommended: true },
  { id: "iphone-1179x2556", groups: ["iphone"], width: 1179, height: 2556, rotatable: true, recommended: false },
  { id: "iphone-1320x2868", groups: ["iphone"], width: 1320, height: 2868, rotatable: true, recommended: true },
  { id: "iphone-1290x2796", groups: ["iphone"], width: 1290, height: 2796, rotatable: true, recommended: false },
  { id: "iphone-1260x2736", groups: ["iphone"], width: 1260, height: 2736, rotatable: true, recommended: false },
  { id: "iphone-1284x2778", groups: ["iphone"], width: 1284, height: 2778, rotatable: true, recommended: false },
  { id: "iphone-1242x2688", groups: ["iphone"], width: 1242, height: 2688, rotatable: true, recommended: false },
  { id: "iphone-1170x2532", groups: ["iphone"], width: 1170, height: 2532, rotatable: true, recommended: false },
  { id: "iphone-1242x2208", groups: ["iphone"], width: 1242, height: 2208, rotatable: true, recommended: false },
  { id: "ipad-2064x2752", groups: ["ipad"], width: 2064, height: 2752, rotatable: true, recommended: true },
  { id: "ipad-2048x2732", groups: ["ipad"], width: 2048, height: 2732, rotatable: true, recommended: false },
  { id: "ipad-1668x2420", groups: ["ipad"], width: 1668, height: 2420, rotatable: true, recommended: false },
  { id: "ipad-1488x2266", groups: ["ipad"], width: 1488, height: 2266, rotatable: true, recommended: false },
  { id: "mac-2880x1800", groups: ["mac"], width: 2880, height: 1800, rotatable: false, recommended: true },
  { id: "mac-2560x1600", groups: ["mac"], width: 2560, height: 1600, rotatable: false, recommended: false },
  { id: "mac-1440x900", groups: ["mac"], width: 1440, height: 900, rotatable: false, recommended: false },
  { id: "mac-1280x800", groups: ["mac"], width: 1280, height: 800, rotatable: false, recommended: false },
  { id: "duo-1398x2034", groups: ["duo"], width: 1398, height: 2034, rotatable: true, recommended: true },
  { id: "duo-2007x2853", groups: ["duo"], width: 2007, height: 2853, rotatable: true, recommended: true },
  { id: "apple-1024", groups: ["iphone", "ipad", "mac", "duo"], width: 1024, height: 1024, rotatable: false, recommended: true },
  { id: "play-512", groups: ["play"], width: 512, height: 512, rotatable: false, recommended: true },
  { id: "play-1024x500", groups: ["play"], width: 1024, height: 500, rotatable: false, recommended: true },
  { id: "play-1080x1920", groups: ["play"], width: 1080, height: 1920, rotatable: true, recommended: true },
  { id: "play-1440x2560", groups: ["play"], width: 1440, height: 2560, rotatable: true, recommended: false },
  { id: "play-1280x720", groups: ["play"], width: 1280, height: 720, rotatable: false, recommended: false },
  { id: "play-384", groups: ["play"], width: 384, height: 384, rotatable: false, recommended: false },
  { id: "chrome-128", groups: ["chrome"], width: 128, height: 128, rotatable: false, recommended: true },
  { id: "chrome-1280x800", groups: ["chrome"], width: 1280, height: 800, rotatable: false, recommended: true },
  { id: "chrome-640x400", groups: ["chrome"], width: 640, height: 400, rotatable: false, recommended: false },
  { id: "chrome-440x280", groups: ["chrome"], width: 440, height: 280, rotatable: false, recommended: false },
  { id: "chrome-1400x560", groups: ["chrome"], width: 1400, height: 560, rotatable: false, recommended: false },
];

export interface StoreFrame {
  id: string;
  width: number;
  height: number;
  landscape: boolean;
}

export function storeFrames(selectedIds: readonly string[], orientation: StoreOrientation): StoreFrame[] {
  const wanted = new Set(selectedIds);
  const frames: StoreFrame[] = [];
  for (const preset of storePresets) {
    if (!wanted.has(preset.id)) continue;
    const modes: Array<"portrait" | "landscape"> = preset.rotatable
      ? orientation === "both"
        ? ["portrait", "landscape"]
        : [orientation]
      : ["portrait"];
    const seen = new Set<string>();
    for (const mode of modes) {
      const landscape = mode === "landscape";
      const width = landscape ? preset.height : preset.width;
      const height = landscape ? preset.width : preset.height;
      const key = `${width}x${height}`;
      if (seen.has(key)) continue;
      seen.add(key);
      frames.push({ id: preset.id, width, height, landscape });
    }
  }
  return frames;
}

export function storeFileName(frame: StoreFrame, extension: "png" | "jpg") {
  return `${frame.id}${frame.landscape ? "-landscape" : ""}.${extension}`;
}

export function drawStoreFrame(
  image: CanvasImageSource,
  sourceWidth: number,
  sourceHeight: number,
  targetWidth: number,
  targetHeight: number,
  fit: StoreFit,
  background: string
) {
  const canvas = document.createElement("canvas");
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx || sourceWidth < 1 || sourceHeight < 1) throw new Error("canvas");
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  if (background !== "rgba(0,0,0,0)") {
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, targetWidth, targetHeight);
  }
  if (fit === "stretch") {
    ctx.drawImage(image, 0, 0, targetWidth, targetHeight);
    return canvas;
  }
  if (fit === "tile") {
    const pattern = ctx.createPattern(image, "repeat");
    if (!pattern) throw new Error("canvas");
    ctx.fillStyle = pattern;
    ctx.fillRect(0, 0, targetWidth, targetHeight);
    return canvas;
  }
  const scale =
    fit === "cover"
      ? Math.max(targetWidth / sourceWidth, targetHeight / sourceHeight)
      : Math.min(targetWidth / sourceWidth, targetHeight / sourceHeight);
  const width = sourceWidth * scale;
  const height = sourceHeight * scale;
  ctx.drawImage(image, (targetWidth - width) / 2, (targetHeight - height) / 2, width, height);
  return canvas;
}
