import { canvasToBlob, scaleToMaxEdge } from "./image";

export type CompressFormat = "jpeg" | "png" | "webp";

export interface CompressOptions {
  format: CompressFormat;
  quality: number;
  maxEdge: number;
  targetBytes: number;
}

export interface CompressResult {
  blob: Blob;
  width: number;
  height: number;
}

const mimeFor: Record<CompressFormat, string> = {
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
};

async function exportAt(
  image: HTMLImageElement,
  edge: number,
  format: CompressFormat,
  quality: number
): Promise<CompressResult> {
  const canvas = scaleToMaxEdge(
    image,
    image.naturalWidth,
    image.naturalHeight,
    edge
  );
  const blob = await canvasToBlob(
    canvas,
    mimeFor[format],
    format === "png" ? undefined : quality
  );
  return { blob, width: canvas.width, height: canvas.height };
}

export async function compressImage(
  image: HTMLImageElement,
  options: CompressOptions
): Promise<CompressResult> {
  const startEdge =
    options.maxEdge > 0
      ? options.maxEdge
      : Math.max(image.naturalWidth, image.naturalHeight);
  const minEdge = 64;

  if (!options.targetBytes) {
    return exportAt(image, startEdge, options.format, options.quality);
  }

  if (options.format === "png") {
    let edge = startEdge;
    let best = await exportAt(image, edge, "png", 1);
    while (
      best.blob.size > options.targetBytes &&
      Math.max(best.width, best.height) > minEdge
    ) {
      edge = Math.max(minEdge, Math.floor(edge * 0.85));
      best = await exportAt(image, edge, "png", 1);
      if (edge <= minEdge) break;
    }
    return best;
  }

  let edge = startEdge;
  let best = await exportAt(image, edge, options.format, options.quality);
  for (let attempt = 0; attempt < 8 && best.blob.size > options.targetBytes; attempt++) {
    let low = 0.1;
    let high = Math.min(Math.max(options.quality, 0.1), 0.95);
    let chosen = await exportAt(image, edge, options.format, low);
    if (chosen.blob.size <= options.targetBytes) {
      best = chosen;
      for (let step = 0; step < 7; step++) {
        const mid = (low + high) / 2;
        const trial = await exportAt(image, edge, options.format, mid);
        if (trial.blob.size > options.targetBytes) {
          high = mid;
        } else {
          low = mid;
          best = trial;
        }
      }
      return best;
    }
    best = chosen;
    if (Math.max(best.width, best.height) <= minEdge) return best;
    edge = Math.max(minEdge, Math.floor(edge * 0.85));
    best = await exportAt(image, edge, options.format, options.quality);
  }
  return best;
}
