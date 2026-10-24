import type { ConverterImage } from "./type";
import {
  blobToDataUrl,
  canvasToBlob,
  fileToImage,
  scaleToMaxEdge,
} from "./image";
import { canvasToIcoBlob } from "./ico";

function mimeFor(format: string) {
  if (format === "jpg" || format === "jpeg" || format === "jfif") return "image/jpeg";
  if (format === "tif" || format === "tiff") return "image/tiff";
  if (format === "ico") return "image/x-icon";
  if (format === "svg") return "image/svg+xml";
  return `image/${format}`;
}

async function thumbnailDataUrl(canvas: HTMLCanvasElement) {
  const thumb = scaleToMaxEdge(canvas, canvas.width, canvas.height, 250);
  if (thumb.width > 200 && thumb.height > 200) {
    const fitted = scaleToMaxEdge(canvas, canvas.width, canvas.height, 200);
    return blobToDataUrl(await canvasToBlob(fitted, "image/png"));
  }
  return blobToDataUrl(await canvasToBlob(thumb, "image/png"));
}

export async function convertImageFile(
  file: File,
  formats: string[]
): Promise<ConverterImage[]> {
  const image = await fileToImage(file);
  const canvas = document.createElement("canvas");
  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) return [];
  ctx.drawImage(image, 0, 0);
  const baseName = file.name.replace(/\.[^/.]+$/, "");
  const thumb = await thumbnailDataUrl(canvas);
  const results: ConverterImage[] = [];

  for (const format of formats) {
    try {
      if (format === "heic" || format === "heif") continue;
      let dataUrl = "";
      if (format === "ico") {
        const ico = await canvasToIcoBlob(canvas);
        dataUrl = await blobToDataUrl(ico);
      } else {
        const mime = mimeFor(format);
        const quality =
          mime === "image/jpeg" || mime === "image/webp" ? 0.8 : undefined;
        dataUrl = canvas.toDataURL(mime, quality);
      }
      results.push({
        name: baseName,
        original: dataUrl,
        thumbnail: thumb,
        type: format,
      });
    } catch (error) {
      console.error(`${format} conversion failed`, error);
    }
  }
  return results;
}
